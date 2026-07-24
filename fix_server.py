with open('server.ts', 'r') as f:
    content = f.read()

bad_api_audio = """  app.get("/api/audio", async (req, res) => {
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
  });"""

good_api_audio = """  app.get("/api/audio", async (req, res) => {
    try {
      const { id } = req.query;
      if (!id || typeof id !== 'string') {
        return res.status(400).send("Missing audio id");
      }
      const url = `https://drive.google.com/uc?export=download&id=${id}`;
      res.redirect(url);
    } catch (err) {
      console.error("Audio Proxy Error:", err);
      res.status(500).send("Failed to proxy audio.");
    }
  });"""

content = content.replace(bad_api_audio, good_api_audio)

with open('server.ts', 'w') as f:
    f.write(content)
print("Done")
