import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy_key_for_testing");
const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

export const analyzeProductWithGemini = async (productData) => {
  try {
    const prompt = `
    Analyze the following food product information:
    Name: ${productData.product_name}
    Brand: ${productData.brands}
    Ingredients: ${productData.ingredients_text}
    Nutrition (per 100g): ${JSON.stringify(productData.nutriments)}
    
    Return a detailed JSON object following this EXACT schema, containing deep health analysis, identifying preservatives, harmful ingredients, and suggesting healthier alternatives. Do not include markdown formatting like \`\`\`json, just return raw JSON string.
    
    Required JSON structure:
    {
      "healthScore": 8.5, // 0-10
      "healthStatus": "Healthy", // "Not Recommended", "Consume Occasionally", or "Healthy Choice"
      "preservatives": ["..."],
      "harmfulIngredients": [{"name": "...", "reason": "..."}],
      "oilType": "...",
      "oilQuality": "...", // "Excellent", "Good", "Average", "Poor"
      "sugar": "12g",
      "sugarLevel": "High", // "Very Low", "Low", "Medium", "High", "Very High"
      "protein": "...",
      "fiber": "...",
      "fat": "...",
      "carbs": "...",
      "sodium": "...",
      "vitamins": ["..."],
      "minerals": ["..."],
      "allergens": ["..."],
      "benefits": ["..."],
      "drawbacks": ["..."],
      "recommendedFor": ["..."], // e.g. Kids, Adults, Gym, Weight Loss
      "avoidFor": ["..."], // e.g. Diabetes, Heart Patients
      "summary": "...",
      "healthyAlternatives": [
        {
          "name": "...",
          "brand": "...",
          "reason": "...",
          "healthScore": 9.4
        }
      ]
    }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // Clean up markdown if present
    if (text.startsWith('\`\`\`json')) {
      text = text.substring(7, text.length - 3);
    } else if (text.startsWith('\`\`\`')) {
      text = text.substring(3, text.length - 3);
    }

    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini AI Analysis Error:", error);
    throw new Error("Failed to analyze product with AI");
  }
};

export const chatWithGemini = async (message, history = []) => {
  try {
    const chat = model.startChat({
      history: history.map(msg => ({
        role: msg.role === 'ai' ? 'model' : 'user',
        parts: [{ text: msg.text }],
      })),
      generationConfig: {
        maxOutputTokens: 250,
      },
    });

    // Add system-like prompt context for the first message if history is empty
    const prefix = history.length === 0 
      ? "You are NutriZen AI, an expert, friendly dietitian assistant. Keep responses very concise, helpful, and formatted purely as text (no markdown). The user says: "
      : "";

    const result = await chat.sendMessage(prefix + message);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    throw new Error("Failed to communicate with AI");
  }
};
