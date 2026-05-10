import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export class LLMService {
  static async generateStrictAnswer(prompt: string): Promise<string> {
    try {
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0 },
      });
      return result.response.text() || "";
    } catch (error: any) {
      console.error("LLM Error:", error.message);
      throw error;
    }
  }

  static async *generateStreamingAnswer(prompt: string): AsyncIterable<string> {
    try {
      const result = await model.generateContentStream({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0 },
      });

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        if (chunkText) yield chunkText;
      }
    } catch (error: any) {
      console.error("LLM Streaming Error:", error.message);
      throw error;
    }
  }
}
