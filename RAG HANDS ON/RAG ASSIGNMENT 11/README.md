# Module 13: Background Workers (BullMQ) File Solution

## Objective
Build a practical Background Workers (BullMQ) deliverable that correctly handles massive files without crashing the server by moving extraction and embedding logic into a background worker.

---

## 🛠️ Task Instructions (Step-by-Step Workflow)

1. **Upload & Enqueue Job (Producer)**: The client POSTs a file to `/api/upload`. The API immediately saves a `PROCESSING` status in MongoDB and enqueues a job containing the file path to BullMQ, then instantly returns a `202 Accepted` response.
2. **Worker Job Pickup (Consumer)**: A separate background Node.js process (the worker) listens to the Redis-backed BullMQ queue and picks up the job.
3. **Document Extraction**: The worker securely extracts raw text from the uploaded file (e.g., using `pdf-parse` for PDFs or `mammoth` for DOCX files).
4. **Chunking and Vector Embedding**: The worker splits the text into 800-character chunks (filtering out any empty chunks) and uses the Gemini API to embed the text before upserting the vectors into Qdrant.
5. **Status Update & Client Polling**: Upon success or failure, the worker updates the MongoDB file record `status` field to `COMPLETED` or `FAILED`. The frontend safely polls `GET /files/:fileId/status` to show real-time progress to the user.

---

## 📊 Component Logic & Status Table

| Component | Action Performed | Expected Status / Result |
| :--- | :--- | :--- |
| **UploadController (API)** | Accepts `req.file`, creates DB record, calls `ingestionQueue.add()`. | `202 Accepted` / File saved as `PROCESSING`. |
| **Ingestion Worker** | Extracts text, calls Gemini API, and upserts vectors to Qdrant. | `COMPLETED` (Success) or `FAILED` (Error). |
| **Frontend Polling** | Calls `GET /files/:fileId/status` every 2 seconds. | Updates UI to "Processing...", then "Success!" or "Error". |

---

## 🧪 Concrete Examples / Test Cases

### Test Case 1: Successful PDF Ingestion
*   **Input**: User uploads a valid PDF document (e.g., `Digital Marketing 1.pdf`).
*   **Process**: API accepts file → Returns `fileId` instantly → Worker picks up job → `pdf-parse` extracts text → 800-char chunks created → Vectors saved to Qdrant → Status updated.
*   **Expected Result**: MongoDB record `status` changes from `PROCESSING` to `COMPLETED`. The frontend correctly displays *"Success! Knowledge extraction and vectorization complete."* without locking up the browser.

### Test Case 2: Handling Empty/Invalid Extraction (Worker Isolation)
*   **Input**: User uploads a badly formatted file that extracts to empty strings, or a Gemini API failure occurs during embedding.
*   **Process**: Worker attempts extraction/chunking. Because of strict error handling, if a failure occurs (like a `400 Bad Request` from Gemini), the `catch` block triggers. 
*   **Expected Result**: The background worker handles the failure safely **without crashing the main API server**. It updates the MongoDB record `status` to `FAILED`. The frontend polling catches this and displays *"Error: Background processing failed."*

---

## 📂 Project Structure

```text
RAG ASSIGNMENT 11/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── file.controller.ts       # Polling endpoint for status checks
│   │   │   └── upload.controller.ts     # Handles upload & job queueing
│   │   ├── models/
│   │   │   └── file.model.ts            # Mongoose schema for processing status
│   │   ├── queues/
│   │   │   └── ingestion.queue.ts       # BullMQ queue configuration
│   │   ├── services/
│   │   │   ├── chunk.service.ts         # RecursiveCharacterTextSplitter logic
│   │   │   ├── extraction.service.ts    # pdf-parse and mammoth extraction
│   │   │   └── ingestion.service.ts     # Triggers embedding and Qdrant upsert
│   │   ├── workers/
│   │   │   └── ingestion.worker.ts      # The Background Consumer process
│   │   └── server.ts                    # Main API server
│   ├── .env                             # Environment variables (Redis, Mongo, etc)
│   └── package.json
├── frontend/
│   ├── src/
│   │   └── components/
│   │       └── FileUpload.tsx           # React UI with asynchronous polling
│   └── package.json
└── README.md
```

---

## ✅ Quality Checks

1. **Completeness**: Are the required dependencies (`bullmq`, `ioredis`) installed and is the heavy extraction/embedding completely removed from the main API thread? **(YES)**
2. **Clarity**: Does the frontend clearly communicate the background status ("Processing..." vs "Success") to the user without leaving them guessing? **(YES)**
3. **Usability**: Can the codebase be deployed where the API server and Background Worker run as two independent, scalable processes connected by Redis? **(YES)**

---
