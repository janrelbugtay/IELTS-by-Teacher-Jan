import fs from "fs";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, ThinkingLevel, Modality, Type } from "@google/genai";
import dotenv from "dotenv";
import { WebSocketServer, WebSocket } from "ws";
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
      "User-Agent": "aistudio-build",
    },
  },
});

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

interface ArenaQuestionItem {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
  points: number;
}

interface ArenaRoomState {
  roomCode: string;
  title: string;
  course: string;
  deckId: string;
  hostPlayerId: string;
  hostName: string;
  status: "LOBBY" | "QUESTION" | "ROUND_SUMMARY" | "FINISHED";
  questions: ArenaQuestionItem[];
  currentIndex: number;
  questionDurationMs: number;
  questionStartedAt: number | null;
  createdAt: number;
  players: Map<string, ArenaPlayerState>;
  sockets: Map<string, WebSocket>;
  timer: ReturnType<typeof setTimeout> | null;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // Upload to Google Drive via Apps Script
  app.post("/api/upload-drive", upload.single("audio"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const folderId = req.body.folderId || process.env.GOOGLE_DRIVE_FOLDER_ID || "1d2io0UUmFF6OItoG_HybPZLe_noI5uxy";
      const scriptUrl = "https://script.google.com/macros/s/AKfycbyV0-09yEzIFZSzI8VtSur12zfKlJpUs8pPnq2VwNd3DgHOSV18EnzNmX3XCWKNaPlx/exec";

      const base64Data = req.file.buffer.toString("base64");

      const payload = {
        name: req.body.filename || req.file.originalname || `speaking_test_${Date.now()}.webm`,
        mimeType: req.file.mimetype || "audio/webm",
        data: base64Data,
        folderId,
      };

      const response = await fetch(scriptUrl, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
        },
        body: JSON.stringify(payload),
      });

      const resultText = await response.text();
      let result: any;
      try {
        result = JSON.parse(resultText);
      } catch (_e) {
        console.error("Apps script response:", resultText);
        throw new Error("Invalid response from Apps Script: " + resultText.substring(0, 100));
      }

      if (result && (result.success || result.url || result.fileId || result.webViewLink)) {
        res.json({
          success: true,
          fileId: result.fileId || result.id || "unknown",
          webViewLink: result.url || result.webViewLink || result.link || "",
        });
      } else {
        throw new Error(result?.error || "Unknown error from Apps Script");
      }
    } catch (err: any) {
      console.error("Drive upload error (Apps Script):", err);
      res.status(500).json({ error: err?.message || "Failed to upload to Google Drive via Apps Script" });
    }
  });

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // Speaking Recordings Storage
  const SPEAKING_DIR = path.join(process.cwd(), "uploads", "speaking");
  if (!fs.existsSync(SPEAKING_DIR)) {
    fs.mkdirSync(SPEAKING_DIR, { recursive: true });
  }

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
        size: req.file.size,
      });
    } catch (err: any) {
      console.error("Error saving speaking audio:", err);
      return res.status(500).json({ error: err.message || "Failed to save audio" });
    }
  });

  app.get("/api/speaking/check/:filename", (req, res) => {
    const filename = req.params.filename.replace(/[^a-zA-Z0-9_.-]/g, "_");
    const filePath = path.join(SPEAKING_DIR, filename);
    const exists = fs.existsSync(filePath);
    return res.json({ exists });
  });

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

        const chunksize = end - start + 1;
        const fileStream = fs.createReadStream(filePath, { start, end });
        res.writeHead(206, {
          "Content-Range": `bytes ${start}-${end}/${stat.size}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunksize,
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=86400",
        });
        fileStream.pipe(res);
      } else {
        res.writeHead(200, {
          "Content-Length": stat.size,
          "Content-Type": contentType,
          "Accept-Ranges": "bytes",
          "Cache-Control": "public, max-age=86400",
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
      if (!id || typeof id !== "string") {
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
    const { inputText, taskType, rawPrompt } = req.body || {};
    if (!inputText) {
      return res.status(400).json({ error: "Input text is required" });
    }

    const systemPrompt = `You are ERA AI, an expert IELTS Writing Examiner trained to IELTS Band 9 standards.
Evaluate the student's ${taskType === "task1" || String(taskType) === "1" ? "Task 1" : "Task 2"} writing response against the prompt using official IELTS Writing Band Descriptors.
${rawPrompt ? `Task Prompt:\n${rawPrompt}\n` : ""}
Provide:
1. Inline Corrections using ~~incorrect~~ **correction**
2. Error Analysis Table (| Original | Correction | Error Type | Explanation |)
3. Grammar & Vocabulary Improvement Roadmap
4. Fully Corrected Essay & Band 8 Sample Rewrite
5. Official IELTS Band Score Estimation table (Task Achievement/Response, Coherence & Cohesion, Lexical Resource, Grammatical Range & Accuracy) and line: **Final IELTS Band = X.X**`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-4-hydrogen",
        contents: `${systemPrompt}\n\nStudent Essay:\n${inputText}`,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        },
      });
      return res.json({ feedback: response.text || "" });
    } catch (err) {
      console.error("Evaluate writing markdown error, using fallback:", err);
      const fallback = evaluateIeltsWritingMarkdownFallback(inputText, taskType, rawPrompt || "");
      return res.json({ feedback: fallback });
    }
  });

  app.post("/api/evaluate-writing-json", async (req, res) => {
    const { inputText, taskType = "2", rawPrompt = "" } = req.body || {};
    if (!inputText) {
      return res.status(400).json({ error: "Input text is required" });
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-4-hydrogen",
        contents: `You are a certified IELTS Writing Examiner. Evaluate this IELTS Writing Task ${taskType} essay strictly using official IELTS Band Descriptors.
${rawPrompt ? `Task Prompt:\n${rawPrompt}\n` : ""}
Student Essay:
${inputText}`,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              scores: {
                type: Type.OBJECT,
                properties: {
                  taskAchievement: { type: Type.STRING },
                  coherenceCohesion: { type: Type.STRING },
                  lexicalResource: { type: Type.STRING },
                  grammaticalRange: { type: Type.STRING },
                  overallBand: { type: Type.STRING },
                },
                required: ["taskAchievement", "coherenceCohesion", "lexicalResource", "grammaticalRange", "overallBand"],
              },
              feedback: {
                type: Type.OBJECT,
                properties: {
                  taskAchievement: { type: Type.STRING },
                  coherenceCohesion: { type: Type.STRING },
                  lexicalResource: { type: Type.STRING },
                  grammaticalRange: { type: Type.STRING },
                },
                required: ["taskAchievement", "coherenceCohesion", "lexicalResource", "grammaticalRange"],
              },
              keyStrengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              keyWeaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
              inlineMarkedEssay: {
                type: Type.STRING,
                description: "HTML paragraphs wrapping errors with <del class='text-red-500 line-through'>wrong</del> <ins class='text-green-600 font-bold no-underline'>right</ins>",
              },
              finalCorrectedAnswer: { type: Type.STRING },
              targetBand: { type: Type.STRING },
            },
            required: ["scores", "feedback", "keyStrengths", "keyWeaknesses", "inlineMarkedEssay", "finalCorrectedAnswer"],
          },
        },
      });

      const parsed = JSON.parse((response.text ?? "{}").trim());
      return res.json(parsed);
    } catch (err) {
      console.error("Evaluate writing JSON error, using fallback:", err);
      const fallback = evaluateIeltsWritingJsonFallback(inputText, taskType, rawPrompt);
      return res.json(fallback);
    }
  });

  app.post("/api/evaluate-speaking", async (req, res) => {
    const { testTitle = "IELTS Speaking Test", questions, audioRecordings = [] } = req.body || {};

    try {
      const parts: any[] = [];
      const promptLines: string[] = [
        `You are a certified IELTS Speaking Examiner evaluating recordings for "${testTitle}".`,
        `Evaluate strictly on the four IELTS Speaking criteria (0.0 to 9.0 in 0.5 increments): Fluency & Coherence (FC), Lexical Resource (LR), Grammatical Range & Accuracy (GRA), and Pronunciation (PR).`,
        `Return detailed Markdown feedback with sections: Teacher's Feedback, Fluency & Coherence, Vocabulary & Word Choice, Grammar & Sentence Structure, and Pronunciation.`
      ];

      for (const rec of Array.isArray(audioRecordings) ? audioRecordings.slice(0, 3) : []) {
        promptLines.push(`Question (${rec.label || rec.qId || "Clip"}): ${rec.questionText || ""}`);
        if (rec.audioBase64 && typeof rec.audioBase64 === "string") {
          const match = rec.audioBase64.match(/^data:([^;]+);base64,(.+)$/);
          const mimeType = rec.mimeType || (match ? match[1] : "audio/webm");
          const data = match ? match[2] : rec.audioBase64;
          if (data && data.length > 50) {
            parts.push({ inlineData: { mimeType, data } });
          }
        }
      }

      parts.push({ text: promptLines.join("\n\n") });

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: { parts },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              scores: {
                type: Type.OBJECT,
                properties: {
                  FC: { type: Type.NUMBER },
                  LR: { type: Type.NUMBER },
                  GRA: { type: Type.NUMBER },
                  PR: { type: Type.NUMBER },
                },
                required: ["FC", "LR", "GRA", "PR"],
              },
              overallBand: { type: Type.NUMBER },
              feedback: { type: Type.STRING },
            },
            required: ["scores", "overallBand", "feedback"],
          },
        },
      });

      const parsed = JSON.parse((response.text ?? "{}").trim());
      return res.json({
        scores: parsed.scores,
        overallBand: parsed.overallBand,
        bandScore: parsed.overallBand,
        feedback: parsed.feedback,
        improvements: [],
      });
    } catch (err) {
      console.error("Evaluate speaking error, using fallback:", err);
      const fallback = evaluateIeltsSpeakingFallback({ testTitle, questions, audioRecordings });
      return res.json(fallback);
    }
  });

  app.post("/api/generate-image", async (req, res) => {
    try {
      const { prompt } = req.body || {};
      if (!prompt || typeof prompt !== "string") {
        return res.status(400).json({ error: "Image prompt is required." });
      }
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite-image",
        contents: prompt,
      });
      const candidateParts = response.candidates?.[0]?.content?.parts || [];
      for (const part of candidateParts) {
        if (part.inlineData?.data) {
          const mime = part.inlineData.mimeType || "image/png";
          return res.json({ imageUrl: `data:${mime};base64,${part.inlineData.data}` });
        }
      }
      return res.status(500).json({ error: "No image data returned from model." });
    } catch (err: any) {
      console.error("Generate image error:", err);
      return res.status(500).json({ error: err?.message || "Failed to generate image" });
    }
  });

  // Multiplayer Arena Room State & Helpers
  const arenaRooms = new Map<string, ArenaRoomState>();

  const generateRoomCode = (): string => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    for (let attempt = 0; attempt < 20; attempt++) {
      let code = "";
      for (let i = 0; i < 6; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
      }
      if (!arenaRooms.has(code)) return code;
    }
    return `ERA${Date.now().toString().slice(-4)}`;
  };

  const broadcastArenaState = (room: ArenaRoomState) => {
    const payload = JSON.stringify({
      type: "arena:state",
      roomCode: room.roomCode,
      title: room.title,
      course: room.course,
      deckId: room.deckId,
      hostPlayerId: room.hostPlayerId,
      hostName: room.hostName,
      status: room.status,
      currentIndex: room.currentIndex,
      totalQuestions: room.questions.length,
      currentQuestion: room.questions[room.currentIndex] || null,
      questionDurationMs: room.questionDurationMs,
      questionStartedAt: room.questionStartedAt,
      players: Array.from(room.players.values()).sort((a, b) => b.score - a.score),
    });

    for (const sock of room.sockets.values()) {
      if (sock.readyState === WebSocket.OPEN) {
        sock.send(payload);
      }
    }
  };

  const finalizeArenaRound = (room: ArenaRoomState) => {
    if (room.timer) {
      clearTimeout(room.timer);
      room.timer = null;
    }
    if (room.currentIndex + 1 >= room.questions.length) {
      room.status = "FINISHED";
    } else {
      room.status = "ROUND_SUMMARY";
    }
    broadcastArenaState(room);
  };

  const beginArenaQuestion = (room: ArenaRoomState, index: number) => {
    if (room.timer) {
      clearTimeout(room.timer);
      room.timer = null;
    }
    if (index >= room.questions.length) {
      room.status = "FINISHED";
      broadcastArenaState(room);
      return;
    }
    room.currentIndex = index;
    room.status = "QUESTION";
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
      .filter((r) => r.status !== "FINISHED")
      .map((r) => ({
        roomCode: r.roomCode,
        title: r.title,
        course: r.course,
        hostName: r.hostName,
        status: r.status,
        playerCount: r.players.size,
        totalQuestions: r.questions.length,
        createdAt: r.createdAt,
      }))
      .sort((a, b) => b.createdAt - a.createdAt);
    res.json({ rooms });
  });

  // ============================================================================
  // ERA FACULTY HQ: AI EMPLOYEE EXAM ASSESSMENT & CREATIVE CONTENT PRODUCTION
  // ============================================================================
  app.post("/api/faculty/assess-exam", async (req, res) => {
    try {
      const {
        examProfile = "ielts_academic",
        skill = "Writing",
        employeeName = "Dr. Victoria Sterling",
        employeeTitle = "Writing Examiner",
        promptOrQuestion = "",
        studentResponseText = "",
        answerKeyText = "",
        studentName = "Student",
        fileBase64,
        fileMimeType,
      } = req.body || {};

      const rubricSystemMap: Record<string, string> = {
        cambridge_starters:
          "Cambridge Young Learners Pre-A1 Starters Official Rubric. Score strictly in 1 to 5 Cambridge Shields (🛡️). NEVER use IELTS band scores. Evaluate picture-word matching, letter/word spelling, and simple Pre-A1 comprehension or spoken naming.",
        cambridge_movers:
          "Cambridge Young Learners A1 Movers Official Rubric. Score strictly in 1 to 5 Cambridge Shields (🛡️). NEVER use IELTS band scores. Evaluate A1 reading/listening comprehension, Part 6 picture sentence writing, or 4-picture story speaking.",
        cambridge_flyers:
          "Cambridge Young Learners A2 Flyers Official Rubric. Score strictly in 1 to 5 Cambridge Shields (🛡️). NEVER use IELTS band scores. Evaluate A2 open cloze, Part 7 three-picture short story writing (20+ words), or information-exchange speaking.",
        cambridge_ket:
          "Official Cambridge A2 Key (KET) Rubric. NEVER use IELTS band scores. For Writing (Part 6 Email / Part 7 Story) score 0–5 each on Content, Organisation, and Language (/15 total, mapped to Cambridge English Scale 100–150). For Speaking score 0–5 on Grammar & Vocabulary, Pronunciation, and Interactive Communication. For Reading/Listening mark objective answers against the answer key and map to 100–150 scale.",
        cambridge_pet:
          "Official Cambridge B1 Preliminary (PET) Rubric. NEVER use IELTS band scores. For Writing (Part 1 Email / Part 2 Article or Story, ~100 words) score 0–5 each on Content, Communicative Achievement, Organisation, and Language (/20 total, mapped to Cambridge English Scale 120–170). For Speaking score 0–5 on Grammar & Vocabulary, Discourse Management, Pronunciation, and Interactive Communication. For Reading/Listening mark objective answers and map to 120–170 scale.",
        ielts_academic:
          "Official IELTS Academic 0.0–9.0 Band Descriptors (0.5 increments). For Writing evaluate Task Achievement (Task 1) / Task Response (Task 2), Coherence & Cohesion, Lexical Resource, and Grammatical Range & Accuracy. For Speaking evaluate Fluency & Coherence, Lexical Resource, Grammatical Range & Accuracy, and Pronunciation. For Reading/Listening mark objective answers and convert raw score (/40) to IELTS Academic Band.",
        ielts_general:
          "Official IELTS General Training 0.0–9.0 Band Descriptors (0.5 increments). For Writing Task 1 evaluate Letter tone, purpose, and bullet coverage; Task 2 evaluate discursive essay. For Speaking evaluate FC, LR, GRA, Pron. For Reading/Listening mark objective answers and convert to IELTS General Training Band.",
      };

      const selectedRubricRule = rubricSystemMap[examProfile] || rubricSystemMap.ielts_academic;

      let transcribedOrExtractedInput = studentResponseText || "";
      if (fileBase64 && fileMimeType && fileMimeType.startsWith("audio/")) {
        const cleanBase64 = String(fileBase64).replace(/^data:[^;]+;base64,/, "");
        const trResp = await ai.models.generateContent({
          model: "gemini-3.5-transcribe",
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType: fileMimeType,
                  data: cleanBase64,
                },
              },
              {
                text: "Transcribe this student's spoken English recording verbatim, including natural pauses or pronunciation slips.",
              },
            ],
          },
        });
        if (trResp.text) {
          transcribedOrExtractedInput = `${transcribedOrExtractedInput ? transcribedOrExtractedInput + "\n\n" : ""}[Audio Transcript]: ${trResp.text.trim()}`;
        }
      }

      const parts: any[] = [];
      if (fileBase64 && fileMimeType && !fileMimeType.startsWith("audio/")) {
        const cleanBase64 = String(fileBase64).replace(/^data:[^;]+;base64,/, "");
        parts.push({
          inlineData: {
            mimeType: fileMimeType,
            data: cleanBase64,
          },
        });
      }

      const instructionText = `You are ${employeeName}, ${employeeTitle} at ERA FACULTY HQ.
You are evaluating a student assessment for:
- Examination Profile: ${examProfile}
- Skill: ${skill}
- Student / Batch: ${studentName}
- Mandatory Rubric Rule: ${selectedRubricRule}

Task / Exam Prompt:
${promptOrQuestion || "(General assessment for the selected exam and skill)"}

Official Answer Key (if Reading/Listening objective marking):
${answerKeyText || "(Use standard official answers or evaluate open response)"}

Student Submission / Transcript:
${transcribedOrExtractedInput || "(Extract student handwriting/answers from the attached image via OCR)"}

Perform a thorough, authentic assessment:
1. If an image of handwritten writing or an answer sheet is attached, perform full OCR extraction into extractedTextOcrOrTranscript. If audio was transcribed, include the full transcript in extractedTextOcrOrTranscript.
2. Strictly apply the ${examProfile} rubric for ${skill}. NEVER apply IELTS band scores to Cambridge Starters, Movers, Flyers, KET, or PET.
3. For Reading/Listening: mark objective answers, calculate the score, identify incorrect answers, and explain why the correct answer is right.
4. For Writing/Speaking: provide inline error corrections (using ~~mistake~~ **correction** format), evaluate every rubric criterion, list concrete strengths and weaknesses, write a comprehensive examiner report in Markdown, and provide an elevated model answer or improved version appropriate to the target exam level.
5. Remember this assessment is PROVISIONAL until approved by Teacher Jan.`;

      parts.push({ text: instructionText });

      const response = await ai.models.generateContent({
        model: "gemini-4-hydrogen",
        contents: { parts },
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summaryScoreLabel: { type: Type.STRING },
              numericScore: { type: Type.NUMBER },
              maxNumericScore: { type: Type.NUMBER },
              cefrEstimate: { type: Type.STRING },
              extractedTextOcrOrTranscript: { type: Type.STRING },
              inlineCorrectionsOrMarking: { type: Type.STRING },
              criteriaBreakdown: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    criterion: { type: Type.STRING },
                    score: { type: Type.STRING },
                    feedback: { type: Type.STRING },
                  },
                  required: ["criterion", "score", "feedback"],
                },
              },
              strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
              examinerReportMarkdown: { type: Type.STRING },
              suggestedImprovementOrModelAnswer: { type: Type.STRING },
            },
            required: [
              "summaryScoreLabel",
              "numericScore",
              "maxNumericScore",
              "cefrEstimate",
              "extractedTextOcrOrTranscript",
              "inlineCorrectionsOrMarking",
              "criteriaBreakdown",
              "strengths",
              "weaknesses",
              "examinerReportMarkdown",
              "suggestedImprovementOrModelAnswer",
            ],
          },
        },
      });

      const parsed = JSON.parse((response.text ?? "{}").trim());
      return res.json({ success: true, result: parsed });
    } catch (err: any) {
      console.error("Faculty assess-exam error:", err);
      return res.status(500).json({
        error: err?.message || "Failed to run AI examination assessment.",
      });
    }
  });

  app.post("/api/faculty/generate-content", async (req, res) => {
    try {
      const {
        creativeTool = "mcq",
        examProfile = "cambridge_movers",
        cefrLevel = "A1",
        topic = "Daily Routines & School Life",
        questionCount = 8,
        difficulty = "Medium",
        employeeName = "Lucas Vega",
        employeeTitle = "Quiz Maker",
        customInstructions = "",
      } = req.body || {};

      const safeCount = Math.max(3, Math.min(20, Number(questionCount) || 8));

      const prompt = `You are ${employeeName}, ${employeeTitle} in the Creative Teaching Department at ERA FACULTY HQ.
Generate high-quality, classroom-ready educational material with these exact parameters:
- Generator Tool: ${creativeTool}
- Target Examination / Course: ${examProfile} (CEFR Level: ${cefrLevel})
- Topic / Theme: ${topic}
- Number of Items / Questions / Slides: ${safeCount}
- Difficulty: ${difficulty}
${customInstructions ? `- Additional Teacher Notes: ${customInstructions}` : ""}

Requirements:
1. Create a complete, printable Markdown document in 'examinerReportMarkdown' containing the full worksheet, lesson plan, reading passage, listening script, writing prompt + model essay, or slide deck + answer key.
2. Also populate 'generatedQuestions' with ${safeCount} multiple-choice / quiz items (each with 4 options and correctIndex 0–3) so the teacher can publish this content directly to EraGames (Bubble Island) or Homework in 1 click!
3. If creativeTool is 'ppt_lesson', populate 'generatedSlides' with ${safeCount} structured slides (title, bullets, speakerNotes).
4. If creativeTool is 'flashcards' or 'vocab_worksheet', populate 'generatedFlashcards' with ${safeCount} vocabulary flashcards (front, back, example).`;

      const response = await ai.models.generateContent({
        model: "gemini-4-hydrogen",
        contents: prompt,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              summaryScoreLabel: { type: Type.STRING },
              cefrEstimate: { type: Type.STRING },
              examinerReportMarkdown: { type: Type.STRING },
              suggestedImprovementOrModelAnswer: { type: Type.STRING },
              generatedQuestions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    question: { type: Type.STRING },
                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                    correctIndex: { type: Type.INTEGER },
                    explanation: { type: Type.STRING },
                  },
                  required: ["question", "options", "correctIndex", "explanation"],
                },
              },
              generatedSlides: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    slideNumber: { type: Type.INTEGER },
                    title: { type: Type.STRING },
                    bullets: { type: Type.ARRAY, items: { type: Type.STRING } },
                    speakerNotes: { type: Type.STRING },
                  },
                  required: ["slideNumber", "title", "bullets", "speakerNotes"],
                },
              },
              generatedFlashcards: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    front: { type: Type.STRING },
                    back: { type: Type.STRING },
                    example: { type: Type.STRING },
                  },
                  required: ["front", "back", "example"],
                },
              },
            },
            required: [
              "title",
              "summaryScoreLabel",
              "cefrEstimate",
              "examinerReportMarkdown",
              "suggestedImprovementOrModelAnswer",
              "generatedQuestions",
              "generatedSlides",
              "generatedFlashcards",
            ],
          },
        },
      });

      const parsed = JSON.parse((response.text ?? "{}").trim());
      return res.json({
        success: true,
        result: {
          ...parsed,
          numericScore: safeCount,
          maxNumericScore: safeCount,
          criteriaBreakdown: [
            { criterion: "Target Level Alignment", score: cefrLevel, feedback: `Aligned with ${examProfile} standards.` },
            { criterion: "Interactive Items Generated", score: `${parsed.generatedQuestions?.length || safeCount} Items`, feedback: "Ready for PDF export, Homework, or EraGames Bubble Island." },
          ],
          strengths: ["Includes full Teacher Answer Key", "Directly publishable to EraGames & Homework"],
          weaknesses: [],
        },
      });
    } catch (err: any) {
      console.error("Faculty generate-content error:", err);
      return res.status(500).json({
        error: err?.message || "Failed to generate creative teaching material.",
      });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
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
              points: Number.isFinite(Number(q.points)) ? Number(q.points) : 100,
            })),
            currentIndex: 0,
            questionDurationMs: Math.min(30000, Math.max(8000, Number(msg.questionDurationMs) || 15000)),
            questionStartedAt: null,
            createdAt: Date.now(),
            players: new Map(),
            sockets: new Map(),
            timer: null,
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
            connected: true,
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
              connected: true,
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
    clientWs.send(JSON.stringify({ text: "Hello from server /live" }));
    try {
      const session = await ai.live.connect({
        model: "gemini-3.8-live",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
          },
          systemInstruction: {
            parts: [
              {
                text: `You are a professional IELTS Speaking examiner. Conduct a full speaking test: Part 1, Part 2, and Part 3. Be conversational, strict but friendly, and pace appropriately.`,
              },
            ],
          },
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
            if (message.serverContent?.interrupted) {
              clientWs.send(JSON.stringify({ interrupted: true }));
            }
          },
          onclose: () => {
            clientWs.close();
          },
          onerror: (err) => {
            console.error("Gemini Live error:", err);
          },
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
              turnComplete: true,
            });
          }
        } catch (e) {
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
