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

const TEST_USER_ID = "test-user-123";
const COLLECTION_NAME = "rag_documents";

const sampleDocs = [
  {
    content: "A vector database is a specialized database designed to store and search through high-dimensional vectors, which are numerical representations of data like text or images. It uses similarity search instead of exact matches.",
    metadata: { source: "intro_to_vectors.pdf" }
  },
  {
    content: "The contract duration for this agreement is 24 months, starting from the date of signing. Any early termination will incur a 10% penalty on the remaining balance.",
    metadata: { source: "legal_contract.docx" }
  }
];

async function seed() {
  console.log("🚀 Seeding Qdrant with test data...");

  try {
    // Ensure collection exists
    const collections = await qdrant.getCollections();
    if (!collections.collections.some(c => c.name === COLLECTION_NAME)) {
      await qdrant.createCollection(COLLECTION_NAME, {
        vectors: { size: 768, distance: "Cosine" }
      });
      console.log(`Created collection: ${COLLECTION_NAME}`);
    }

    const points = [];

    for (let i = 0; i < sampleDocs.length; i++) {
      const doc = sampleDocs[i];
      const result = await embeddingModel.embedContent(doc.content);
      const vector = result.embedding.values;

      if (!vector) continue;

      points.push({
        id: Math.floor(Math.random() * 1000000),
        vector,
        payload: {
          content: doc.content,
          userId: TEST_USER_ID,
          ...doc.metadata
        }
      });
    }

    await qdrant.upsert(COLLECTION_NAME, {
      wait: true,
      points
    });

    console.log("✅ Seeded 2 test documents for user:", TEST_USER_ID);
  } catch (error: any) {
    console.error("❌ Seeding failed:", error.message);
  }
}

seed();
