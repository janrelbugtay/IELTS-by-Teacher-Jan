const { GoogleGenAI } = require("@google/genai");
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function test() {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Hello"
    });
    console.log("2.5 works:", response.text);
  } catch (e) {
    console.log("2.5 error:", e.message);
  }
  try {
    const session = await ai.live.connect({ model: "gemini-2.5-flash" });
    console.log("2.5 live works");
    session.close();
  } catch(e) {
    console.log("2.5 live error:", e.message);
  }
  try {
    const session = await ai.live.connect({ model: "gemini-2.0-flash-exp" });
    console.log("2.0-exp live works");
    session.close();
  } catch(e) {
    console.log("2.0-exp live error:", e.message);
  }
}
test();
