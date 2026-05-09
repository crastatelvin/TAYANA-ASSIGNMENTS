# Recursive Chunking Solution

This repository contains a production-grade implementation of a **Recursive Character Text Splitter** designed for RAG (Retrieval-Augmented Generation) pipelines. The primary goal is to preserve context by splitting text at natural boundaries while maintaining information flow across chunks using overlaps.

## 📂 File Structure

```text
RAG 5/
├── src/
│   ├── services/
│   │   └── chunk.service.ts    # Main Recursive Splitting logic
│   └── test-chunking.ts        # Script to verify chunking and overlap
├── sample.txt                  # Test document for demonstration
├── package.json                # Project dependencies and scripts
├── tsconfig.json               # TypeScript configuration
└── README.md                   # Project documentation
```


## 🚀 Implementation Process

1.  **Action 1: Define Requirements Checklist**
    Identify the core splitting boundaries (paragraphs, newlines, sentences) and configuration parameters (`chunkSize: 800`, `chunkOverlap: 150`).
2.  **Action 2: Design Splitting Logic**
    Architect a recursive workflow that prioritizes natural separators (`\n\n` > `\n` > `.`) before falling back to character-count splits.
3.  **Action 3: Build Chunking Service**
    Implement the `RecursiveCharacterTextSplitter` class in TypeScript, ensuring robust handling of potential `undefined` values and edge cases.
4.  **Action 4: Implement Context Overlap**
    Develop a post-processing step to prepend the tail of the previous chunk to the start of the current chunk to prevent information loss.
5.  **Action 5: Verify & Format Submission**
    Execute verification tests against a standardized sample set and organize the codebase for seamless teammate review.

## 🛠️ Component Breakdown

| Component | Action Performed | Expected Chunk Outcome |
| :--- | :--- | :--- |
| **Recursive Splitter** | Analyzes text for `\n\n`, `\n`, and `.` separators. | Text is split at the largest possible natural boundary under 800 chars. |
| **Overlap Manager** | Extracts the last 150 chars of Chunk N and prepends to Chunk N+1. | Chunk N+1 starts with the finishing context of Chunk N. |
| **Test Suite** | Processes `sample.txt` and logs results to console. | Verifiable output showing chunk count, lengths, and overlap continuity. |

## 🧪 Concrete Examples

### Example 1: Paragraph Preservation
**Input:** A 1200-character document with two distinct paragraphs separated by `\n\n`.
**Result:** The splitter detects the paragraph break and creates two chunks, even though Chunk 1 is well below the 800-character limit, ensuring paragraph integrity.

### Example 2: Context Flow (Overlap)
**Input Text:** "...Vector databases enable semantic search. They are optimized for AI."
**Chunk 1 End:** "...enable semantic search."
**Chunk 2 Start:** "...enable semantic search. They are optimized for AI."
**Verification:** The shared phrase ensures the LLM understands the subject of Chunk 2 without needing Chunk 1.

## ✅ Quality Checks

1.  **Complete**: The solution includes the service logic, test environment, and project configurations.
2.  **Clear**: Code is written in clean TypeScript with zero compilation errors and descriptive naming conventions.
3.  **Usable**: A teammate can run `npm run build && npm start` to see immediate, measurable results.
