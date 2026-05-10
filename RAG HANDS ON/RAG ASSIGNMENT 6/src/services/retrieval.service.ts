import { EmbeddingService } from "./embedding.service.js";
import { VectorStore } from "./vectorStore.service.js";

export class RetrievalService {
  static async search(query: string, userId: string): Promise<string[]> {
    const vectorStore = new VectorStore();
    // No need to initialize if it's already done, but search works regardless if collection exists.
    // However, it's safer to ensure it's there if this is a standalone entry point.
    // In this case, we assume it's already initialized by IngestionService or a startup script.

    const queryVector = await EmbeddingService.embed(query);

    const results = await vectorStore.search(queryVector, userId);

    return results.map((r: any) => (r.payload?.text as string) || "");
  }
}
