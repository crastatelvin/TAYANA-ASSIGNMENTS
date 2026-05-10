import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export class LLMService {
  static async generateAnswer(prompt: string): Promise<string> {
    try {
      const result = await model.generateContent({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `You are a helpful AI assistant. Answer ONLY using the provided context. If the answer is not in the context, say 'I could not find that in your documents.'\n\n${prompt}`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2,
        },
      });

      return result.response.text() || "";
    } catch (error: any) {
      console.error("LLM Error:", error.response?.data || error.message || error);
      throw error;
    }
  }
}
