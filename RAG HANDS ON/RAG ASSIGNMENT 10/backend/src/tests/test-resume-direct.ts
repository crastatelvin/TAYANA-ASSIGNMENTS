import fs from "fs";
import path from "path";
import { IngestionService } from "../services/ingestion.service";
import { RetrievalService } from "../services/retrieval.service";
import { LLMService } from "../services/llm.service";
import { PromptService } from "../services/prompt.service";

async function runTest() {
  const filePath = "c:\\Users\\Administrator\\Downloads\\(anonymous) - Pratik Patil_Digital Marketing 1.pdf";
  const userId = "test-user-pratik";

  console.log("--------------------------------------------------");
  console.log("🚀 TESTING RAG PIPELINE WITH REAL RESUME");
  console.log("--------------------------------------------------\n");

  try {
    // 1. Prepare Mock File
    const fileBuffer = fs.readFileSync(filePath);
    const tempFilePath = path.join(__dirname, "temp-resume.pdf");
    fs.writeFileSync(tempFilePath, fileBuffer);

    const mockFile: any = {
      buffer: fileBuffer,
      originalname: path.basename(filePath),
      mimetype: "application/pdf",
      path: tempFilePath
    };

    // 2. Ingest
    console.log("Step 1: Ingesting file...");
    const ingestionResult = await IngestionService.ingestFile(mockFile, userId);
    console.log(`✅ Ingested: ${ingestionResult.fileName} (${ingestionResult.chunksCount} chunks)\n`);

    // 3. Retrieve
    const query = "What are the core skills of Pratik Patil?";
    console.log(`Step 2: Searching for: "${query}"`);
    const chunks = await RetrievalService.search(query, userId);
    console.log(`✅ Found ${chunks.length} relevant chunks.\n`);

    if (chunks.length > 0) {
      // 4. Generate
      console.log("Step 3: Generating Answer...");
      const prompt = PromptService.buildStrictPrompt(chunks, query);
      const answer = await LLMService.generateStrictAnswer(prompt);
      console.log("--------------------------------------------------");
      console.log("🤖 AI ANSWER:");
      console.log(answer);
      console.log("--------------------------------------------------");
    } else {
      console.log("❌ No chunks found. Retrieval failed.");
    }

  } catch (error: any) {
    console.error("❌ Test Failed:", error.message);
    if (error.response?.data) {
      console.error("Error Details:", JSON.stringify(error.response.data, null, 2));
    }
  }
}

runTest();
