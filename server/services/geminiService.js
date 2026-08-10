const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize the Gemini API with the key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateTrip = async ({ destination, budget, days, interests }) => {
  const prompt = `Create a detailed day-by-day travel itinerary for a trip to ${destination}. 
Parameters:
- Duration: ${days} days
- Budget: ${budget}
- Interests: ${interests}
- Currency: ALL estimated costs and prices MUST be shown in Indian Rupees (₹).

Please respond strictly in JSON using the following structure:
{
  "summary": "Brief overview of the trip",
  "estimatedCost": "Approximate total cost string",
  "highlights": ["Iconic Landmark 1", "Iconic Landmark 2", "Iconic Landmark 3", "Iconic Landmark 4"],
  "travelTips": ["tip1", "tip2"],
  "days": [
    {
      "day": 1,
      "dateDescription": "Day 1: Arrival and orientation",
      "activities": [
        {
          "time": "Morning",
          "description": "Activity description",
          "cost": "Cost string"
        }
      ],
      "foodSuggestions": [
        {
          "meal": "Lunch",
          "place": "Restaurant name or description",
          "cost": "Cost string"
        }
      ]
    }
  ]
}
Important rules:
- The "highlights" array must contain exactly 4 real, famous, photographable landmark or neighbourhood names from ${destination} that are visited or mentioned in the itinerary. Use Wikipedia-searchable names (e.g. "Eiffel Tower", "Colosseum", "Gateway of India").
- Ensure the output is robust, creative, and valid JSON. Do not include markdown blocks like \`\`\`json.`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });
    const result = await model.generateContent(prompt);

    let responseText = result.response.text();

    // Clean up potential markdown formatting around JSON
    responseText = responseText.replace(/^```json/gi, '').replace(/```$/g, '').trim();

    const itinerary = JSON.parse(responseText);
    return itinerary;
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error('Failed to generate trip using Gemini AI');
  }
};

const chatWithTrip = async ({ itinerary, destination, days, budget, history, message }) => {
  const systemContext = `You are an expert AI travel assistant helping a user refine and explore their trip to ${destination} (${days} days, ${budget} budget).

Here is their CURRENT itinerary (JSON):
${JSON.stringify(itinerary, null, 2)}

RULES:
- If the user asks to CHANGE, UPDATE, or MODIFY the itinerary (e.g. "make day 2 vegetarian", "add a museum", "change lunch"), respond ONLY with the full updated itinerary JSON using the exact same schema. Do not include any markdown code fences or extra text.
- If the user asks a QUESTION or wants information (e.g. "what's the weather?", "is it safe?", "what should I pack?"), respond with a helpful plain text answer. Do NOT return JSON.
- All costs must be in Indian Rupees (₹).
- Keep the response concise and friendly.`;

  const conversationHistory = (history || []).map(h => ({
    role: h.role,
    parts: [{ text: h.content }]
  }));

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
    const chat = model.startChat({
      history: [
        { role: 'user', parts: [{ text: systemContext }] },
        { role: 'model', parts: [{ text: 'Understood! I have your itinerary and I am ready to help you refine it or answer any questions.' }] },
        ...conversationHistory
      ]
    });

    const result = await chat.sendMessage(message);
    const responseText = result.response.text().trim();

    // Try to parse as JSON (itinerary update)
    try {
      const cleaned = responseText.replace(/^```json/gi, '').replace(/^```/g, '').replace(/```$/g, '').trim();
      const parsed = JSON.parse(cleaned);
      // Validate it looks like an itinerary
      if (parsed.days && Array.isArray(parsed.days)) {
        return { type: 'itinerary', data: parsed };
      }
    } catch (_) {
      // Not JSON — plain text answer
    }

    return { type: 'text', data: responseText };
  } catch (error) {
    console.error('Gemini Chat Error:', error);
    throw new Error('Failed to get chat response from Gemini AI');
  }
};

module.exports = { generateTrip, chatWithTrip };
