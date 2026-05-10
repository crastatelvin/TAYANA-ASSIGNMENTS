# Phase 3: The Intelligence Layer - RAG Query Pipeline

This repository contains the complete implementation of **Phase 3: The Intelligence Layer**, focusing on a production-ready Retrieval-Augmented Generation (RAG) pipeline using Google Gemini and Qdrant.

## 📁 File Structure

```text
RAG-7/
├── src/
│   ├── controllers/
│   │   └── chat.controller.ts     # Main RAG logic & context injection
│   ├── services/
│   │   ├── llm.service.ts         # Google Gemini 2.5 Flash integration
│   │   └── retrieval.service.ts   # Qdrant semantic search & Gemini embeddings
│   ├── routes/
│   │   └── chat.routes.ts         # Express API routing
│   ├── middlewares/
│   │   └── auth.middleware.ts     # JWT multi-tenant authentication
│   ├── tests/
│   │   └── automated-tests.ts     # Full automated test suite
│   ├── app.ts                     # Express application configuration
│   └── server.ts                  # Server entry point
├── .env                           # Environment variables (API Keys)
├── package.json                   # Dependencies & scripts
└── tsconfig.json                  # TypeScript configuration
```

## 🚀 The Intelligence Process

1.  **Multi-Tenant Isolation**: The pipeline extracts the `userId` from the verified JWT token to ensure data privacy and security.
2.  **Semantic Context Retrieval**: Converts the user's natural language query into a vector embedding and retrieves the top 5 most relevant chunks from the Qdrant `rag_documents` collection.
3.  **Prompt Augmentation**: Injects the retrieved document chunks into a specialized system prompt to ground the AI's knowledge.
4.  **Intelligence Generation**: Leverages the **Gemini 2.5 Flash** model to synthesize a concise answer based *only* on the provided context.
5.  **Grounded Output**: Delivers the final answer along with source counts to the client, preventing hallucinations.

## 📊 Component Logic

| Component | Action Performed | Expected Context |
| :--- | :--- | :--- |
| **RetrievalService** | Vector Search | Retrieves top 5 relevant document chunks filtered by `userId`. |
| **ChatController** | Prompt Injection | Wraps retrieved chunks into a structured "Context vs Question" string. |
| **LLMService** | Grounded Generation | Generates an answer strictly using the provided document facts. |

## 🧪 Concrete Test Cases

### Test Case 1: Knowledge-Based Retrieval
*   **Input Query**: "What is a vector database?"
*   **Context**: User has ingested a document about high-dimensional vector storage.
*   **Expected Chat Output**: "A vector database is a specialized database designed to store and search through high-dimensional vectors... [Sources: 1]"

### Test Case 2: Out-of-Context Grounding
*   **Input Query**: "What is the best way to bake a chocolate cake?"
*   **Context**: User documents only contain technical data about RAG pipelines.
*   **Expected Chat Output**: "I could not find that in your documents." (System ensures no hallucinations).

## 🧪 Automated Test Results

The following test suite was executed to verify the **Intelligence Layer** logic:

```text
🚀 Starting Automated RAG Pipeline Tests
--------------------------------------------------

Test 1: Unauthorized Access (Missing Token)...
✅ PASSED

Test 2: Unauthorized Access (Invalid Token)...
✅ PASSED

Test 3: Missing Query Parameter...
✅ PASSED

Test 4: Successful RAG Retrieval & Generation...
   Answer received: "A vector database is a specialized database design..."
   Sources found: 1
✅ PASSED

Test 5: Semantic Search with Irrelevant Query...
   Response: "I could not find that in your documents."
✅ PASSED

--------------------------------------------------
🏁 TEST SUMMARY: 5/5 passed
--------------------------------------------------
```

## ✅ Quality Checks

1.  **Complete**: The solution includes all layers from Authentication and Vector Search to AI Generation.
2.  **Clear**: Every component is modular, TypeScript-typed, and documented for teammate review.
3.  **Usable**: Includes a one-command automated test suite (`npx ts-node src/tests/automated-tests.ts`) to verify end-to-end functionality.
