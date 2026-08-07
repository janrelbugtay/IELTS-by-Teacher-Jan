const fs = require('fs');

let serverCode = fs.readFileSync('server.ts', 'utf8');

const oldRouteStart = `  app.post("/api/upload-drive", upload.single("audio"), async (req, res) => {`;
const oldRouteEndMarker = `  app.post("/api/evaluate-writing",`;

// We'll extract the code before and after to replace the route
const startIndex = serverCode.indexOf(oldRouteStart);
const endIndex = serverCode.indexOf(oldRouteEndMarker);

if (startIndex !== -1 && endIndex !== -1) {
    const newRouteCode = `  app.post("/api/upload-drive", upload.single("audio"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      
      const folderId = req.body.folderId || process.env.GOOGLE_DRIVE_FOLDER_ID || "1d2io0UUmFF6OItoG_HybPZLe_noI5uxy";
      const scriptUrl = "https://script.google.com/macros/s/AKfycbyV0-09yEzIFZSzI8VtSur12zfKlJpUs8pPnq2VwNd3DgHOSV18EnzNmX3XCWKNaPlx/exec";
      
      const base64Data = req.file.buffer.toString('base64');
      
      const payload = {
        name: req.body.filename || req.file.originalname || \`speaking_test_\${Date.now()}.webm\`,
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

`;

    const before = serverCode.substring(0, startIndex);
    const after = serverCode.substring(endIndex);
    
    fs.writeFileSync('server.ts', before + newRouteCode + after);
    console.log("Patched server.ts with Apps Script upload route");
} else {
    console.log("Could not find route boundaries");
}
