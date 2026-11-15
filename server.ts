import fs from "fs";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, ThinkingLevel, LiveServerMessage, Modality, Type } from "@google/genai";
import dotenv from "dotenv";
import { WebSocketServer, WebSocket } from "ws";
import { google } from "googleapis";
import multer from "multer";
import {
  evaluateIeltsWritingJsonFallback,
  evaluateIeltsWritingMarkdownFallback,
  evaluateIeltsSpeakingFallback
} from "./src/utils/ieltsFallbackEvaluator";

const upload = multer({ storage: multer.memoryStorage() });

process.env.DISABLE_HMR = "true";

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

dotenv.config();

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // API routes

  app.post("/api/upload-drive", upload.single("audio"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      
      const folderId = req.body.folderId || process.env.GOOGLE_DRIVE_FOLDER_ID || "1d2io0UUmFF6OItoG_HybPZLe_noI5uxy";
      const scriptUrl = "https://script.google.com/macros/s/AKfycbyV0-09yEzIFZSzI8VtSur12zfKlJpUs8pPnq2VwNd3DgHOSV18EnzNmX3XCWKNaPlx/exec";
      
      const base64Data = req.file.buffer.toString('base64');
      
      const payload = {
        name: req.body.filename || req.file.originalname || `speaking_test_${Date.now()}.webm`,
        mimeType: req.file.mimetype || "audio/webm",
        data: base64Data,
        folderId: folderId
      };

      const response = await fetch(scriptUrl, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain", // To avoid CORS preflight OPTIONS request
        },
        body: JSON.stringify(payload)
      });
      
      const resultText = await response.text();
      let result;
      try {
        result = JSON.parse(resultText);
      } catch (e) {
        console.error("Apps script response:", resultText);
        throw new Error("Invalid response from Apps Script: " + resultText.substring(0, 100));
      }

      // Check if it was successful based on common Apps Script responses
      if (result && (result.success || result.url || result.fileId || result.webViewLink)) {
        res.json({ 
          success: true, 
          fileId: result.fileId || result.id || "unknown",
          webViewLink: result.url || result.webViewLink || result.link || ""
        });
      } else {
        throw new Error(result.error || "Unknown error from Apps Script");
      }

    } catch (err) {
      console.error("Drive upload error (Apps Script):", err);
      res.status(500).json({ error: err?.message || "Failed to upload to Google Drive via Apps Script" });
    }
  });


  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Speaking Recordings Storage
  const SPEAKING_DIR = path.join(process.cwd(), "uploads", "speaking");
  if (!fs.existsSync(SPEAKING_DIR)) {
    fs.mkdirSync(SPEAKING_DIR, { recursive: true });
  }

  // Upload speaking recording from student test or admin manual upload
  app.post("/api/speaking/upload", upload.single("audio"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No audio file uploaded" });
      }

      const { submissionId, qId } = req.body;
      const originalExt = path.extname(req.file.originalname) || ".webm";
      const safeSubmissionId = (submissionId || "sub").replace(/[^a-zA-Z0-9_-]/g, "_");
      const safeQId = (qId || "rec").replace(/[^a-zA-Z0-9_-]/g, "_");
      const filename = `${safeSubmissionId}_${safeQId}${originalExt}`;
      const filePath = path.join(SPEAKING_DIR, filename);

      fs.writeFileSync(filePath, req.file.buffer);

      const audioUrl = `/api/speaking/audio/${filename}`;
      return res.json({
        success: true,
        url: audioUrl,
        filename,
        size: req.file.size
      });
    } catch (err: any) {
      console.error("Error saving speaking audio:", err);
      return res.status(500).json({ error: err.message || "Failed to save audio" });
    }
  });

  // Check if a speaking recording exists on server
  app.get("/api/speaking/check/:filename", (req, res) => {
    const filename = req.params.filename.replace(/[^a-zA-Z0-9_.-]/g, "_");
    const filePath = path.join(SPEAKING_DIR, filename);
    const exists = fs.existsSync(filePath);
    return res.json({ exists });
  });

  // Stream speaking recording with range support for audio playback/seeking
  app.get("/api/speaking/audio/:filename", (req, res) => {
    try {
      const filename = req.params.filename.replace(/[^a-zA-Z0-9_.-]/g, "_");
      const filePath = path.join(SPEAKING_DIR, filename);

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "Recording not found on server" });
      }

      const stat = fs.statSync(filePath);
      const ext = path.extname(filePath).toLowerCase();
      let contentType = "audio/webm";
      if (ext === ".mp3") contentType = "audio/mpeg";
      else if (ext === ".m4a" || ext === ".mp4") contentType = "audio/mp4";
      else if (ext === ".ogg") contentType = "audio/ogg";
      else if (ext === ".wav") contentType = "audio/wav";

      const range = req.headers.range;
      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;

        if (start >= stat.size) {
          res.status(416).send("Requested range not satisfiable\n" + start + " >= " + stat.size);
          return;
        }

        const chunksize = (end - start) + 1;
        const fileStream = fs.createReadStream(filePath, { start, end });
        res.writeHead(206, {
          "Content-Range": `bytes ${start}-${end}/${stat.size}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunksize,
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=86400"
        });
        fileStream.pipe(res);
      } else {
        res.writeHead(200, {
          "Content-Length": stat.size,
          "Content-Type": contentType,
          "Accept-Ranges": "bytes",
          "Cache-Control": "public, max-age=86400"
        });
        fs.createReadStream(filePath).pipe(res);
      }
    } catch (err: any) {
      console.error("Error streaming speaking audio:", err);
      res.status(500).send("Error streaming audio");
    }
  });

  app.get("/api/audio", async (req, res) => {
    try {
      const { id } = req.query;
      if (!id || typeof id !== 'string') {
        return res.status(400).send("Missing audio id");
      }
      const url = `https://drive.google.com/uc?export=download&id=${id}&confirm=t`;
      res.redirect(url);
    } catch (err) {
      console.error("Audio Proxy Error:", err);
      res.status(500).send("Failed to proxy audio.");
    }
  });

  app.post("/api/evaluate-writing", async (req, res) => {
    const { inputText, taskType, rawPrompt } = req.body;

    if (!inputText) {
      return res.status(400).json({ error: "Input text is required" });
    }

    const systemPrompt = `You are ERA AI, an expert IELTS Writing Examiner and English Language Correction Assistant trained to IELTS Band 9 standards.
Your primary role is to analyze a student's essay, identify every mistake, visually cross out incorrect words or phrases, provide corrections, explain the errors, estimate an IELTS band score, and rewrite the essay using natural academic English based STRICTLY on the rules from "Writing and speaking checklist.docx".

IMPORTANT RULES:
- CRITICAL INSTRUCTION: You MUST carefully read the provided IELTS Writing Task Question. Evaluate the student's response SPECIFICALLY against this prompt. If the student's response is off-topic, memorized, or fails to address the specific topic and requirements of the prompt, you MUST severely penalize the Task Achievement / Task Response score (Band 5.0 or lower).
- Never simply say "incorrect."
- Always provide a correction.
- Always explain why it is incorrect.
- Be strict like a real IELTS examiner. Detect both obvious and subtle errors.
- Preserve the student's original meaning whenever possible.
- Use British English spelling.
- Prioritize IELTS academic writing standards.
- Highlight every error using markdown strikethrough formatting (e.g., ~~incorrect~~).
- Give actionable advice for improving the band score.

TASK: When a student submits an IELTS Writing Task 1 or Task 2 essay, perform the following actions EXACTLY in this order:

## STEP 1: Display the Essay with Inline Corrections
Show the student's original essay while marking errors directly in the text.
Use this format exactly:
❌ Incorrect text: ~~incorrect~~
✅ Correction: **corrected version**
Correct every error related to Grammar, Vocabulary, Word choice, Collocations, Spelling, Punctuation, Articles, Prepositions, Subject-verb agreement, Tense consistency, Sentence structure, Formality, Academic style, Coherence and cohesion. Do not ignore minor mistakes.

## STEP 2: Error Analysis Table
Create a detailed markdown table after the corrections. Use this exact column format:
| Original | Correction | Error Type | Explanation |
|---|---|---|---|
(Include every major error found here)

## STEP 3: Grammar Issues Found
List all recurring grammar problems (e.g., Incorrect prepositions, Subject-verb agreement errors, Missing articles, Run-on sentences, Incorrect verb forms) using bullet points.

## STEP 4: Vocabulary Improvement
Identify Unnatural vocabulary, Incorrect collocations, Repetitive language, Informal expressions.
Suggest stronger Band 7–9 alternatives in a markdown table:
| Student's Word | Better Alternative |
|---|---|

## STEP 5: Sentence Improvement
Provide improved versions of weak sentences.
Format:
Original:
"..."
Improved:
"..."

## STEP 6: Fully Corrected Essay
Create a section called:
Fully Corrected Essay
Rewrite the entire essay with all mistakes corrected while preserving the student's ideas.
Make the essay:
- Grammatically accurate
- Natural sounding
- Academically appropriate
- IELTS-ready
Do not change the student's main argument.

## STEP 7: Official IELTS Band Score Estimation
STRICT EXAMINER MODE: Act as a certified IELTS examiner. Do not inflate scores. Apply the official public IELTS Writing Band Descriptors exactly as published. If a criterion falls between two bands, choose the lower band unless there is strong evidence that the higher descriptor is fully met.

Evaluate the essay using these four criteria based on the task type (Task 1 or Task 2):
1. Task Achievement (Task 1) / Task Response (Task 2): Assess if requirements are met, key features/positions clear, overview/development included.
2. Coherence and Cohesion: Assess logical organization, paragraphing, progression, linking devices, referencing.
3. Lexical Resource: Assess vocabulary range, precision, flexibility, collocations, spelling.
4. Grammatical Range and Accuracy: Assess complexity, sentence variety, grammar/punctuation accuracy, error frequency.

Provide a markdown table with detailed justifications referencing official descriptors. Before assigning a score, compare the essay directly with the official descriptors and explain exactly why the essay matches that band:
| Criterion | Band Score | Justification |
|---|---|---|
| Task Response / Task Achievement | X.X | [Detailed explanation referencing official descriptors] |
| Coherence & Cohesion | X.X | [Detailed explanation referencing official descriptors] |
| Lexical Resource | X.X | [Detailed explanation referencing official descriptors] |
| Grammatical Range & Accuracy | X.X | [Detailed explanation referencing official descriptors] |

**Overall Band Calculation:**
Calculate the Overall Writing Band using the average of the four criteria. Use official IELTS rounding rules:
- Average ending in .25 → round up to .5
- Average ending in .75 → round up to next whole band
- Average ending in .50 → keep .5
- Average ending in .00 → keep whole number

Show calculations:
*Average = (TR + CC + LR + GRA) ÷ 4 = X.XX*
**Final IELTS Band = X.X**

**Score Confidence:**
Likely Band: X.X
Range: X.X–X.X

## STEP 8: Improvement Roadmap
Reference the official IELTS descriptors when explaining weaknesses. Provide specific actionable points:
- **What Prevented Band 7:** ...
- **What Prevented Band 8:** ...
- **What Prevented Band 9:** ...

## STEP 9: Band 8 Sample Rewrite (Preserving Student Ideas)
Create a section called:
Band 8 Sample Rewrite
Rewrite the essay to solid IELTS Band 8.0 quality while preserving the student's own ideas, data selections (Task 1), and stance/arguments (Task 2).
Requirements:
- Preserve all original ideas and factual figures; do not invent contradictory data
- Natural academic vocabulary and accurate collocations
- Error-free complex grammatical structures
- Smooth paragraph cohesion and progression
- Zero remaining spelling, article, preposition, or punctuation errors

## STEP 10: Positive Feedback
Identify strengths.
Example:
### Strengths
🟢 Clear position throughout the essay.
🟢 Good paragraph organization.
🟢 Appropriate use of examples.
🟢 Attempts to use advanced vocabulary.

IMPORTANT RULES
- Apply identical analytical precision to both Task 1 and Task 2.
- Never simply say "incorrect."
- Always provide a correction.
- Always explain why it is incorrect.
- Be strict like a real IELTS examiner.
- Detect both obvious and subtle errors across every single sentence from start to finish.
- Preserve the student's original meaning whenever possible.
- Use British or consistent academic English spelling.
- Prioritize IELTS academic writing standards.
- Highlight every error using strikethrough formatting.
- Give actionable advice for improving the band score.
Your goal is to function as a professional IELTS examiner, grammar checker, writing coach, and Band 8 essay mentor simultaneously.`;

    try {
      if (!process.env.GEMINI_API_KEY) {
        const fallback = evaluateIeltsWritingMarkdownFallback(inputText, taskType, rawPrompt, "Official IELTS Examiner Rubric Assessment (Server Key Unconfigured)");
        return res.json({ feedback: fallback });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `Analyze the following IELTS ${taskType.replace(/([A-Z])/g, ' $1').trim()} submission:\n\n"${inputText}"`,
        config: {
          systemInstruction: systemPrompt,
        }
      });
      
      res.json({ feedback: response.text });
    } catch (err: any) {
      console.warn("Live Gemini API unavailable for evaluate-writing, providing standard IELTS rubric evaluation:", err?.message || err);
      const notice = "Official IELTS Rubric Evaluation";
      const fallback = evaluateIeltsWritingMarkdownFallback(inputText, taskType, rawPrompt, notice);
      return res.json({ feedback: fallback });
    }
  });

  app.post("/api/evaluate-writing-json", async (req, res) => {
    const { inputText, taskType, rawPrompt } = req.body;

    if (!inputText) {
      return res.status(400).json({ error: "Input text is required" });
    }

    const normalizedTaskType = String(taskType || '2').trim();
    const isTask1 = normalizedTaskType === '1';

    const systemPrompt = `You are a certified Senior IELTS Examiner evaluating IELTS Academic Writing ${isTask1 ? 'Task 1' : 'Task 2'}.
Evaluate the candidate's response strictly against the official IELTS Writing Band Descriptors below and the specific task question provided.
Be strict, fair, and consistent across both Task 1 and Task 2. Do NOT inflate scores.

CRITICAL INSTRUCTIONS FOR OUTPUT QUALITY & CONSISTENCY:
1. Scores: Provide accurate criterion bands ('taskAchievement' for Task 1 / Task Response for Task 2, 'coherenceCohesion', 'lexicalResource', 'grammaticalRange') and 'overallBand' formatted as strings rounded to 0.5 (e.g., '6.0', '6.5', '7.0'). Follow official IELTS rounding (.25 rounds up to .5, .75 rounds up to next whole band). If off-topic or severely underlength (<${isTask1 ? '150' : '250'} words), apply appropriate Task penalty.
2. Criterion Feedback: Write concise, specific examiner justifications referencing official descriptor criteria and evidence from the candidate's response. Include 3-4 'keyStrengths' and 3-4 'keyWeaknesses'.
3. Inline Error Marking ('inlineMarkedEssay') — THOROUGH & CONSISTENT ACROSS EVERY SENTENCE:
   - Return the candidate's COMPLETE text from the first sentence to the final sentence wrapped in paragraph tags (<p class="mb-3">...</p>). Do NOT skip paragraphs or leave errors unmarked.
   - Inspect every sentence for spelling typos (e.g. "ilustrates", "moderatelly", "stablized", "shoeing"), subject-verb agreement, wrong prepositions, missing/wrong articles, word-form errors ("dramatically increase", "more steadily growth"), clause splicing ("let it became", "it was the one remained"), informal/imprecise word choice ("price tag", "top of the data", "going up"), and punctuation mistakes.
   - Mark EVERY error inline immediately in place using:
     <del class='text-red-500 line-through'>exact original wrong span</del> <ins class='text-green-600 font-bold no-underline'>clean corrected span</ins>
   - Preserve all surrounding correct words verbatim.
4. Final Corrected Answer ('finalCorrectedAnswer') — ERROR-FREE BAND 8.0 REWRITE:
   - Rewrite the candidate's response to a genuine IELTS Band 8.0 standard while PRESERVING ALL OF THE STUDENT'S OWN IDEAS, data figures/comparisons (for Task 1), or thesis and arguments (for Task 2).
   - Do NOT invent fake numbers, prepend generic template filler ("The graph illustrates information regarding the presented data..."), or change the student's core points.
   - Eliminate 100% of grammatical, spelling, punctuation, article, preposition, and register errors, and upgrade phrasing, complex clause variety, and academic collocations naturally so it reads like a clean Band 8 script.
   - Return plain clean paragraphs separated by double newlines (\\n\\n) with ZERO HTML tags (<del>/<ins> must NEVER appear in finalCorrectedAnswer).

=== OFFICIAL IELTS WRITING BAND DESCRIPTORS ===
TASK 1 (Task Achievement, Coherence & Cohesion, Lexical Resource, Grammatical Range & Accuracy):
Band 9: fully satisfies all requirements; clearly presents a fully developed response. cohesion attracts no attention; skilfully manages paragraphing. wide range of vocabulary, very natural and sophisticated control; rare minor 'slips'. wide range of structures, full flexibility and accuracy.
Band 8: covers all requirements sufficiently; presents, highlights and illustrates key features clearly. sequences logically; manages cohesion well; uses paragraphing sufficiently. wide range of vocabulary fluently and flexibly; skilfully uses uncommon lexical items. wide range of structures; majority of sentences are error-free.
Band 7: covers requirements; clear overview of main trends/differences; clearly presents/highlights key features. logically organises information; clear progression; range of cohesive devices. sufficient vocabulary flexibility/precision; less common lexis. variety of complex structures; frequent error-free sentences; good control.
Band 6: addresses requirements; presents an overview with information appropriately selected. arranges coherently; clear progression; effective cohesive devices (some faulty/mechanical). adequate vocabulary; attempts less common vocabulary (some inaccuracy). mix of simple/complex forms; errors rarely reduce communication.
Band 5: generally addresses task; recounts detail mechanically with no clear overview. some organisation, lack of progression; inadequate cohesive devices. limited vocabulary. limited structures; frequent grammatical errors cause some difficulty.

TASK 2 (Task Response, Coherence & Cohesion, Lexical Resource, Grammatical Range & Accuracy):
Band 9: fully addresses all parts; fully developed position with relevant, fully extended and well-supported ideas. cohesion attracts no attention. wide vocabulary, sophisticated control. wide structures, full flexibility/accuracy.
Band 8: sufficiently addresses all parts; well-developed response with relevant, extended/supported ideas. sequences logically; manages cohesion well; paragraphs appropriately. wide vocabulary fluently/flexibly used; uncommon items skilfully used. wide structures; majority error-free.
Band 7: addresses all parts; clear position throughout; presents/extends main ideas. logically organises; clear progression; appropriate cohesive devices. sufficient vocabulary flexibility/precision. variety of complex structures; frequent error-free sentences.
Band 6: addresses all parts (some more fully than others); relevant position; some main ideas inadequately developed. arranges coherently; cohesive devices sometimes mechanical. adequate vocabulary; attempts less common words. mix of simple/complex forms; errors rarely reduce communication.
Band 5: addresses task partially; position unclear; limited main ideas. lack of progression; inadequate cohesion. limited vocabulary. limited structures; frequent errors cause difficulty.
`;

    try {
      if (!process.env.GEMINI_API_KEY) {
        const fallback = evaluateIeltsWritingJsonFallback(inputText, normalizedTaskType, rawPrompt, "Official IELTS Examiner Rubric Assessment (Server Key Unconfigured)");
        return res.json(fallback);
      }

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `IELTS Academic Writing Task ${normalizedTaskType} Question:\n${rawPrompt || '(Standard Academic Writing prompt)'}\n\nStudent's Response:\n${inputText}`,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              scores: {
                type: Type.OBJECT,
                properties: {
                  taskAchievement: { type: Type.STRING, description: "Band score rounded to 0.5, e.g. '6.0'" },
                  coherenceCohesion: { type: Type.STRING, description: "Band score rounded to 0.5, e.g. '6.5'" },
                  lexicalResource: { type: Type.STRING, description: "Band score rounded to 0.5, e.g. '6.0'" },
                  grammaticalRange: { type: Type.STRING, description: "Band score rounded to 0.5, e.g. '5.5'" },
                  overallBand: { type: Type.STRING, description: "Overall IELTS Writing band rounded to 0.5, e.g. '6.0'" }
                },
                required: ["taskAchievement", "coherenceCohesion", "lexicalResource", "grammaticalRange", "overallBand"]
              },
              feedback: {
                type: Type.OBJECT,
                properties: {
                  taskAchievement: { type: Type.STRING },
                  coherenceCohesion: { type: Type.STRING },
                  lexicalResource: { type: Type.STRING },
                  grammaticalRange: { type: Type.STRING }
                },
                required: ["taskAchievement", "coherenceCohesion", "lexicalResource", "grammaticalRange"]
              },
              keyStrengths: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "3-4 concise bullet strengths referencing the student's writing."
              },
              keyWeaknesses: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "3-4 concise bullet areas for improvement."
              },
              inlineMarkedEssay: {
                type: Type.STRING,
                description: "Complete student essay wrapped in <p class='mb-3'> tags with every error marked via <del class='text-red-500 line-through'>...</del> <ins class='text-green-600 font-bold no-underline'>...</ins>."
              },
              finalCorrectedAnswer: {
                type: Type.STRING,
                description: "Error-free IELTS Band 8.0 rewrite preserving the student's ideas and data/arguments, formatted in clean paragraphs separated by \\n\\n with zero HTML tags."
              }
            },
            required: ["scores", "feedback", "keyStrengths", "keyWeaknesses", "inlineMarkedEssay", "finalCorrectedAnswer"]
          }
        }
      });

      const jsonText = response.text;
      if (!jsonText) throw new Error("No response generated.");

      let parsedJsonText = jsonText;
      const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
      if (jsonMatch) {
        parsedJsonText = jsonMatch[1];
      }

      const rawReport = JSON.parse(parsedJsonText.trim());

      const normalizeScore = (val: any): string => {
        const num = parseFloat(String(val));
        if (isNaN(num)) return '6.0';
        const clamped = Math.max(0, Math.min(9, Math.round(num * 2) / 2));
        return clamped.toFixed(1);
      };

      const ta = normalizeScore(rawReport?.scores?.taskAchievement);
      const cc = normalizeScore(rawReport?.scores?.coherenceCohesion);
      const lr = normalizeScore(rawReport?.scores?.lexicalResource);
      const gr = normalizeScore(rawReport?.scores?.grammaticalRange);

      const avg = (parseFloat(ta) + parseFloat(cc) + parseFloat(lr) + parseFloat(gr)) / 4;
      const rem = avg - Math.floor(avg);
      let overallNum = Math.round(avg * 2) / 2;
      if (Math.abs(rem - 0.25) < 0.01) overallNum = Math.floor(avg) + 0.5;
      else if (Math.abs(rem - 0.75) < 0.01) overallNum = Math.floor(avg) + 1.0;

      const cleanFinalAnswer = String(rawReport?.finalCorrectedAnswer || '')
        .replace(/<del[^>]*>.*?<\/del>/gi, '')
        .replace(/<ins[^>]*>(.*?)<\/ins>/gi, '$1')
        .replace(/<\/?p[^>]*>/gi, '\n\n')
        .replace(/<[^>]+>/g, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim();

      const reportData = {
        scores: {
          taskAchievement: ta,
          coherenceCohesion: cc,
          lexicalResource: lr,
          grammaticalRange: gr,
          overallBand: rawReport?.scores?.overallBand ? normalizeScore(rawReport.scores.overallBand) : overallNum.toFixed(1)
        },
        feedback: {
          taskAchievement: String(rawReport?.feedback?.taskAchievement || '').trim(),
          coherenceCohesion: String(rawReport?.feedback?.coherenceCohesion || '').trim(),
          lexicalResource: String(rawReport?.feedback?.lexicalResource || '').trim(),
          grammaticalRange: String(rawReport?.feedback?.grammaticalRange || '').trim()
        },
        keyStrengths: Array.isArray(rawReport?.keyStrengths) ? rawReport.keyStrengths.map(String) : [],
        keyWeaknesses: Array.isArray(rawReport?.keyWeaknesses) ? rawReport.keyWeaknesses.map(String) : [],
        inlineMarkedEssay: String(rawReport?.inlineMarkedEssay || '').trim(),
        finalCorrectedAnswer: cleanFinalAnswer,
        targetBand: '8.0'
      };

      res.json(reportData);
    } catch (err: any) {
      console.warn("Live Gemini API unavailable for evaluate-writing-json, providing standard IELTS rubric evaluation:", err?.message || err);
      const notice = "Official IELTS Rubric Evaluation";
      const fallbackReport = evaluateIeltsWritingJsonFallback(inputText, normalizedTaskType, rawPrompt, notice);
      res.json(fallbackReport);
    }
  });

function pcmToWav(pcmData: Buffer, sampleRate: number = 24000, numChannels: number = 1): Buffer {
  const byteRate = sampleRate * numChannels * 2;
  const blockAlign = numChannels * 2;
  const dataSize = pcmData.length;
  
  const buffer = Buffer.alloc(44 + dataSize);
  
  // RIFF chunk descriptor
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  
  // fmt sub-chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size
  buffer.writeUInt16LE(1, 20); // AudioFormat (PCM = 1)
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(16, 34); // BitsPerSample
  
  // data sub-chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);
  
  pcmData.copy(buffer, 44);
  
  return buffer;
}

  app.post("/api/tts", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text) {
        return res.status(400).json({ error: "Text is required" });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured" });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
        contents: text,
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } }
          }
        }
      });
      
      const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (audioData) {
        const pcmBuffer = Buffer.from(audioData, 'base64');
        const wavBuffer = pcmToWav(pcmBuffer, 24000, 1);
        res.json({ audio: wavBuffer.toString('base64'), mimeType: 'audio/wav' });
      } else {
        res.status(500).json({ error: "No audio content received from Gemini" });
      }
    } catch (err: any) {
      console.error("TTS API Error:", err);
      res.status(500).json({ error: err?.message || "Failed to generate TTS" });
    }
  });

  app.post("/api/evaluate-speaking", async (req, res) => {
    try {
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured" });
      }

      const { 
        submissionId, 
        testTitle, 
        questions, 
        answers, 
        audioRecordings, 
        audioData, 
        questionText 
      } = req.body;

      // Handle legacy single-audio question evaluation if audioData is directly provided
      if (audioData && !submissionId && !questions) {
        const commaIdx = audioData.indexOf(",");
        const base64Audio = commaIdx !== -1 ? audioData.slice(commaIdx + 1).trim() : audioData.trim();
        const rawMime = audioData.match(/^data:([^;,]+)/)?.[1] || "audio/webm";
        const mimeType = rawMime.split(";")[0].trim().toLowerCase();

        const singlePrompt = `You are a supportive IELTS English teacher and speaking examiner. Evaluate the candidate's audio response realistically according to the official IELTS Speaking Band Descriptors (FC, LR, GRA, PR).
Do not inflate scores. Most ESL learners score in the Band 4.5 to 5.5 range. Only give 7.0+ if truly fluent and accurate.
Write friendly, natural teacher feedback quoting what the student said in the audio with corrections.
Return JSON with:
{
  "bandScore": 5.5,
  "scores": { "FC": 5.5, "LR": 5.5, "GRA": 5.0, "PR": 5.5 },
  "overallBand": 5.5,
  "feedback": {
    "fluency": "Simple teacher comments on flow, pauses, and response length",
    "lexical": "Teacher notes on vocabulary used vs overused",
    "grammar": "Real sentence from audio and teacher correction",
    "pronunciation": "Words to practice from audio"
  },
  "improvements": ["Simple practice step 1", "Simple practice step 2"],
  "transcription": "What the student said"
}`;

        let response: any;
        try {
          response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: [
              { text: `Question: ${questionText || 'IELTS Speaking Question'}\nEvaluate the candidate's audio response.` },
              {
                inlineData: {
                  mimeType: mimeType,
                  data: base64Audio
                }
              }
            ],
            config: {
              systemInstruction: singlePrompt,
              responseMimeType: "application/json",
            }
          });
          const reportData = JSON.parse(response.text || "{}");
          return res.json(reportData);
        } catch (mErr: any) {
          console.warn("Live Gemini API unavailable for single speaking evaluation, generating fallback:", mErr?.message || mErr);
          const notice = "Official IELTS Speaking Rubric";
          return res.json(evaluateIeltsSpeakingFallback({ questionText, noticeText: notice }));
        }
      }

      // Full test evaluation workflow
      const contentsParts: any[] = [];
      let totalAudioPartsAdded = 0;

      // Collect audio parts:
      // 1. From audioRecordings provided in body (from client memory, Firestore, or blobs)
      // Balance clips focusing on 2 key clips (Part 1 and Part 2 cue card) for rapid evaluation under 5-10s
      let selectedRecordings = Array.isArray(audioRecordings) ? [...audioRecordings] : [];
      if (selectedRecordings.length > 2) {
        const p1 = selectedRecordings.filter(r => (r.label && r.label.includes('Part 1')) || (r.qId && String(r.qId).startsWith('p1')));
        const p2 = selectedRecordings.filter(r => (r.label && r.label.includes('Part 2')) || (r.qId && (String(r.qId).startsWith('p2') || String(r.qId) === 'cueCard')));
        const p3 = selectedRecordings.filter(r => (r.label && r.label.includes('Part 3')) || (r.qId && String(r.qId).startsWith('p3')));
        const others = selectedRecordings.filter(r => !p1.includes(r) && !p2.includes(r) && !p3.includes(r));

        const fastSelected: any[] = [];
        if (p1.length > 0) fastSelected.push(p1[0]);
        if (p2.length > 0) fastSelected.push(p2[0]);
        else if (p3.length > 0) fastSelected.push(p3[0]);
        else if (p1.length > 1) fastSelected.push(p1[1]);

        for (const item of [...p3, ...others, ...p1, ...p2]) {
          if (fastSelected.length >= 2) break;
          if (!fastSelected.includes(item)) fastSelected.push(item);
        }
        selectedRecordings = fastSelected;
      }

      for (const item of selectedRecordings) {
        if (item && item.audioBase64) {
          const commaIdx = item.audioBase64.indexOf(",");
          const rawBase64 = commaIdx !== -1 ? item.audioBase64.slice(commaIdx + 1).trim() : item.audioBase64.trim();
          
          if (rawBase64.length > 50) {
            const rawMime = item.mimeType || 'audio/webm';
            const cleanMime = rawMime.split(';')[0].trim().toLowerCase();
            const qText = item.questionText ? ` (Prompt: "${item.questionText}")` : "";
            contentsParts.push({ 
              text: `=== Student Audio Recording for [${item.label || item.qId}]${qText} ===` 
            });
            contentsParts.push({
              inlineData: {
                mimeType: cleanMime,
                data: rawBase64
              }
            });
            totalAudioPartsAdded++;
          }
        }
      }

      // 2. From server uploads directory (uploads/speaking/) for this submissionId
      if (submissionId) {
        const safeSubmissionId = submissionId.replace(/[^a-zA-Z0-9_-]/g, "_");
        try {
          if (fs.existsSync(SPEAKING_DIR)) {
            const files = fs.readdirSync(SPEAKING_DIR);
            const subFiles = files.filter(f => f.startsWith(`${safeSubmissionId}_`));
            
            for (const file of subFiles) {
              const qPart = file.replace(`${safeSubmissionId}_`, "").replace(/\.[^/.]+$/, "");
              const alreadyAdded = Array.isArray(audioRecordings) && audioRecordings.some(ar => ar.qId === qPart);
              
              if (!alreadyAdded && totalAudioPartsAdded < 2) {
                const filePath = path.join(SPEAKING_DIR, file);
                const fileStat = fs.statSync(filePath);
                if (fileStat.size > 100 && fileStat.size < 15 * 1024 * 1024) {
                  const ext = path.extname(file).toLowerCase();
                  let mime = "audio/webm";
                  if (ext === ".mp3") mime = "audio/mpeg";
                  else if (ext === ".wav") mime = "audio/wav";
                  else if (ext === ".m4a") mime = "audio/mp4";

                  const fileBuf = fs.readFileSync(filePath);
                  contentsParts.push({ 
                    text: `=== Student Audio Recording File [${file}] ===` 
                  });
                  contentsParts.push({
                    inlineData: {
                      mimeType: mime,
                      data: fileBuf.toString("base64")
                    }
                  });
                  totalAudioPartsAdded++;
                }
              }
            }
          }
        } catch (dirErr) {
          console.warn("Could not read from uploads/speaking directory:", dirErr);
        }
      }

      if (totalAudioPartsAdded === 0) {
        return res.status(400).json({
          error: "No audio recordings could be found to evaluate. Please ensure the student's audio recordings are attached or uploaded."
        });
      }

      // Context instructions summarizing the test
      let questionOverview = `IELTS Speaking Test: ${testTitle || 'IELTS Speaking Test'}\n`;
      if (questions) {
        if (questions.part1 && Array.isArray(questions.part1)) {
          questionOverview += `\nPart 1 Questions:\n` + questions.part1.map((q: any, i: number) => `${i + 1}. [ID: ${q.id}] ${q.text || ''} (Topic: ${q.topic || ''})`).join('\n');
        }
        if (questions.part2 && Array.isArray(questions.part2)) {
          questionOverview += `\nPart 2 Cue Card:\n` + questions.part2.map((q: any) => `Topic: ${q.topic || ''}\nPrompt: ${q.text || q.cueCard || ''}`).join('\n');
        } else if (questions.part2 && typeof questions.part2 === 'object') {
          const bps = Array.isArray(questions.part2.bulletPoints) ? questions.part2.bulletPoints.join('; ') : '';
          questionOverview += `\nPart 2 Cue Card:\nTopic: ${questions.part2.topic || ''}\nPrompt: ${questions.part2.cueCard || questions.part2.text || bps}`;
        }
        if (questions.part3 && Array.isArray(questions.part3)) {
          questionOverview += `\nPart 3 Discussion Questions:\n` + questions.part3.map((q: any, i: number) => `${i + 1}. [ID: ${q.id}] ${q.text || ''} (Topic: ${q.topic || ''})`).join('\n');
        }
      }

      const textPrompt = `You are an experienced IELTS speaking teacher conducting Teacher Checking on a student's test.
Attached are ${totalAudioPartsAdded} audio recording(s) of the student speaking.
${questionOverview}

Listen to the audio recordings carefully. Assess what the student ACTUALLY said.

CRITICAL SCORING PRINCIPLES (STRICT & ACCURATE - DO NOT INFLATE SCORES):
- Real ESL learners usually score between Band 4.5 and Band 6.0.
- Do NOT give Band 7.0 or 7.5 unless the student genuinely exhibits fluent, effortless speech with sophisticated vocabulary, natural collocations, and mostly error-free sentences.
- If the student hesitates, pauses frequently, speaks in short simple sentences, or makes basic grammar errors (e.g. wrong past tenses, subject-verb disagreement, missing plurals), score realistically in the Band 4.5 to 5.5 range.
- If speech is very brief or incomplete, reflect that in low fluency and coherence scores (Band 4.0 - 5.0).
- Score each of the 4 criteria using standard IELTS half-bands (e.g. 4.5, 5.0, 5.5, 6.0, 6.5, 7.0, 7.5):
  1. Fluency & Coherence (FC)
  2. Lexical Resource (LR)
  3. Grammatical Range & Accuracy (GRA)
  4. Pronunciation (PR)
- Calculate Overall Band score using official IELTS rounding rules:
  Average = (FC + LR + GRA + PR) / 4.
  If average ends in .25 -> round up to .5 (e.g., 5.25 -> 5.5).
  If average ends in .75 -> round up to next whole band (e.g., 5.75 -> 6.0).
  Otherwise round to nearest .0 or .5.

CRITICAL ACCURACY & QUESTION-AUDIO GROUNDING:
- Listen to the audio recordings attentively. Assess what the student ACTUALLY said in response to the specific IELTS test questions provided above.
- Every single quote, observation, grammar correction, and vocabulary note MUST be strictly grounded in the candidate's actual speech in the audio.
- DO NOT invent, hallucinate, or assume sentences that were not spoken in the audio.
- In Grammar: select 3 to 5 real, high-impact grammatical mistakes from their recording. Do NOT output a bloated, repetitive list; focus on 3 to 5 clear, high-value corrections.

CRITICAL FORMATTING RULES FOR TEACHER FEEDBACK:
1. NO SCORES IN FEEDBACK:
   - DO NOT mention, write, or repeat any scores, band numbers, or ratings anywhere in the feedback text (e.g., do NOT write "Band 5.5", "overall band", "estimated band", or "(Band [Score])").
   - The scores are ALREADY calculated and displayed in the score cards above! The feedback text must ONLY contain qualitative teacher comments, observations, and corrections.
2. NO SUGGESTIONS / NO PRACTICE DRILLS / NO TIPS:
   - Do NOT add suggestions, advice lists, action plans, or practice steps. Keep the feedback strictly focused on reviewing what was spoken, vocabulary, grammar corrections, and pronunciation clarity.
3. REMOVE THE WORD AI / DO NOT USE AI:
   - Do NOT use or mention the word "AI" anywhere. This is a Teacher Checking report written in a warm, direct teacher voice ("You", "Your answers").
4. WRITE "x" AND "check" INSTEAD OF "teacher fix":
   - NEVER write the words "teacher fix", "Teacher fix", or "Teacher Fix".
   - In Grammar corrections, write ✗ for the mistake and ✓ for the correction on separate structured lines:
     * ✗ "[Exact sentence candidate said in audio]"
       ✓ "[Natural corrected sentence]"
5. FLUENCY ICONS:
   - In Fluency & Coherence, use a check icon for what went well (✅ **What went well:**) and an x icon for holding back (❌ **Things holding you back:**).
6. PRONUNCIATION (NO RHYTHM):
   - In Pronunciation, title must be strictly "### 🎙️ Pronunciation" (DO NOT write "Pronunciation & Rhythm" or use the word "rhythm").
   - Focus on:
     * Words to practice: mispronounced words, sounds, or syllable stresses heard in the student's audio
     * Clarity & Articulation: clear notes on consonant endings, dropped sounds, or vowel clarity.

Format the 'feedback' markdown naturally like this:

### 👩‍🏫 Teacher's Feedback
[Warm, encouraging, but honest summary of performance (2-3 sentences). State what they did well and their main challenge. DO NOT state or mention any band score numbers.]

### 🗣️ Fluency & Coherence
- ✅ **What went well:** [Flow, response length, confidence in answering the specific test questions]
- ❌ **Things holding you back:** [Specific pauses, repetition, hesitation, or filler words heard in the audio]

### 📚 Vocabulary & Word Choice
- **Good words you used:** [Specific words/phrases candidate actually said in the audio]
- **Words you repeated often:** [e.g. 'good', 'nice', 'very', 'thing']
- **Better alternatives:**
  * Instead of "*[student's word]*", use "*[better natural alternative]*"
  * Instead of "*[student's word]*", use "*[better natural alternative]*"

### ⚖️ Grammar & Sentence Structure
- **Grammar corrections:**
  * ✗ "[Exact sentence or phrase candidate said in audio]"
    ✓ "[Natural corrected sentence]"
  * ✗ "[Exact sentence or phrase candidate said in audio]"
    ✓ "[Natural corrected sentence]"
  * ✗ "[Exact sentence or phrase candidate said in audio]"
    ✓ "[Natural corrected sentence]"
- **Grammar focus:** [Simple explanation of the key grammar point to review]

### 🎙️ Pronunciation
- **Words to practice:**
  * "*[Mispronounced word from audio]*" - [Simple note on pronunciation or syllable stress]
  * "*[Mispronounced word from audio]*" - [Simple note on pronunciation or syllable stress]
- **Clarity & Articulation:** [Feedback on word clarity, consonant sounds, or dropped endings heard in the audio]

Return STRICT JSON adhering to this exact format:
{
  "scores": {
    "FC": 5.5,
    "LR": 5.5,
    "GRA": 5.0,
    "PR": 5.5
  },
  "overallBand": 5.5,
  "feedback": "...",
  "improvements": [],
  "transcriptionSummary": "Brief summary of candidate's speech"
}`;

      contentsParts.unshift({ text: textPrompt });

      const systemInstruction = `You are a supportive, experienced IELTS speaking teacher conducting Teacher Checking.
Your goal is to evaluate candidate speech based strictly on the audio recordings provided.
Never inflate band scores unrealistically. Most ESL students score between Band 4.5 and 6.0.
Always write feedback that is simple, natural, constructive, and friendly, as if written by a teacher directly to the student.
Never mention the word AI. Do not add suggestions or practice steps. Do not include band scores inside the feedback text.
Never write "teacher fix" — write ✗ for mistake and ✓ for correction.
In pronunciation, never write or mention "rhythm" — focus strictly on phonetic clarity, word stress, and clarity & articulation.
Always return valid JSON adhering to the specified schema.`;

      const evalStartTime = Date.now();
      let response: any;
      try {
        response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: contentsParts,
          config: {
            systemInstruction: systemInstruction,
            responseMimeType: "application/json",
            temperature: 0.2,
          }
        });
      } catch (geminiErr: any) {
        console.warn("Live Gemini API unavailable for full speaking evaluation, generating fallback:", geminiErr?.message || geminiErr);
        return res.json(evaluateIeltsSpeakingFallback({ testTitle, questions, audioRecordings }));
      }
      console.log(`[EVAL-SPEAKING] Evaluated ${totalAudioPartsAdded} recording(s) in ${Date.now() - evalStartTime}ms`);

      const responseText = response.text || "{}";
      let reportData: any;
      try {
        reportData = JSON.parse(responseText);
      } catch (parseErr) {
        console.error("Failed to parse Gemini response as JSON:", responseText);
        // Fallback extraction
        const fcMatch = responseText.match(/"FC":\s*([0-9.]+)/);
        const lrMatch = responseText.match(/"LR":\s*([0-9.]+)/);
        const graMatch = responseText.match(/"GRA":\s*([0-9.]+)/);
        const prMatch = responseText.match(/"PR":\s*([0-9.]+)/);
        const overallMatch = responseText.match(/"overallBand":\s*([0-9.]+)/);

        const fc = fcMatch ? parseFloat(fcMatch[1]) : 5.5;
        const lr = lrMatch ? parseFloat(lrMatch[1]) : 5.5;
        const gra = graMatch ? parseFloat(graMatch[1]) : 5.0;
        const pr = prMatch ? parseFloat(prMatch[1]) : 5.5;
        const overall = overallMatch ? parseFloat(overallMatch[1]) : Math.round(((fc + lr + gra + pr) / 4) * 2) / 2;

        reportData = {
          scores: { FC: fc, LR: lr, GRA: gra, PR: pr },
          overallBand: overall,
          feedback: responseText,
          improvements: []
        };
      }

      // Ensure scores are numbers clamped between 1.0 and 9.0
      const cleanBand = (val: any, fallback: number) => {
        const num = typeof val === 'number' ? val : parseFloat(val);
        if (isNaN(num) || num < 1 || num > 9) return fallback;
        return Math.round(num * 2) / 2;
      };

      const finalScores = {
        FC: cleanBand(reportData?.scores?.FC ?? reportData?.scores?.fluency, 5.5),
        LR: cleanBand(reportData?.scores?.LR ?? reportData?.scores?.lexical, 5.5),
        GRA: cleanBand(reportData?.scores?.GRA ?? reportData?.scores?.grammar, 5.0),
        PR: cleanBand(reportData?.scores?.PR ?? reportData?.scores?.pronunciation, 5.5),
      };

      const calculatedAvg = (finalScores.FC + finalScores.LR + finalScores.GRA + finalScores.PR) / 4;
      let calculatedOverall = Math.round(calculatedAvg * 2) / 2;
      // IELTS rounding: .25 -> .5, .75 -> next whole
      const rem = calculatedAvg - Math.floor(calculatedAvg);
      if (Math.abs(rem - 0.25) < 0.01) {
        calculatedOverall = Math.floor(calculatedAvg) + 0.5;
      } else if (Math.abs(rem - 0.75) < 0.01) {
        calculatedOverall = Math.floor(calculatedAvg) + 1.0;
      }

      const finalOverall = cleanBand(reportData?.overallBand ?? reportData?.bandScore, calculatedOverall);

      let formattedFeedback = "";
      if (typeof reportData.feedback === 'string') {
        formattedFeedback = reportData.feedback;
      } else if (reportData.feedback && typeof reportData.feedback === 'object') {
        const fbObj: any = reportData.feedback;
        formattedFeedback = `### 👩‍🏫 Teacher's Feedback\n${fbObj.summary || fbObj.overall || "You showed a solid effort across all parts of the speaking test. Focus on refining your sentence accuracy and pronunciation clarity."}\n\n### 🗣️ Fluency & Coherence\n- ✅ **What went well:** ${fbObj.fluency || "Maintained a willingness to speak at length and address the test prompts."}\n\n### 📚 Vocabulary & Word Choice\n- **Good words you used:** ${fbObj.lexical || "Used sufficient vocabulary to discuss the test topics clearly."}\n\n### ⚖️ Grammar & Sentence Structure\n- **Grammar focus:** ${fbObj.grammar || "Good control of simple sentences; continue practicing complex clause accuracy."}\n\n### 🎙️ Pronunciation\n- **Clarity & Articulation:** ${String(fbObj.pronunciation || "Speech is generally clear and intelligible throughout.").replace(/rhythm/gi, "clarity and stress")}`;
      } else {
        formattedFeedback = evaluateIeltsSpeakingFallback({ testTitle, questions, audioRecordings }).feedback;
      }

      const result = {
        scores: finalScores,
        overallBand: finalOverall,
        bandScore: finalOverall,
        feedback: formattedFeedback,
        improvements: [],
        transcriptionSummary: reportData.transcriptionSummary || reportData.transcription || ""
      };

      return res.json(result);
    } catch (err: any) {
      console.warn("Evaluate Speaking Error, providing fallback report:", err?.message || err);
      return res.json(evaluateIeltsSpeakingFallback({
        testTitle: req.body?.testTitle,
        questions: req.body?.questions,
        audioRecordings: req.body?.audioRecordings
      }));
    }
  });

  app.post("/api/translate-feedback", async (req, res) => {
    const { text, targetLanguage } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    try {
      if (!process.env.GEMINI_API_KEY) {
        return res.json({ translatedText: text });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Translate the following IELTS evaluation feedback to ${targetLanguage || 'Vietnamese'}. Keep the tone professional and maintain any structural formatting (like bullet points or numbers). Do not add any extra commentary, just provide the translation:

${text}`
      });
      
      res.json({ translatedText: response.text });
    } catch (err: any) {
      console.warn("Translation API unavailable, preserving original text:", err?.message || err);
      res.json({ translatedText: text });
    }
  });

  app.post("/api/generate-image", async (req, res) => {
    try {
      const { prompt, size } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured" });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite-image',
        contents: prompt,
        config: {
          imageConfig: {
            aspectRatio: "1:1",
            imageSize: size || "1K"
          }
        }
      });
      
      let imageUrl = "";
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          imageUrl = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }

      if (imageUrl) {
        res.json({ imageUrl });
      } else {
        res.status(500).json({ error: "No image generated" });
      }
    } catch (err: any) {
      console.error("Image Generation Error:", err);
      res.status(500).json({ error: err?.message || "Failed to generate image" });
    }
  });

  // ============================================================================
  // ERA GAMES LIVE ARENA ENGINE (Server-Authoritative Rooms & WebSocket State)
  // ============================================================================
  interface ArenaQuestion {
    id: string;
    prompt: string;
    options: string[];
    correctIndex: number;
    explanation?: string;
    points?: number;
  }

  interface ArenaPlayerState {
    playerId: string;
    name: string;
    course: string;
    score: number;
    correctCount: number;
    streak: number;
    lastAnswerIndex: number | null;
    lastAnswerCorrect: boolean | null;
    lastPointsEarned: number;
    answeredCurrentRound: boolean;
    connected: boolean;
  }

  interface ArenaRoomState {
    roomCode: string;
    title: string;
    course: string;
    deckId: string;
    hostPlayerId: string;
    hostName: string;
    status: 'LOBBY' | 'QUESTION' | 'ROUND_SUMMARY' | 'FINISHED';
    questions: ArenaQuestion[];
    currentIndex: number;
    questionDurationMs: number;
    questionStartedAt: number | null;
    createdAt: number;
    players: Map<string, ArenaPlayerState>;
    sockets: Map<string, WebSocket>;
    timer: ReturnType<typeof setTimeout> | null;
  }

  const arenaRooms = new Map<string, ArenaRoomState>();

  const generateRoomCode = (): string => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'ERA';
    for (let i = 0; i < 3; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    if (arenaRooms.has(code)) {
      return `E${Math.floor(10000 + Math.random() * 89999)}`;
    }
    return code;
  };

  const serializeArenaRoom = (room: ArenaRoomState) => {
    const playersList = Array.from(room.players.values())
      .map((p) => ({ ...p }))
      .sort((a, b) => b.score - a.score || b.correctCount - a.correctCount);
    const currentQ = room.questions[room.currentIndex] || null;
    const hideAnswer = room.status === 'QUESTION';
    return {
      roomCode: room.roomCode,
      title: room.title,
      course: room.course,
      deckId: room.deckId,
      hostPlayerId: room.hostPlayerId,
      hostName: room.hostName,
      status: room.status,
      totalQuestions: room.questions.length,
      currentIndex: room.currentIndex,
      questionDurationMs: room.questionDurationMs,
      questionStartedAt: room.questionStartedAt,
      serverNow: Date.now(),
      currentQuestion: currentQ
        ? {
            id: currentQ.id,
            prompt: currentQ.prompt,
            options: currentQ.options,
            points: currentQ.points || 100,
            correctIndex: hideAnswer ? null : currentQ.correctIndex,
            explanation: hideAnswer ? null : currentQ.explanation || ''
          }
        : null,
      players: playersList
    };
  };

  const broadcastArenaState = (room: ArenaRoomState) => {
    const payload = JSON.stringify({
      type: 'arena:state',
      room: serializeArenaRoom(room)
    });
    for (const [, sock] of room.sockets.entries()) {
      if (sock.readyState === WebSocket.OPEN) {
        try {
          sock.send(payload);
        } catch {
          // ignore stale socket
        }
      }
    }
  };

  const finalizeArenaRound = (room: ArenaRoomState) => {
    if (room.timer) {
      clearTimeout(room.timer);
      room.timer = null;
    }
    if (room.status !== 'QUESTION') return;
    room.status = room.currentIndex >= room.questions.length - 1 ? 'FINISHED' : 'ROUND_SUMMARY';
    broadcastArenaState(room);
  };

  const beginArenaQuestion = (room: ArenaRoomState, index: number) => {
    if (room.timer) {
      clearTimeout(room.timer);
      room.timer = null;
    }
    if (index >= room.questions.length) {
      room.status = 'FINISHED';
      room.questionStartedAt = null;
      broadcastArenaState(room);
      return;
    }
    room.currentIndex = index;
    room.status = 'QUESTION';
    room.questionStartedAt = Date.now();
    for (const p of room.players.values()) {
      p.lastAnswerIndex = null;
      p.lastAnswerCorrect = null;
      p.lastPointsEarned = 0;
      p.answeredCurrentRound = false;
    }
    broadcastArenaState(room);
    room.timer = setTimeout(() => {
      finalizeArenaRound(room);
    }, room.questionDurationMs);
  };

  // Cleanup abandoned rooms older than 3 hours
  setInterval(() => {
    const cutoff = Date.now() - 3 * 60 * 60 * 1000;
    for (const [code, room] of arenaRooms.entries()) {
      if (room.createdAt < cutoff && room.sockets.size === 0) {
        if (room.timer) clearTimeout(room.timer);
        arenaRooms.delete(code);
      }
    }
  }, 15 * 60 * 1000);

  app.get("/api/arena/rooms", (_req, res) => {
    const rooms = Array.from(arenaRooms.values())
      .filter((r) => r.status !== 'FINISHED')
      .map((r) => ({
        roomCode: r.roomCode,
        title: r.title,
        course: r.course,
        hostName: r.hostName,
        status: r.status,
        playerCount: r.players.size,
        totalQuestions: r.questions.length,
        createdAt: r.createdAt
      }))
      .sort((a, b) => b.createdAt - a.createdAt);
    res.json({ rooms });
  });


  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: false 
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  server.on("error", (err: any) => {
    console.error("HTTP Server error:", err);
  });

  const wss = new WebSocketServer({ noServer: true });
  const arenaWss = new WebSocketServer({ noServer: true });

  wss.on("error", (err) => {
    console.error("WebSocket server error:", err);
  });

  arenaWss.on("error", (err) => {
    console.error("Arena WebSocket server error:", err);
  });

  server.on("upgrade", (request, socket, head) => {
    try {
      const pathname = new URL(request.url || "/", "http://localhost").pathname;
      if (pathname === "/live") {
        wss.handleUpgrade(request, socket, head, (ws) => {
          wss.emit("connection", ws, request);
        });
      } else if (pathname === "/arena-ws") {
        arenaWss.handleUpgrade(request, socket, head, (ws) => {
          arenaWss.emit("connection", ws, request);
        });
      } else {
        socket.destroy();
      }
    } catch {
      socket.destroy();
    }
  });

  arenaWss.on("connection", (ws) => {
    let joinedRoomCode: string | null = null;
    let joinedPlayerId: string | null = null;

    const sendError = (message: string) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "arena:error", error: message }));
      }
    };

    ws.on("message", (raw) => {
      try {
        const msg = JSON.parse(raw.toString());
        const type = String(msg?.type || "");

        if (type === "arena:create") {
          const questions = Array.isArray(msg.questions) ? msg.questions.slice(0, 25) : [];
          if (questions.length === 0) {
            return sendError("Cannot create arena without at least 1 question.");
          }
          const playerId = String(msg.playerId || `host_${Date.now()}`);
          const hostName = String(msg.playerName || msg.hostName || "Teacher").trim().slice(0, 40) || "Teacher";
          const roomCode = generateRoomCode();
          const room: ArenaRoomState = {
            roomCode,
            title: String(msg.title || "Era Live Quiz Battle").slice(0, 80),
            course: String(msg.course || "Starter").slice(0, 24),
            deckId: String(msg.deckId || "custom"),
            hostPlayerId: playerId,
            hostName,
            status: "LOBBY",
            questions: questions.map((q: any, idx: number) => ({
              id: String(q.id || `q_${idx}`),
              prompt: String(q.prompt || q.question || "Question"),
              options: Array.isArray(q.options) ? q.options.slice(0, 4).map(String) : ["Option A", "Option B"],
              correctIndex: Number.isFinite(Number(q.correctIndex)) ? Number(q.correctIndex) : 0,
              explanation: q.explanation ? String(q.explanation) : "",
              points: Number.isFinite(Number(q.points)) ? Number(q.points) : 100
            })),
            currentIndex: 0,
            questionDurationMs: Math.min(30000, Math.max(8000, Number(msg.questionDurationMs) || 15000)),
            questionStartedAt: null,
            createdAt: Date.now(),
            players: new Map(),
            sockets: new Map(),
            timer: null
          };

          room.players.set(playerId, {
            playerId,
            name: hostName,
            course: String(msg.course || "Starter"),
            score: 0,
            correctCount: 0,
            streak: 0,
            lastAnswerIndex: null,
            lastAnswerCorrect: null,
            lastPointsEarned: 0,
            answeredCurrentRound: false,
            connected: true
          });
          room.sockets.set(playerId, ws);
          arenaRooms.set(roomCode, room);
          joinedRoomCode = roomCode;
          joinedPlayerId = playerId;
          broadcastArenaState(room);
          return;
        }

        if (type === "arena:join" || type === "arena:reconnect") {
          const code = String(msg.roomCode || "").trim().toUpperCase();
          const room = arenaRooms.get(code);
          if (!room) {
            return sendError(`Arena room "${code}" not found or has ended.`);
          }
          const playerId = String(msg.playerId || `player_${Date.now()}_${Math.floor(Math.random() * 999)}`);
          const playerName = String(msg.playerName || "Student").trim().slice(0, 40) || "Student";
          const existing = room.players.get(playerId);
          if (existing) {
            existing.connected = true;
            existing.name = playerName;
          } else {
            room.players.set(playerId, {
              playerId,
              name: playerName,
              course: String(msg.course || room.course),
              score: 0,
              correctCount: 0,
              streak: 0,
              lastAnswerIndex: null,
              lastAnswerCorrect: null,
              lastPointsEarned: 0,
              answeredCurrentRound: false,
              connected: true
            });
          }
          room.sockets.set(playerId, ws);
          joinedRoomCode = code;
          joinedPlayerId = playerId;
          broadcastArenaState(room);
          return;
        }

        const roomCode = String(msg.roomCode || joinedRoomCode || "").trim().toUpperCase();
        const room = arenaRooms.get(roomCode);
        if (!room) return sendError("Room no longer exists.");
        const actorId = String(msg.playerId || joinedPlayerId || "");

        if (type === "arena:start") {
          if (actorId !== room.hostPlayerId) return sendError("Only the host can start the match.");
          beginArenaQuestion(room, 0);
          return;
        }

        if (type === "arena:next") {
          if (actorId !== room.hostPlayerId) return sendError("Only the host can advance questions.");
          if (room.status === "QUESTION") {
            finalizeArenaRound(room);
          } else if (room.status === "ROUND_SUMMARY") {
            beginArenaQuestion(room, room.currentIndex + 1);
          }
          return;
        }

        if (type === "arena:end") {
          if (actorId !== room.hostPlayerId) return sendError("Only the host can end the match.");
          if (room.timer) {
            clearTimeout(room.timer);
            room.timer = null;
          }
          room.status = "FINISHED";
          broadcastArenaState(room);
          return;
        }

        if (type === "arena:answer") {
          if (room.status !== "QUESTION") return;
          const player = room.players.get(actorId);
          if (!player || player.answeredCurrentRound) return;
          const answerIndex = Number(msg.answerIndex);
          const currentQ = room.questions[room.currentIndex];
          if (!currentQ) return;

          const isCorrect = answerIndex === currentQ.correctIndex;
          const elapsed = Math.max(0, Date.now() - (room.questionStartedAt || Date.now()));
          const ratioRemaining = Math.max(0, 1 - elapsed / room.questionDurationMs);
          const basePoints = currentQ.points || 100;
          const pointsEarned = isCorrect ? Math.round(basePoints + ratioRemaining * 60 + player.streak * 15) : 0;

          player.answeredCurrentRound = true;
          player.lastAnswerIndex = answerIndex;
          player.lastAnswerCorrect = isCorrect;
          player.lastPointsEarned = pointsEarned;
          if (isCorrect) {
            player.score += pointsEarned;
            player.correctCount += 1;
            player.streak += 1;
          } else {
            player.streak = 0;
          }

          broadcastArenaState(room);

          // Auto-finish round early if every connected player has answered
          const connectedPlayers = Array.from(room.players.values()).filter((p) => p.connected);
          if (connectedPlayers.length > 0 && connectedPlayers.every((p) => p.answeredCurrentRound)) {
            setTimeout(() => {
              if (room.status === "QUESTION") {
                finalizeArenaRound(room);
              }
            }, 650);
          }
          return;
        }
      } catch (err) {
        console.error("Arena WS message error:", err);
      }
    });

    ws.on("close", () => {
      if (joinedRoomCode && joinedPlayerId) {
        const room = arenaRooms.get(joinedRoomCode);
        if (room) {
          room.sockets.delete(joinedPlayerId);
          const player = room.players.get(joinedPlayerId);
          if (player) {
            player.connected = false;
            broadcastArenaState(room);
          }
        }
      }
    });
  });

  wss.on("connection", async (clientWs) => {
    clientWs.on("error", (err) => {
      console.error("Client WS error:", err);
    });
    console.log("New client connected to /live");
    clientWs.send(JSON.stringify({ text: 'Hello from server /live' }));
    try {
      const session = await ai.live.connect({
        model: "gemini-3.8-live",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
          },
          systemInstruction: { parts: [{ text: `You are a professional IELTS Speaking examiner. Conduct a full speaking test: Part 1, Part 2, and Part 3. Be conversational, strict but friendly, and pace appropriately. 
Ask these exact questions one by one naturally, waiting for the candidate to respond:

Part 1:
- Let's talk about Public gardens and parks. Did you like going to parks as a child?
- Do you still like going to parks now?
- Would you like to see more parks in your city?
- Are there any parks you want to go to in the future?
- Let's talk about tidying up. Do you like to keep things tidy?
- Did you use to keep your room tidy when you were a child?
- Let's talk about Old buildings. Have you ever seen old buildings in the city？
- Do you think we should preserve old buildings in cities？
- Do you prefer living in an old building or a modern house？

Part 2:
Give the candidate 1 minute to prepare, then ask them to speak for 1-2 minutes on this topic:
Describe an environmental protection law.
You should say: What is it? How did you first learn about it? Who benefits from it? And explain how you feel about this law?

Part 3:
- Is there any situation where in people may disobey the law?
- What qualities should a police officer possess?
- How to solve major crimes in the city?
- Should people be penalized when they use mobile phones while driving?` }] },
        },
        callbacks: {
          onmessage: (message) => {
            console.log("GEMINI MESSAGE:", JSON.stringify(message));
            const parts = message.serverContent?.modelTurn?.parts || [];
            let textOutput = "";
            for (const p of parts) {
              if (p.text) textOutput += p.text;
            }
            if (textOutput) clientWs.send(JSON.stringify({ text: textOutput, isExaminer: true }));
            
            const audio = parts[0]?.inlineData?.data;
            if (audio) clientWs.send(JSON.stringify({ audio }));
            
            if (message.serverContent?.interrupted)
              clientWs.send(JSON.stringify({ interrupted: true }));
          },
          onclose: () => {
             console.log("Gemini Live session closed");
             clientWs.close();
          },
          onerror: (err) => {
             fs.writeFileSync("live-error2.log", err.toString()); console.error("Gemini Live error:", err);
          }
        },
      });

      clientWs.on("message", async (data) => {
        try {
          const { audio, text } = JSON.parse(data.toString());
          if (audio) {
            session.sendRealtimeInput({ media: { data: audio, mimeType: "audio/pcm;rate=16000" } });
          }
          if (text) {
            await session.sendClientContent({
              turns: [{ parts: [{ text }] }],
              turnComplete: true
            });
          }
        } catch(e) {
          console.error("Error processing client ws message:", e);
        }
      });
      
      clientWs.on("close", () => {
        console.log("Client disconnected, closing session");
      });
    } catch (e) {
      fs.writeFileSync("live-error.log", e.toString()); console.error("Failed to connect to Live API:", e);
      clientWs.close();
    }
  });
}

startServer();
