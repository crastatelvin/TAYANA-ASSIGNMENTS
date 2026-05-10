import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export class EmbeddingService {
  private static model = "gemini-embedding-001";

  static async embed(text: string): Promise<number[]> {
    const model = genAI.getGenerativeModel({ model: this.model });
    const result = await model.embedContent(text);
    return result.embedding.values;
  }

  static async embedBatch(texts: string[]): Promise<number[][]> {
    const model = genAI.getGenerativeModel({ model: this.model });
    const result = await model.batchEmbedContents({
      requests: texts.map((text) => ({
        content: { role: "user", parts: [{ text }] },
        taskType: "RETRIEVAL_DOCUMENT" as any,
      })),
    });
    return result.embeddings.map((e) => e.values);
  }
}
