const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini API
const genAI = process.env.GEMINI_API_KEY ? 
  new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : 
  null;

const getReorderSuggestion = async (item) => {
  // Check if API key is available
  if (!genAI || !process.env.GEMINI_API_KEY) {
    console.log("Gemini API key not provided, using fallback logic");
    return {
      shouldReorder: item.status !== "In Stock",
      suggestedQuantity: item.status === "Out of Stock" ? 50 : (item.status === "Low Stock" ? 20 : 0),
      reason: "Fallback suggestion based on stock status (no API key)."
    };
  }

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
      const aiResponse = JSON.parse(jsonMatch[0]);
      
      // Validate AI response structure
      if (typeof aiResponse.shouldReorder === 'boolean' && 
          typeof aiResponse.suggestedQuantity === 'number' && 
          typeof aiResponse.reason === 'string') {
        return aiResponse;
      }
    }
    
    throw new Error("Invalid AI response structure");
  } catch (error) {
    console.error("AI Service Error:", error.message);
    // Comprehensive fallback logic - never throws, always returns valid response
    return {
      shouldReorder: item.status !== "In Stock",
      suggestedQuantity: item.status === "Out of Stock" ? 50 : (item.status === "Low Stock" ? 20 : 0),
      reason: `Fallback suggestion based on stock status (AI error: ${error.message}).`
    };
  }
};

module.exports = { getReorderSuggestion };
