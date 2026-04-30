import { GoogleGenerativeAI  } from '@google/generative-ai';

// Initialize Gemini API
const genAI = process.env.GEMINI_API_KEY ? 
  new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : 
  null;

export const getReorderSuggestion = async (item: any) => {
  // Calculate suggested quantity based on stock status
  const calculateSuggestedQuantity = (status: string, currentQty: number, minThreshold: number) => {
    if (status === 'OUT' || status === 'out-of-stock') {
      return minThreshold; // Order up to minimum threshold when out of stock
    }
    return Math.max(0, minThreshold - currentQty); // Order enough to reach minimum threshold for low stock
  };

  // Check if API key is available
  if (!genAI || !process.env.GEMINI_API_KEY) {
    console.log("Gemini API key not provided, using fallback logic");
    const shouldReorder = item.status !== "In Stock" && item.status !== "OK";
    const suggestedQuantity = shouldReorder
      ? calculateSuggestedQuantity(item.status, item.quantity || 0, item.minThreshold || 10)
      : 0;
    return {
      shouldReorder,
      suggestedQuantity,
      reason: shouldReorder
        ? `${item.name} is ${item.status === 'OUT' || item.status === 'out-of-stock' ? 'out of stock' : 'below minimum threshold'}. Suggest ordering ${suggestedQuantity} ${item.unit || 'units'} to reach minimum threshold.`
        : "Item is sufficiently stocked.",
      aiGenerated: false
    };
  }

  try {
    console.log(`[AIService] Processing item: ${item.name}, status: ${item.status}`);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

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
    console.log(`[AIService] Raw AI response for ${item.name}:`, text.substring(0, 500));
    
    // Attempt to parse JSON from the response
    const jsonMatch = text.match(/\{.*\}/s);
    if (jsonMatch) {
      console.log(`[AIService] JSON match found for ${item.name}:`, jsonMatch[0]);
      const aiResponse = JSON.parse(jsonMatch[0]);
      console.log(`[AIService] Parsed AI response for ${item.name}:`, JSON.stringify(aiResponse));
      
      // Validate AI response structure
      if (typeof aiResponse.shouldReorder === 'boolean' &&
          typeof aiResponse.suggestedQuantity === 'number' &&
          typeof aiResponse.reason === 'string') {
        console.log(`[AIService] ✅ Valid AI response for ${item.name}`);
        return {
          ...aiResponse,
          aiGenerated: true
        };
      } else {
        console.log(`[AIService] ❌ Invalid AI response structure for ${item.name}:`, {
          shouldReorder: typeof aiResponse.shouldReorder,
          suggestedQuantity: typeof aiResponse.suggestedQuantity,
          reason: typeof aiResponse.reason
        });
      }
    } else {
      console.log(`[AIService] ❌ No JSON match found in AI response for ${item.name}`);
    }
    
    throw new Error("Invalid AI response structure");
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("AI Service Error:", errorMessage);
    // Comprehensive fallback logic - never throws, always returns valid response
    const shouldReorder = item.status !== "In Stock" && item.status !== "OK";
    const suggestedQuantity = shouldReorder
      ? calculateSuggestedQuantity(item.status, item.quantity || 0, item.minThreshold || 10)
      : 0;
    return {
      shouldReorder,
      suggestedQuantity,
      reason: shouldReorder
        ? `${item.name} is ${item.status === 'OUT' || item.status === 'out-of-stock' ? 'out of stock' : 'below minimum threshold'}. Suggest ordering ${suggestedQuantity} ${item.unit || 'units'} to reach minimum threshold.`
        : "Item is sufficiently stocked.",
      aiGenerated: false
    };
  }
};
