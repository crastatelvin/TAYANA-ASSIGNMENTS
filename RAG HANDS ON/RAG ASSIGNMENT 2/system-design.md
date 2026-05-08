# System Design: RAG Architecture
## Module 2: Architecture Design

This document visualizes the "Request Lifecycle" of our Retrieval-Augmented Generation (RAG) system, covering both the data ingestion and semantic retrieval pipelines.

---

## 1. System Overview
The system is designed to provide grounded AI responses by indexing private documents and retrieving them as context. Key capabilities include:
*   **Document Upload:** Secure handling of user files.
*   **Background Processing:** Asynchronous document processing to ensure high availability.
*   **Embedding Storage:** Storing semantic vectors in a high-performance vector database.
*   **Semantic Retrieval:** Finding relevant context based on vector similarity.
*   **Grounded Response Generation:** Using an LLM (GPT-4o-mini) to generate answers based strictly on retrieved context.

---

## 2. Ingestion Path
**Goal:** Convert raw documents into searchable semantic vectors.

### Ingestion Flow
```mermaid
graph TD
    A[User Uploads File] --> B[Backend API]
    B --> C[Store Metadata in MongoDB]
    B --> D[Push Job to BullMQ]
    D --> E[Worker Service]
    E --> F[Extract Text]
    F --> G[Chunk Text]
    G --> H[Generate Embeddings via OpenAI]
    H --> I[Store in Qdrant Vector DB]
    I --> J[Update Status = READY in MongoDB]
```

### Step-by-Step Explanation
1.  **File Upload (`POST /documents/upload`):** Validates type/size and stores metadata in MongoDB.
2.  **Queue Job:** Uses BullMQ to prevent blocking the user request during heavy computation.
3.  **Worker Processing:**
    *   **Extraction:** Uses `pdf-parse` or `mammoth`.
    *   **Chunking:** 800 tokens with 150-token overlap.
    *   **Embedding:** Calls OpenAI API to get a 1536-dimension vector (standard for text-embedding-3-small/ada-002).
    *   **Storage:** Saves chunk text and metadata (userId, docId, page) in Qdrant.

---

## 3. Retrieval Path
**Goal:** Answer user questions using stored semantic context.

### Retrieval Flow
```mermaid
graph TD
    A[User Asks Question] --> B[Backend API]
    B --> C[Embed Query via OpenAI]
    C --> D[Search Qdrant Vector DB]
    D --> E[Retrieve Top-K Relevant Chunks]
    E --> F[Construct Grounded Prompt]
    F --> G[Send to LLM - gpt-4o-mini]
    G --> H[Return Grounded Answer to User]
```

### Step-by-Step Explanation
1.  **Receive Query:** `POST /rag/query` receives the user's question.
2.  **Embed Query:** The question is converted into a vector so it can be compared to stored chunks.
3.  **Search Vector DB:** Performs a similarity search (Top K=5) with multi-tenant filtering (userId).
4.  **Prompt Construction:** The retrieved chunks are injected into a prompt template that instructs the LLM to answer **only** using the provided context.
5.  **Call LLM:** `gpt-4o-mini` generates the final response based on the "grounded" information.

---

## 4. Full System Diagram
### Logical Architecture
```mermaid
graph TD
    subgraph Frontend
    A[React Client]
    end

    subgraph "Backend Services"
    B[Express API]
    E[Worker Service]
    end

    subgraph "Storage & Infrastructure"
    C[MongoDB - Metadata]
    D[Redis - BullMQ]
    F[Qdrant - Vector DB]
    end

    subgraph "External AI APIs"
    G[OpenAI - Embeddings & LLM]
    end

    A <--> B
    B --> C
    B --> D
    D --> E
    E --> G
    E --> F
    B --> G
    B --> F
```

---

## 5. Sequence Diagram (Request Lifecycle)

### Ingestion Lifecycle
```mermaid
sequenceDiagram
    participant User
    participant API
    participant DB as MongoDB
    participant Q as Redis/Queue
    participant W as Worker
    participant AI as OpenAI
    participant V as Qdrant

    User->>API: Upload Document
    API->>DB: Save Metadata (Status: PENDING)
    API->>Q: Push process-document job
    API-->>User: 202 Accepted
    Q->>W: Pull Job
    W->>W: Extract & Chunk Text
    W->>AI: Generate Embeddings
    AI-->>W: Vectors
    W->>V: Store Chunks & Vectors
    W->>DB: Update Status (READY)
```

### Retrieval Lifecycle
```mermaid
sequenceDiagram
    participant User
    participant API
    participant AI as OpenAI
    participant V as Qdrant

    User->>API: POST /rag/query
    API->>AI: Embed User Question
    AI-->>API: Question Vector
    API->>V: Search Similarity (Top 5)
    V-->>API: Relevant Context Chunks
    API->>AI: Generate Answer (Context + Question)
    AI-->>API: Grounded Response
    API-->>User: Final Answer + Sources
```
