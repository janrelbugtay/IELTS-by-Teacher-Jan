const fs = require('fs');

let serverCode = fs.readFileSync('server.ts', 'utf8');

const importDrive = `import { google } from "googleapis";\nimport multer from "multer";\n\nconst upload = multer({ storage: multer.memoryStorage() });\n`;

// Insert imports after other imports
serverCode = serverCode.replace('import { WebSocketServer } from "ws";\n', 'import { WebSocketServer } from "ws";\n' + importDrive);

const routeCode = `
  app.post("/api/upload-drive", upload.single("audio"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      
      const folderId = req.body.folderId || process.env.GOOGLE_DRIVE_FOLDER_ID;
      if (!folderId) {
        return res.status(500).json({ error: "Google Drive Folder ID is not configured" });
      }

      if (!process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
        return res.status(500).json({ error: "GOOGLE_SERVICE_ACCOUNT_JSON is missing." });
      }

      let credentials;
      try {
        credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
      } catch (e) {
        return res.status(500).json({ error: "GOOGLE_SERVICE_ACCOUNT_JSON is invalid JSON." });
      }
      
      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ["https://www.googleapis.com/auth/drive.file", "https://www.googleapis.com/auth/drive"],
      });

      const drive = google.drive({ version: "v3", auth });

      const fileMetadata = {
        name: req.body.filename || req.file.originalname || "recording.webm",
        parents: [folderId],
      };

      const { Readable } = require('stream');
      const media = {
        mimeType: req.file.mimetype || "audio/webm",
        body: Readable.from(req.file.buffer),
      };

      const file = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: "id, webViewLink, webContentLink",
      });

      // Make the file publicly readable so it can be played back by teachers/admins
      await drive.permissions.create({
        fileId: file.data.id,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        }
      });

      // Get updated metadata
      const updatedFile = await drive.files.get({
        fileId: file.data.id,
        fields: "id, webViewLink, webContentLink"
      });

      res.json({ 
        success: true, 
        fileId: updatedFile.data.id,
        webViewLink: updatedFile.data.webViewLink,
        webContentLink: updatedFile.data.webContentLink
      });
    } catch (err) {
      console.error("Drive upload error:", err);
      res.status(500).json({ error: err?.message || "Failed to upload to Google Drive" });
    }
  });
`;

serverCode = serverCode.replace('  app.get("/api/health", (req, res) => {', routeCode + '\n  app.get("/api/health", (req, res) => {');

fs.writeFileSync('server.ts', serverCode);
console.log("Patched server.ts with /api/upload-drive");
