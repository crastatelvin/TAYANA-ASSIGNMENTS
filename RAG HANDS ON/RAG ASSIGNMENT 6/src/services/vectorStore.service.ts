import { QdrantClient } from "@qdrant/js-client-rest";
import dotenv from "dotenv";

dotenv.config();

export class VectorStore {
  private client: QdrantClient;
  private collectionName = "rag_documents";

  constructor() {
    this.client = new QdrantClient({
      url: process.env.QDRANT_URL!,
      apiKey: process.env.QDRANT_API_KEY,
    });
  }

  async initialize() {
    const collections = await this.client.getCollections();

    const exists = collections.collections.find(
      (c) => c.name === this.collectionName
    );

    if (!exists) {
      await this.client.createCollection(this.collectionName, {
        vectors: {
          size: 3072, // Google gemini-embedding-001 size
          distance: "Cosine",
        },
      });

      console.log("Qdrant collection created");

      await this.client.createPayloadIndex(this.collectionName, {
        field_name: "userId",
        field_schema: "keyword",
        wait: true,
      });

      console.log("Payload index created for userId");
    }
  }

  async upsertVectors(
    vectors: {
      id: string;
      embedding: number[];
      payload: any;
    }[]
  ) {
    await this.client.upsert(this.collectionName, {
      wait: true,
      points: vectors.map((v) => ({
        id: v.id,
        vector: v.embedding,
        payload: v.payload,
      })),
    });
  }

  async search(queryVector: number[], userId: string) {
    return await this.client.search(this.collectionName, {
      vector: queryVector,
      limit: 5,
      filter: {
        must: [
          {
            key: "userId",
            match: { value: userId },
          },
        ],
      },
    });
  }
}
