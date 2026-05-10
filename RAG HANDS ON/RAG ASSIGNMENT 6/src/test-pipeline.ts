import { IngestionService } from "./services/ingestion.service.js";
import { RetrievalService } from "./services/retrieval.service.js";
import dotenv from "dotenv";

dotenv.config();

async function runTests() {
  const userA = "user_alice";
  const userB = "user_bob";
  
  const aliceChunks = [
    "Alice lives in London.",
    "Alice's secret code is 1234."
  ];
  
  const bobChunks = [
    "Bob lives in Paris.",
    "Bob's favorite color is blue."
  ];

  console.log("🚀 Starting Multi-Tenant RAG Test Suite\n");

  try {
    // TEST CASE 1: Data Ingestion
    console.log("--- TEST 1: Ingesting Data ---");
    await IngestionService.ingestChunks(aliceChunks, userA, "file_001");
    await IngestionService.ingestChunks(bobChunks, userB, "file_002");
    console.log("✅ Data ingested for both Alice and Bob.\n");

    // TEST CASE 2: Authorized Retrieval (Alice)
    console.log("--- TEST 2: Alice searches for her home ---");
    const aliceResults = await RetrievalService.search("Where does Alice live?", userA);
    console.log("Results for Alice:", aliceResults);
    if (aliceResults.some(r => r.includes("London"))) {
        console.log("✅ Alice found her data.\n");
    }

    // TEST CASE 3: Authorized Retrieval (Bob)
    console.log("--- TEST 3: Bob searches for his favorite color ---");
    const bobResults = await RetrievalService.search("What is Bob's favorite color?", userB);
    console.log("Results for Bob:", bobResults);
    if (bobResults.some(r => r.includes("blue"))) {
        console.log("✅ Bob found his data.\n");
    }

    // TEST CASE 4: Cross-Tenant Security (Alice tries to find Bob's secret)
    console.log("--- TEST 4: SECURITY CHECK - Alice searches for Bob's data ---");
    const securityCheck = await RetrievalService.search("Where does Bob live?", userA);
    console.log("Results for Alice (searching Bob's info):", securityCheck);
    
    const containsBobData = securityCheck.some(r => r.includes("Paris") || r.includes("blue"));
    if (!containsBobData) {
        console.log("✅ SECURITY PASSED: Alice cannot see Bob's data (returned her own closest matches instead).\n");
    } else {
        console.warn("❌ SECURITY FAILED: Cross-tenant data leakage detected!\n");
    }

    // TEST CASE 5: Semantic Relevance
    console.log("--- TEST 5: Semantic Search check ---");
    const semanticResults = await RetrievalService.search("Tell me about security codes", userA);
    console.log("Semantic Results for Alice:", semanticResults);
    if (semanticResults.some(r => r.includes("1234"))) {
        console.log("✅ Semantic search successfully matched 'security codes' to 'secret code'.\n");
    }

  } catch (error) {
    console.error("❌ Test Suite Failed:");
    console.error(error);
  }
}

runTests();
