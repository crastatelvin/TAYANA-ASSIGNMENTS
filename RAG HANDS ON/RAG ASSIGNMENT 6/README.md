# Module 7 & 8: Embedding & Qdrant Integration Vectorstore Solution

This project implements a secure, multi-tenant RAG (Retrieval-Augmented Generation) backend using Google Gemini embeddings and Qdrant Cloud.

## 📋 Deliverable Checklist
- [x] **Gemini Embedding Integration**: 3072-dimensional vector generation.
- [x] **Qdrant Vector Storage**: Automated collection initialization and high-performance search.
- [x] **Multi-Tenant Filtering**: Strict security isolation using `userId` payloads.
- [x] **Payload Indexing**: Keyword indexing for optimized filtered retrieval.
- [x] **Automated Test Suite**: End-to-end verification of ingestion and secure search.

---

## 🚀 Main Process (5 Actions)

1. **Environment Setup**: Configure `.env` with `GOOGLE_API_KEY` and Qdrant credentials to authorize API requests.
2. **Auto-Initialization**: Run the `VectorStore.initialize()` logic to create the `rag_documents` collection with `Cosine` distance metrics.
3. **Keyword Indexing**: Apply a payload index to the `userId` field to enable mandatory filtering at the database level.
4. **Batch Ingestion**: Convert raw text chunks into 3072-dim vectors and upsert them with owner-specific metadata.
5. **Secure Retrieval**: Execute semantic searches that inject a `must` filter for the active `userId`, ensuring zero data leakage.

---

## 📊 Component Breakdown

| Component | Action Performed | Expected Output |
| :--- | :--- | :--- |
| **EmbeddingService** | `embedBatch(chunks[])` | 3072-dimensional numerical embeddings. |
| **VectorStore** | `upsertVectors(points[])` | Points stored with searchable `userId` payloads. |
| **RetrievalService** | `search(query, userId)` | Relevant text results isolated to the specific user. |

---

## 🧪 Concrete Test Cases & Verification Logs

### Test 1: Data Ingestion
- **Action**: Ingesting chunks for Alice (`user_alice`) and Bob (`user_bob`).
- **Result**: `✅ Data ingested for both Alice and Bob.`

### Test 2: Authorized Retrieval (Alice)
- **Input**: Alice searches for "Where does Alice live?"
- **Logs**:
  ```text
  Results for Alice: [ 'Alice lives in London.', 'Alice lives in London.', ... ]
  ✅ Alice found her data.
  ```

### Test 3: Authorized Retrieval (Bob)
- **Input**: Bob searches for his favorite color.
- **Logs**:
  ```text
  Results for Bob: [ "Bob's favorite color is blue.", "Bob's favorite color is blue.", ... ]
  ✅ Bob found his data.
  ```

### Test 4: Cross-Tenant Security (Alice searches for Bob)
- **Input**: Alice searches for "Where does Bob live?"
- **Logs**:
  ```text
  Results for Alice (searching Bob's info): [ 'Alice lives in London.', 'Alice lives in London.', ... ]
  ✅ SECURITY PASSED: Alice cannot see Bob's data (returned her own closest matches instead).
  ```

### Test 5: Semantic Search (Context Matching)
- **Input**: Alice searches for "security codes" (matches "secret code").
- **Logs**:
  ```text
  Semantic Results for Alice: [ "Alice's secret code is 1234.", "Alice's secret code is 1234.", ... ]
  ✅ Semantic search successfully matched 'security codes' to 'secret code'.
  ```

---

## ✅ Quality Checks
1. **Measurable**: Every test case produces a verifiable output that can be checked via console logs or Qdrant UI.
2. **Clear**: The architecture is divided into single-responsibility services (`Embedding`, `VectorStore`, `Ingestion`, `Retrieval`).
3. **Usable**: A teammate can deploy and verify the entire solution using a single command: `npm run test:rag`.

---

## 🛠️ Getting Started
1. **Install Dependencies**: `npm install`
2. **Setup Env**: Copy `.env.example` to `.env` and add your keys.
3. **Run Test Suite**: `npm run test:rag`
4. **Reset Collection**: `npx tsx src/reset-collection.ts` (if you need to clear the database).
