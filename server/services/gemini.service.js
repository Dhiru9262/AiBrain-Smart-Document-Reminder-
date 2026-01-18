const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function extractDueDate(text) {
  // Use gemini-2.5-flash: it is faster, has thinking capabilities,
  // and is the current standard stable model for 2026.
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
    Extract the FINAL due date from the text below.
    Ignore phone numbers or IDs. 
    Return JSON only: {"due_date": "YYYY-MM-DD" | null, "confidence": "high" | "low"}
    
    Text: "${text}"
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const outText = response.text();

    const cleanedJson = outText.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanedJson);
  } catch (error) {
    console.error("❌ Gemini API Error:", error.message);
    throw error;
  }
}

module.exports = { extractDueDate };
