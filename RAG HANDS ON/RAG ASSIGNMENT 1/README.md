# RAG Fundamentals - Similarity Solution

This project demonstrates the fundamentals of RAG (Retrieval-Augmented Generation) by implementing text embeddings and similarity calculations using Google Gemini.

## Deliverables

### 1. Action Checklist
- [x] Select supported embedding model (`gemini-embedding-001`).
- [x] Implement core vector math functions (`dotProduct`, `cosineSimilarity`).
- [x] Setup environment variable handling for API security.
- [x] Create automated ranking logic for retrieval simulation.
- [x] Verify output formatting for teammate readability.

### 2. Implementation Steps
1. **Initialize Environment**: Load API credentials from `.env` and instantiate the `GoogleGenerativeAI` client.
2. **Define Math Logic**: Implement `dotProduct` and `cosineSimilarity` functions for vector comparison.
3. **Generate Embeddings**: Use Gemini API to convert text into 3072-dimension vectors.
4. **Compute Similarities**: Calculate semantic overlap between query and database vectors.
5. **Rank & Retrieve**: Sort and return the most relevant results.

### 3. Component Table
| Component | Action Performed | Expected Output |
| :--- | :--- | :--- |
| **Embedding Model** | Converts text into vectors | `number[]` (Semantic embeddings) |
| **Dot Product** | Measures vector alignment | Raw similarity score |
| **Cosine Similarity** | Normalizes vector comparison | Normalized score (0 to 1) |

## Setup
1. `npm install`
2. Create a `.env` file with `GEMINI_API_KEY=your_key`
3. `npx ts-node similarity.ts`
