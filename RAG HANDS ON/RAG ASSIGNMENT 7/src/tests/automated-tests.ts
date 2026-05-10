import axios from "axios";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

/**
 * AUTOMATED TEST SUITE FOR RAG QUERY PIPELINE
 * 
 * Instructions:
 * 1. Ensure the server is running: npm run dev
 * 2. Run this script: npx ts-node src/tests/automated-tests.ts
 */

const API_BASE_URL = "http://localhost:3000/api";
const JWT_SECRET = process.env.JWT_SECRET || "supersecret";
const TEST_USER_ID = "test-user-123";

// Generate a valid test token
const validToken = jwt.sign({ id: TEST_USER_ID }, JWT_SECRET);

async function runTests() {
  console.log("--------------------------------------------------");
  console.log("🚀 Starting Automated RAG Pipeline Tests");
  console.log("--------------------------------------------------\n");

  let passed = 0;
  let total = 0;

  const testCase = async (name: string, fn: () => Promise<void>) => {
    total++;
    try {
      console.log(`Test ${total}: ${name}...`);
      await fn();
      console.log(`✅ PASSED\n`);
      passed++;
    } catch (error: any) {
      console.log(`❌ FAILED`);
      console.error(`   Error: ${error.message}`);
      if (error.response) {
        console.error(`   Status: ${error.response.status}`);
        console.error(`   Data:`, error.response.data);
      }
      console.log("");
    }
  };

  // --- AUTHENTICATION TESTS ---

  await testCase("Unauthorized Access (Missing Token)", async () => {
    const res = await axios.get(`${API_BASE_URL}/chat?q=test`).catch(e => e.response);
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
  });

  await testCase("Unauthorized Access (Invalid Token)", async () => {
    const res = await axios.get(`${API_BASE_URL}/chat?q=test`, {
      headers: { Authorization: "Bearer invalid_token" }
    }).catch(e => e.response);
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
  });

  // --- VALIDATION TESTS ---

  await testCase("Missing Query Parameter", async () => {
    const res = await axios.get(`${API_BASE_URL}/chat`, {
      headers: { Authorization: `Bearer ${validToken}` }
    }).catch(e => e.response);
    if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
    if (res.data.message !== "Query is required") throw new Error("Incorrect error message");
  });

  // --- FUNCTIONAL RAG TESTS ---

  await testCase("Successful RAG Retrieval & Generation", async () => {
    console.log("   (Note: This requires documents to be ingested and Gemini quota availability)");
    const res = await axios.get(`${API_BASE_URL}/chat?q=What is a vector database`, {
      headers: { Authorization: `Bearer ${validToken}` }
    });
    
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (!res.data.answer) throw new Error("Response missing answer field");
    console.log(`   Answer received: "${res.data.answer.substring(0, 50)}..."`);
    console.log(`   Sources found: ${res.data.sources}`);
  });

  await testCase("Semantic Search with Irrelevant Query", async () => {
    const res = await axios.get(`${API_BASE_URL}/chat?q=How to make sushi`, {
      headers: { Authorization: `Bearer ${validToken}` }
    });

    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    // If no context is found, it should return "No relevant documents found." (from our controller)
    // or the Gemini response for no context.
    console.log(`   Response: "${res.data.answer}"`);
  });

  // --- SUMMARY ---

  console.log("--------------------------------------------------");
  console.log(`🏁 TEST SUMMARY: ${passed}/${total} passed`);
  console.log("--------------------------------------------------");
}

runTests().catch(console.error);
