import { QdrantClient } from "@qdrant/js-client-rest";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const qdrant = new QdrantClient({
  url: process.env.QDRANT_URL || "http://localhost:6333",
  apiKey: process.env.QDRANT_API_KEY,
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const embeddingModel = genAI.getGenerativeModel({ model: "gemini-embedding-2" });

export class RetrievalService {
  static async search(query: string, userId: string): Promise<string[]> {
    try {
      // 1. Generate embedding for the query
      const result = await embeddingModel.embedContent(query);
      const queryVector = result.embedding.values;

      if (!queryVector) {
        throw new Error("Failed to generate embedding");
      }

      // 2. Search Qdrant with tenant isolation (userId)
      const searchResult = await qdrant.search("rag_documents", {
        vector: queryVector,
        limit: 5,
        filter: {
          must: [
            {
              key: "userId",
              match: {
                value: userId,
              },
            },
          ],
        },
      });
      
      console.log(`Search found ${searchResult.length} chunks for userId ${userId}`);

      // 3. Extract and return chunks
      return searchResult.map((hit) => hit.payload?.content as string).filter(Boolean);
    } catch (error: any) {
      console.error("Retrieval error:", error.response?.data || error.message || error);
      return [];
    }
  }
}
