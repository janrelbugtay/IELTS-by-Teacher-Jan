import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, ThinkingLevel, LiveServerMessage, Modality } from "@google/genai";
import dotenv from "dotenv";
import { WebSocketServer } from "ws";

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

  app.use(express.json());

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/audio", async (req, res) => {
    try {
      const { id } = req.query;
      if (!id || typeof id !== 'string') {
        return res.status(400).send("Missing audio id");
      }
      const url = `https://drive.google.com/uc?export=download&id=${id}`;
      // Use dynamic import for node-fetch to support fetching in commonjs context
      const fetch = (await import('node-fetch')).default;
      const fetchRes = await fetch(url, { redirect: 'follow' });
      
      if (!fetchRes.ok) {
        return res.status(fetchRes.status).send("Failed to fetch audio");
      }

      res.set('Content-Type', fetchRes.headers.get('content-type') || 'audio/mpeg');
      res.set('Accept-Ranges', 'bytes');
      
      // Node-fetch body is a Node.js Readable stream
      if (fetchRes.body) {
        fetchRes.body.pipe(res);
      } else {
        res.status(500).send("No body in response");
      }
    } catch (err) {
      console.error("Audio Proxy Error:", err);
      res.status(500).send("Failed to proxy audio.");
    }
  });

  app.post("/api/evaluate-writing", async (req, res) => {
    const { inputText, taskType } = req.body;

    if (!inputText) {
      return res.status(400).json({ error: "Input text is required" });
    }

    const systemPrompt = `You are ERA AI, an expert IELTS Writing Examiner and English Language Correction Assistant trained to IELTS Band 9 standards.
Your primary role is to analyze a student's essay, identify every mistake, visually cross out incorrect words or phrases, provide corrections, explain the errors, estimate an IELTS band score, and rewrite the essay using natural academic English based STRICTLY on the rules from "Writing and speaking checklist.docx".

IMPORTANT RULES:
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
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Aoede" } }
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
      const { audioData, questionText } = req.body; // audioData is base64
      if (!audioData) {
        return res.status(400).json({ error: "Audio data is required" });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured" });
      }

      // Remove the data URI prefix if present and extract the mime type
      const mimeTypeMatch = audioData.match(/^data:(audio\/[\w.-]+);/);
      const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : "audio/webm";
      const base64Audio = audioData.replace(/^data:audio\/[\w.-]+(?:;[\w.-]+=[\w.-]+)*;base64,/, "");

      const systemPrompt = `You are a strict, professional IELTS Speaking Examiner evaluating a candidate's response.
Provide an estimated band score (0-9) and detailed feedback based on Fluency and Coherence, Lexical Resource, Grammatical Range and Accuracy, and Pronunciation.
Please return your response in JSON format.
{
  "bandScore": 7.5,
  "feedback": {
    "fluency": "...",
    "lexical": "...",
    "grammar": "...",
    "pronunciation": "..."
  },
  "improvements": ["...", "..."],
  "transcription": "What the user actually said"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          { text: `Question: ${questionText}\nEvaluate the candidate's audio response.` },
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Audio
            }
          }
        ],
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
        }
      });
      
      const reportData = JSON.parse(response.text || "{}");
      res.json(reportData);
    } catch (err: any) {
      console.error("Evaluate Speaking Error:", err);
      res.status(500).json({ error: err?.message || "Failed to evaluate speaking" });
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
    try {
      const session = await ai.live.connect({
        model: "gemini-2.5-flash",
        config: {
          responseModalities: [Modality.AUDIO, Modality.TEXT],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Aoede" } },
          },
          systemInstruction: `You are a professional IELTS Speaking examiner. Conduct a full speaking test: Part 1, Part 2, and Part 3. Be conversational, strict but friendly, and pace appropriately. 
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
- Should people be penalized when they use mobile phones while driving?`,
        },
        callbacks: {
          onmessage: (message) => {
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
             console.error("Gemini Live error:", err);
          }
        },
      });

      clientWs.on("message", (data) => {
        try {
          const { audio, text } = JSON.parse(data.toString());
          if (audio) {
            session.sendRealtimeInput({
              audio: { data: audio, mimeType: "audio/pcm;rate=16000" },
            });
          }
          if (text) {
            session.sendClientContent({
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
      console.error("Failed to connect to Live API:", e);
      clientWs.close();
    }
  });
}

startServer();
