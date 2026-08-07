const fs = require('fs');

let serverCode = fs.readFileSync('server.ts', 'utf8');

const healthCode = `
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/audio", async (req, res) => {
    try {
      const { id } = req.query;
      if (!id || typeof id !== 'string') {
        return res.status(400).send("Missing audio id");
      }
      const url = \`https://drive.google.com/uc?export=download&id=\${id}&confirm=t\`;
      res.redirect(url);
    } catch (err) {
      console.error("Audio Proxy Error:", err);
      res.status(500).send("Failed to proxy audio.");
    }
  });

`;

serverCode = serverCode.replace('  app.post("/api/evaluate-writing",', healthCode + '  app.post("/api/evaluate-writing",');
fs.writeFileSync('server.ts', serverCode);
console.log("Fixed health endpoint");
