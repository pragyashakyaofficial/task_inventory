const { GoogleGenAI } = require("@google/genai");

const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY);

const getReorderSuggestion = async (item) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
    You are an inventory assistant for a restaurant.
    
    Analyze this item and suggest if we should reorder:
    Item Name: ${item.name}
    Current Quantity: ${item.quantity}
    Status: ${item.status}
    
    Return a JSON object with:
    {
      "shouldReorder": boolean,
      "suggestedQuantity": number,
      "reason": string
    }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Attempt to parse JSON from the response
    const jsonMatch = text.match(/\{.*\}/s);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    throw new Error("Could not parse AI response");
  } catch (error) {
    console.error("AI Service Error:", error);
    // Fallback logic
    return {
      shouldReorder: item.status !== "In Stock",
      suggestedQuantity: item.status === "Out of Stock" ? 50 : (item.status === "Low Stock" ? 20 : 0),
      reason: "Fallback suggestion based on stock status."
    };
  }
};

module.exports = { getReorderSuggestion };
