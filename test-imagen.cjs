const { GoogleGenAI } = require("@google/genai");
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function test() {
  try {
    const response = await ai.models.generateImages({
      model: "imagen-3.0-generate-002",
      prompt: "A beautiful sunset"
    });
    console.log("imagen works:", response.generatedImages.length);
  } catch (e) {
    console.log("imagen error:", e.message);
  }
}
test();
