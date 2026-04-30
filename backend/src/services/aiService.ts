import { GoogleGenerativeAI  } from '@google/generative-ai';

// Initialize Gemini API
const genAI = process.env.GEMINI_API_KEY ? 
  new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : 
  null;

// Calculate suggested quantity based on stock status
const calculateSuggestedQuantity = (status: string, currentQty: number, minThreshold: number) => {
  if (status === 'OUT' || status === 'out-of-stock') {
    return minThreshold; // Order up to minimum threshold when out of stock
  }
  return Math.max(0, minThreshold - currentQty); // Order enough to reach minimum threshold for low stock
};

// Build a fallback suggestion for a single item
const buildFallbackSuggestion = (item: any) => {
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
};

// Process ALL low-stock/out-of-stock items in a single AI call
export const getReorderSuggestions = async (items: any[]) => {
  // Check if API key is available
  if (!genAI || !process.env.GEMINI_API_KEY) {
    console.log("[AIService] Gemini API key not provided, using fallback logic for all items");
    return items.map(item => ({ ...buildFallbackSuggestion(item), aiGenerated: false }));
  }

  try {
    console.log(`[AIService] Processing ${items.length} items in single AI call`);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const itemsList = items.map((item, i) =>
      `${i + 1}. ${item.name}: Current=${item.quantity} ${item.unit || 'units'}, Status=${item.status}, MinThreshold=${item.minThreshold}, MaxStock=${item.maxStock || 'N/A'}`
    ).join('\n');

    const prompt = `
You are an inventory assistant for a restaurant.

Analyze ALL the following items that are low-stock or out-of-stock and suggest reorder quantities for each:

${itemsList}

Return a JSON array where each element corresponds to an item in the same order:
[
  {
    "name": "item name",
    "shouldReorder": boolean,
    "suggestedQuantity": number,
    "reason": "brief explanation for the suggestion"
  }
]

Important:
- Consider the item's importance as a restaurant ingredient
- Suggest quantities that make practical sense for a restaurant (not just reaching minimum threshold)
- Keep reasons concise (1-2 sentences)
- Return ONLY the JSON array, no other text
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log(`[AIService] Raw AI response:`, text.substring(0, 1000));

    // Attempt to parse JSON array from the response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const aiResponses = JSON.parse(jsonMatch[0]);

      if (Array.isArray(aiResponses) && aiResponses.length === items.length) {
        console.log(`[AIService] ✅ Valid AI response for all ${items.length} items`);
        return items.map((item, i) => {
          const ai = aiResponses[i];
          if (ai &&
              typeof ai.shouldReorder === 'boolean' &&
              typeof ai.suggestedQuantity === 'number' &&
              typeof ai.reason === 'string') {
            return {
              shouldReorder: ai.shouldReorder,
              suggestedQuantity: ai.suggestedQuantity,
              reason: ai.reason,
              aiGenerated: true
            };
          }
          // Fallback for individual item if AI response is invalid
          console.log(`[AIService] ❌ Invalid AI response for item ${item.name}, using fallback`);
          return buildFallbackSuggestion(item);
        });
      } else {
        console.log(`[AIService] ❌ AI response array length mismatch. Expected ${items.length}, got ${aiResponses?.length}`);
      }
    } else {
      console.log(`[AIService] ❌ No JSON array found in AI response`);
    }

    throw new Error("Invalid AI response structure");
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("[AIService] Error:", errorMessage);
    // Comprehensive fallback logic - never throws, always returns valid response
    return items.map(item => buildFallbackSuggestion(item));
  }
};
