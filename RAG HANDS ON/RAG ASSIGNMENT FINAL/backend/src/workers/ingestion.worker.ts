import { Worker } from "bullmq";
import Redis from "ioredis";
import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "dns";

dns.setServers(["8.8.8.8", "8.8.4.4"]);
import { extractText } from "../services/extraction.service";
import { RecursiveCharacterTextSplitter } from "../services/chunk.service";
import { IngestionService } from "../services/ingestion.service";
import { FileModel } from "../models/file.model";

dotenv.config();

const connection = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI!).then(() => {
  console.log("Worker connected to MongoDB");
}).catch(err => {
  console.error("Worker MongoDB connection error:", err);
});

export const ingestionWorker = new Worker(
  "document-ingestion",
  async (job) => {
    const { fullText, userId, fileId, fileName } = job.data;

    try {
      console.log(`Processing file ${fileId} for user ${userId}`);

      // 1. Text is already extracted by the API
      const text = fullText;

      // 2. Chunk
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 800,
        chunkOverlap: 150,
      });

      const chunks = splitter.splitText(text);

      // 3. Embed + Store
      await IngestionService.ingestChunks(chunks, userId, fileId, fileName);

      // 4. Update status
      await FileModel.findByIdAndUpdate(fileId, {
        status: "COMPLETED",
      });

      console.log("File processed successfully:", fileId);
    } catch (error) {
      console.error("Worker failed:", error);

      await FileModel.findByIdAndUpdate(fileId, {
        status: "FAILED",
      });
    }
  },
  { connection }
);

ingestionWorker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

ingestionWorker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed with error: ${err.message}`);
});

console.log("Worker started...");
