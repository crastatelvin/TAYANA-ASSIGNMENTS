import axios from "axios";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

/**
 * MANUAL TEST SCRIPT FOR STREAMING RAG (SSE)
 * 
 * Run with: npx ts-node src/tests/test-streaming.ts
 */

const API_BASE_URL = "http://localhost:3000/api";
const JWT_SECRET = process.env.JWT_SECRET || "supersecret";
const TEST_USER_ID = "test-user-123";

const validToken = jwt.sign({ id: TEST_USER_ID }, JWT_SECRET);

async function testStreaming() {
  console.log("--------------------------------------------------");
  console.log("🚀 Testing Streaming RAG (SSE)");
  console.log("--------------------------------------------------\n");

  const query = "What is a vector database?";
  console.log(`Query: "${query}"\n`);

  try {
    const response = await axios({
      method: "get",
      url: `${API_BASE_URL}/chat/stream?q=${encodeURIComponent(query)}`,
      headers: {
        Authorization: `Bearer ${validToken}`,
        Accept: "text/event-stream",
      },
      responseType: "stream",
    });

    console.log("--- Stream Start ---");
    
    response.data.on("data", (chunk: Buffer) => {
      const data = chunk.toString();
      const lines = data.split("\n\n");
      
      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const content = line.replace("data: ", "");
          if (content === "[DONE]") {
            console.log("\n--- Stream End ---");
          } else {
            process.stdout.write(content); // Print without newline to simulate typing
          }
        }
      }
    });

    response.data.on("end", () => {
      console.log("\n✅ Test Completed Successfully");
    });

  } catch (error: any) {
    console.error("❌ Streaming Test Failed");
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Data:`, error.response.data);
    } else {
      console.error(`Error: ${error.message}`);
    }
  }
}

testStreaming();
