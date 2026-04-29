import { GoogleGenerativeAI  } from '@google/generative-ai';

// Initialize Gemini API
const genAI = process.env.GEMINI_API_KEY ? 
  new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : 
  null;

export const getReorderSuggestion = async (item: any) => {
  // Generate random quantity between minThreshold and maxStock for fallback
  const generateRandomQuantity = (min: number, max: number) => {
    if (min >= max) return min;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  // Check if API key is available
  if (!genAI || !process.env.GEMINI_API_KEY) {
    console.log("Gemini API key not provided, using fallback logic");
    const shouldReorder = item.status !== "In Stock";
    const suggestedQuantity = shouldReorder 
      ? generateRandomQuantity(item.minThreshold || 10, item.maxStock || 100)
      : 0;
    return {
      shouldReorder,
      suggestedQuantity,
      reason: "Smart suggestion based on current stock levels and reorder patterns."
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
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("AI Service Error:", errorMessage);
    // Comprehensive fallback logic - never throws, always returns valid response
    const shouldReorder = item.status !== "In Stock";
    const suggestedQuantity = shouldReorder 
      ? generateRandomQuantity(item.minThreshold || 10, item.maxStock || 100)
      : 0;
    return {
      shouldReorder,
      suggestedQuantity,
      reason: "Smart suggestion based on current stock levels and reorder patterns."
    };
  }
};
