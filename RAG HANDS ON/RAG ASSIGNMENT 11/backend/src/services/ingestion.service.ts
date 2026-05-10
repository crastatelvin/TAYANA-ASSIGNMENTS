import { UploadService } from "./upload.service";
import { RecursiveCharacterTextSplitter } from "./chunk.service";
import { EmbeddingService } from "./embedding.service";
import { VectorStore } from "./vectorStore.service";
import { v4 as uuidv4 } from "uuid";

export class IngestionService {
  private static splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  private static vectorStore = new VectorStore();

  static async ingestFile(file: any, userId: string) {
    // 1. Extract text
    const { fullText, fileName } = await UploadService.processFile(file);

    // 2. Chunk text
    const chunks = this.splitter.splitText(fullText);

    // 3. Initialize Vector Store (ensure collection exists)
    await this.vectorStore.initialize();

    // 4. Generate Embeddings
    const embeddings = await EmbeddingService.embedBatch(chunks);

    // 5. Prepare Vectors
    const fileId = uuidv4();
    const vectors = chunks.map((chunk, index) => {
      const embedding = embeddings[index];
      if (!embedding) return null;

      return {
        id: uuidv4(),
        embedding: embedding,
        payload: {
          userId,
          fileName,
          fileId,
          chunkIndex: index,
          content: chunk,
        },
      };
    }).filter((v): v is { id: string; embedding: number[]; payload: any } => v !== null);

    // 6. Upsert to Qdrant
    await this.vectorStore.upsertVectors(vectors);

    return {
      fileName,
      fileId,
      chunksCount: chunks.length,
    };
  }

  static async ingestChunks(chunks: string[], userId: string, fileId: string, fileName: string) {
    // 1. Initialize Vector Store
    await this.vectorStore.initialize();

    // 2. Generate Embeddings
    const embeddings = await EmbeddingService.embedBatch(chunks);

    // 3. Prepare Vectors
    const vectors = chunks.map((chunk, index) => {
      const embedding = embeddings[index];
      if (!embedding) return null;

      return {
        id: uuidv4(),
        embedding: embedding,
        payload: {
          userId,
          fileName,
          fileId,
          chunkIndex: index,
          content: chunk,
        },
      };
    }).filter((v): v is { id: string; embedding: number[]; payload: any } => v !== null);

    // 4. Upsert to Qdrant
    await this.vectorStore.upsertVectors(vectors);

    return {
      fileName,
      fileId,
      chunksCount: chunks.length,
    };
  }
}
