import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export class LLMService {
  static async generateStrictAnswer(prompt: string): Promise<string> {
    try {
      const result = await model.generateContent({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0, // Deterministic for Module 10
        },
      });

      return result.response.text() || "";
    } catch (error: any) {
      console.error("LLM Error:", error.response?.data || error.message || error);
      throw error;
    }
  }
}
