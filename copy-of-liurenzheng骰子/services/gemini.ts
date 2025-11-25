import { GoogleGenAI } from "@google/genai";
import { DiceValue } from "../types";

// Initialize Gemini API client
// Note: In a real environment, ensure process.env.API_KEY is set.
// We add a safe check for 'process' to avoid crashes in pure browser environments.
const getApiKey = () => {
  try {
    return process.env.API_KEY || '';
  } catch (e) {
    return '';
  }
};

const apiKey = getApiKey();
const ai = new GoogleGenAI({ apiKey });

export const getDiceInterpretation = async (value: DiceValue): Promise<string> => {
  if (!apiKey) {
    return "请配置 API KEY 以获取 AI 解读。";
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `User just rolled a ${value} on a six-sided die. 
      Act as a mystical fortune teller or a witty commentator.
      Give a very short (max 20 words), fun, and creative interpretation of what this number means for their luck right now. 
      Reply in Chinese.`,
      config: {
        thinkingConfig: { thinkingBudget: 0 }, // Disable thinking for faster response on simple task
        temperature: 1.2, // High creativity
      }
    });

    return response.text || "命运之神保持沉默...";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "云端连接似乎有些波动...";
  }
};