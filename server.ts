import fs from "fs";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, ThinkingLevel, LiveServerMessage, Modality } from "@google/genai";
import dotenv from "dotenv";
import { WebSocketServer } from "ws";
import { google } from "googleapis";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

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

## STEP 9: Band 8–9 Sample Rewrite
Create a section called:
Band 8–9 Sample Rewrite
Rewrite the essay to Band 8–9 quality.
Requirements:
- Advanced vocabulary
- Sophisticated grammar
- Strong cohesion
- Natural academic tone
- Native-level fluency
Maintain the original meaning.

## STEP 10: Positive Feedback
Identify strengths.
Example:
### Strengths
🟢 Clear position throughout the essay.
🟢 Good paragraph organization.
🟢 Appropriate use of examples.
🟢 Attempts to use advanced vocabulary.

IMPORTANT RULES
- Never simply say "incorrect."
- Always provide a correction.
- Always explain why it is incorrect.
- Be strict like a real IELTS examiner.
- Detect both obvious and subtle errors.
- Preserve the student's original meaning whenever possible.
- Use British English spelling.
- Prioritize IELTS academic writing standards.
- Highlight every error using strikethrough formatting.
- Give actionable advice for improving the band score.
Your goal is to function as a professional IELTS examiner, grammar checker, writing coach, and Band 9 essay mentor simultaneously.`;

    try {
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Analyze the following IELTS ${taskType.replace(/([A-Z])/g, ' $1').trim()} submission:\n\n"${inputText}"`,
        config: {
          systemInstruction: systemPrompt,
        }
      });
      
      res.json({ feedback: response.text });
    } catch (err: any) {
      console.error("Gemini API Error:", err);
      const errorMessage = err?.message || "Failed to evaluate essay using Gemini API.";
      res.status(500).json({ error: errorMessage });
    }
  });

  app.post("/api/evaluate-writing-json", async (req, res) => {
    const { inputText, taskType, rawPrompt } = req.body;

    if (!inputText) {
      return res.status(400).json({ error: "Input text is required" });
    }

    const systemPrompt = `You are a certified IELTS examiner with extensive experience assessing IELTS Academic Writing Task 1 and Task 2 responses.
Your goal is to evaluate the student's writing strictly according to the official IELTS Writing Task Band Descriptors provided below.
Be strict and realistic. Do not inflate scores.
CRITICAL INSTRUCTION: You MUST carefully read the provided IELTS Writing Task Question. Evaluate the student's response SPECIFICALLY against this prompt. If the student's response is off-topic, memorized, or fails to address the specific topic and requirements of the prompt, you MUST severely penalize the Task Achievement / Task Response score (Band 5.0 or lower).

Perform ONLY the following tasks based strictly on the JSON schema provided:
1. Estimated Band Score (round to nearest 0.5). Output scores as short strings like '7.0' or '6.5'.
2. Detailed Examiner Feedback for Task Achievement/Response, Coherence & Cohesion, Lexical Resource, and Grammatical Range. Use the exact phrasing from the descriptors.
3. Error Marking: Provide the full essay with errors crossed out using <del class='text-red-500 line-through'> and corrections inserted using <ins class='text-green-600 font-bold no-underline'>.
4. Final Corrected Answer: Provide a clean, fully corrected version of the student's essay that fixes all grammatical, lexical, and structural errors while preserving their original meaning.

=== OFFICIAL IELTS WRITING BAND DESCRIPTORS ===

TASK 1 (Task Achievement, Coherence & Cohesion, Lexical Resource, Grammatical Range):
Band 9: fully satisfies all requirements; clearly presents a fully developed response. uses cohesion in such a way that it attracts no attention; skilfully manages paragraphing. uses a wide range of vocabulary with very natural and sophisticated control; rare minor 'slips'. uses a wide range of structures with full flexibility and accuracy; rare minor 'slips'.
Band 8: covers all requirements sufficiently; presents, highlights and illustrates key features clearly. sequences logically; manages cohesion well; uses paragraphing sufficiently. uses a wide range of vocabulary fluently and flexibly; skilfully uses uncommon lexical items. wide range of structures; majority of sentences are error-free.
Band 7: covers requirements; presents a clear overview of main trends/differences; clearly presents and highlights key features but could be more fully extended. logically organises information; clear progression; uses a range of cohesive devices appropriately. sufficient range of vocabulary for flexibility/precision; uses less common lexical items with style awareness. variety of complex structures; frequent error-free sentences; good control of grammar.
Band 6: addresses requirements; presents an overview with information appropriately selected. arranges information coherently; clear overall progression; effective cohesive devices (some faulty/mechanical). adequate range of vocabulary; attempts less common vocabulary (some inaccuracy). mix of simple/complex forms; some grammar errors rarely reduce communication.
Band 5: generally addresses task; recounts detail mechanically with no clear overview. some organisation but lack of overall progression; inadequate/inaccurate cohesive devices. limited vocabulary (minimally adequate). limited range of structures; frequent grammatical errors cause some difficulty.

TASK 2 (Task Response, Coherence & Cohesion, Lexical Resource, Grammatical Range):
Band 9: fully addresses all parts of the task; presents a fully developed position with relevant, fully extended and well-supported ideas. cohesion attracts no attention; skilfully manages paragraphing. wide range of vocabulary, sophisticated control; rare minor 'slips'. wide range of structures, full flexibility/accuracy; rare minor 'slips'.
Band 8: sufficiently addresses all parts; well-developed response with relevant, extended/supported ideas. sequences logically; manages cohesion well; paragraphs appropriately. wide vocabulary fluently/flexibly used; skilfully uses uncommon items. wide structures; majority error-free.
Band 7: addresses all parts; clear position throughout; presents/extends main ideas (may over-generalise). logically organises; clear progression; cohesive devices appropriate. sufficient vocabulary for flexibility/precision; awareness of style/collocation. variety of complex structures; frequent error-free sentences; good grammar control.
Band 6: addresses all parts (some more fully than others); relevant position (conclusions may be unclear); main ideas some inadequately developed. arranges coherently; clear overall progression; cohesive devices effective but may be mechanical. adequate vocabulary; attempts less common words. mix of simple/complex forms; errors rarely reduce communication.
Band 5: addresses task partially; position expressed but development unclear; main ideas limited/not sufficiently developed. some organisation, lack of overall progression; inadequate cohesion. limited vocabulary. limited structures; frequent grammatical errors cause difficulty.
`;

    try {
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `IELTS Writing Task ${taskType} Question:\n${rawPrompt}\n\nStudent's Response:\n${inputText}`,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.2,
          responseMimeType: "application/json",
          responseSchema: {
              type: "OBJECT",
              properties: {
                  scores: {
                      type: "OBJECT",
                      properties: {
                          taskAchievement: { type: "STRING", description: "Score as a string, e.g., '7.5'" },
                          coherenceCohesion: { type: "STRING", description: "Score as a string, e.g., '7.5'" },
                          lexicalResource: { type: "STRING", description: "Score as a string, e.g., '7.5'" },
                          grammaticalRange: { type: "STRING", description: "Score as a string, e.g., '7.5'" },
                          overallBand: { type: "STRING", description: "Score as a string, e.g., '7.5'" }
                      }
                  },
                  feedback: {
                      type: "OBJECT",
                      properties: {
                          taskAchievement: { type: "STRING" },
                          coherenceCohesion: { type: "STRING" },
                          lexicalResource: { type: "STRING" },
                          grammaticalRange: { type: "STRING" }
                      }
                  },
                  inlineMarkedEssay: { type: "STRING", description: "Full essay string. Use <del class='text-red-500 line-through'> for errors and <ins class='text-green-600 font-bold no-underline'> for fixes." },
                  finalCorrectedAnswer: { type: "STRING", description: "The student's essay, fully corrected to a high standard." }
              }
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
      
      const reportData = JSON.parse(parsedJsonText.trim());
      res.json(reportData);
    } catch (err: any) {
      console.error("Gemini API Error:", err);
      const errorMessage = err?.message || "Failed to evaluate essay using Gemini API.";
      res.status(500).json({ error: errorMessage });
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
        model: 'gemini-2.5-flash',
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
            model: 'gemini-2.5-flash',
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
        } catch (mErr: any) {
          console.warn("gemini-2.5-flash single evaluation fallback to gemini-3.8-flash:", mErr?.message);
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
        }

        const reportData = JSON.parse(response.text || "{}");
        return res.json(reportData);
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
          model: 'gemini-2.5-flash',
          contents: contentsParts,
          config: {
            systemInstruction: systemInstruction,
            responseMimeType: "application/json",
            temperature: 0.2,
            thinkingConfig: { thinkingBudget: 0 }
          }
        });
      } catch (geminiErr: any) {
        console.warn("gemini-2.5-flash error with budget 0, retrying standard gemini-2.5-flash:", geminiErr?.message);
        try {
          response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contentsParts,
            config: {
              systemInstruction: systemInstruction,
              responseMimeType: "application/json",
              temperature: 0.2,
            }
          });
        } catch (flashErr: any) {
          console.warn("gemini-2.5-flash retry failed, attempting gemini-3.8-flash:", flashErr?.message);
          response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: contentsParts,
            config: {
              systemInstruction: systemInstruction,
              responseMimeType: "application/json",
              temperature: 0.2,
            }
          });
        }
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
          improvements: [
            "Practice answering Part 2 for 2 full minutes without pausing.",
            "Review past tense verbs and subject-verb agreement in spoken sentences.",
            "Learn 3 natural topic-specific adjectives to replace overused words."
          ]
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

      const result = {
        scores: finalScores,
        overallBand: finalOverall,
        bandScore: finalOverall,
        feedback: typeof reportData.feedback === 'string' ? reportData.feedback : JSON.stringify(reportData.feedback, null, 2),
        improvements: Array.isArray(reportData.improvements) ? reportData.improvements : [],
        transcriptionSummary: reportData.transcriptionSummary || reportData.transcription || ""
      };

      return res.json(result);
    } catch (err: any) {
      console.error("Evaluate Speaking Error:", err);
      return res.status(400).json({ error: err?.message || "Failed to evaluate speaking test." });
    }
  });

    app.post("/api/translate-feedback", async (req, res) => {
    try {
      const { text, targetLanguage } = req.body;
      if (!text) {
        return res.status(400).json({ error: "Text is required" });
      }
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured" });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Translate the following IELTS evaluation feedback to ${targetLanguage || 'Vietnamese'}. Keep the tone professional and maintain any structural formatting (like bullet points or numbers). Do not add any extra commentary, just provide the translation:

${text}`
      });
      
      res.json({ translatedText: response.text });
    } catch (err) {
      console.error("Translation API Error:", err);
      res.status(500).json({ error: err?.message || "Failed to translate feedback" });
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
        model: 'gemini-3-pro-image-preview',
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

  const wss = new WebSocketServer({ server, path: '/live' });

  wss.on("connection", async (clientWs) => {
    console.log("New client connected to /live");
    clientWs.send(JSON.stringify({ text: 'Hello from server /live' }));
    try {
      const session = await ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
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
