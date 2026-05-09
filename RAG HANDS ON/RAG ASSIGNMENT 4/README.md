# Phase 2: The Ingestion Pipeline — Document Processing System

This repository contains the complete solution for the Document Ingestion Pipeline, designed to handle multi-format document uploads and clean text extraction for downstream RAG (Retrieval-Augmented Generation) tasks.

## 📂 Project Structure
```text
RAG-4/
├── src/
│   ├── controllers/
│   │   └── upload.controller.ts     # Request/Response orchestration
│   ├── middlewares/
│   │   └── upload.middleware.ts     # Multer & Validation logic
│   ├── routes/
│   │   └── upload.routes.ts         # Endpoint definitions
│   ├── services/
│   │   └── upload.service.ts        # Processing & Cleanup logic
│   ├── utils/
│   │   └── fileSwitcher.ts          # Multi-format parsing logic
│   ├── app.ts                       # App configuration
│   └── server.ts                    # Entry point
├── uploads/                         # Temporary storage (auto-cleaned)
├── test_upload.js                   # E2E Test script
├── tsconfig.json                    # TS configuration
└── package.json                     # Dependencies & scripts
```

## 🛠 Action Checklist
- [x] Configure Multer middleware for multi-part form data.
- [x] Implement MIME type and file size validation (10MB limit).
- [x] Create a "Switcher" utility to handle PDF (`pdf-parse`) and DOCX (`mammoth`) extraction.
- [x] Build a service layer to normalize extracted text and manage temporary file cleanup.
- [x] Expose a POST `/api/upload` endpoint and verify with E2E test cases.

## 🔄 Pipeline Workflow
1. **Request Reception**: Express receives a `multipart/form-data` POST request.
2. **Middleware Validation**: Multer checks the file extension (MIME type) and size.
3. **Storage**: The file is temporarily written to the `uploads/` directory with a unique timestamped name.
4. **Extraction**: The `UploadService` identifies the file type and calls the appropriate parser.
5. **Normalization**: Multiple spaces and newlines are collapsed to improve embedding quality.
6. **Cleanup**: The temporary file is deleted from the server disk.
7. **Response**: A JSON object containing the `fullText`, `preview`, and `characterCount` is returned.

## 🚀 Main Process: 5 Labeled Actions
1. **ACTION: Environment Setup** — Install `multer`, `pdf-parse`, and `mammoth` alongside TypeScript types to ensure a robust, type-safe development environment.
2. **ACTION: Upload Interception** — Deploy `upload.middleware.ts` to intercept incoming files, ensuring only valid `.pdf` and `.docx` payloads enter the system.
3. **ACTION: Text Extraction** — Execute the "Switcher" logic in `fileSwitcher.ts` to convert binary document buffers into raw, usable strings.
4. **ACTION: Data Sanitization** — Apply regex-based normalization (`replace(/\s+/g, " ")`) to the extracted text to prevent noise in the vector database.
5. **ACTION: Resource Management** — Automatically trigger `fs.unlinkSync` post-extraction to prevent storage bloat and ensure zero-persistence of raw files.

## 📊 Component & Deliverable Matrix
| Component | Action Performed | Expected Upload/Output |
| :--- | :--- | :--- |
| **Upload Middleware** | Validates file type and size. | Rejection of non-PDF/DOCX files or files >10MB. |
| **File Switcher** | Detects extension and triggers parser. | Clean raw text string extracted from blob. |
| **Upload Service** | Normalizes text and unlinks file. | JSON response with character count and text preview. |

## 🧪 Concrete Test Cases
### Test Case 1: Standard PDF Upload
- **Input**: `sample.pdf` (2.5 KB)
- **Execution**: `node test_upload.js`
- **Expected Result**: 
  - Status: `200 OK`
  - Output: `characterCount: 2848`, `message: "File processed successfully"`.
  - Effect: `uploads/` folder remains empty after completion.

### Test Case 2: Invalid File Rejection
- **Input**: `image.png`
- **Execution**: Postman POST request to `/api/upload`.
- **Expected Result**: 
  - Status: `500 Internal Server Error` (or 400 depending on middleware config).
  - Output: `{ "message": "Invalid file type" }`.

## ✅ Quality Checks
1. **Complete**: Does the system handle both `.pdf` and `.docx`? **Yes**, via `pdf-parse` and `mammoth`.
2. **Clear**: Is the character count visible for verification? **Yes**, it is logged to the console and returned in the API response.
3. **Usable**: Is the code production-ready regarding storage? **Yes**, all temporary files are unlinked immediately after processing.
