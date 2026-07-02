const { GoogleGenAI } = require("@google/genai");
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function test() {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-image-preview",
      contents: "Hello"
    });
    console.log("3 works:", response.text);
  } catch (e) {
    console.log("3 error:", e.message);
  }
}
test();
