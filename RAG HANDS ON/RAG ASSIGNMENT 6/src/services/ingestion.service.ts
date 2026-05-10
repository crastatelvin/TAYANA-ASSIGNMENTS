import { EmbeddingService } from "./embedding.service.js";
import { VectorStore } from "./vectorStore.service.js";
import { v4 as uuidv4 } from "uuid";

export class IngestionService {
  static async ingestChunks(
    chunks: string[],
    userId: string,
    fileId: string
  ) {
    const vectorStore = new VectorStore();
    await vectorStore.initialize();

    const embeddings = await EmbeddingService.embedBatch(chunks);

    const vectors = chunks.map((chunk, index) => ({
      id: uuidv4(),
      embedding: embeddings[index],
      payload: {
        userId,
        fileId,
        chunkIndex: index,
        text: chunk,
      },
    }));

    await vectorStore.upsertVectors(vectors);

    return { inserted: vectors.length };
  }
}
