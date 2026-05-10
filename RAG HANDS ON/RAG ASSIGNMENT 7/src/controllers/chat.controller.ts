import { Request, Response } from "express";
import { RetrievalService } from "../services/retrieval.service";
import { LLMService } from "../services/llm.service";

export class ChatController {
  static async chat(req: Request, res: Response) {
    try {
      const query = req.query.q as string;

      if (!query) {
        return res.status(400).json({ message: "Query is required" });
      }

      const userId = (req as any).user.id;

      // Retrieve Top 5 Chunks
      const chunks = await RetrievalService.search(query, userId);

      if (!chunks.length) {
        return res.json({
          answer: "No relevant documents found.",
        });
      }

      // Context Injection
      const contextString = chunks
        .map((chunk, index) => `[Chunk ${index + 1}]: ${chunk}`)
        .join("\n\n");

      const finalPrompt = `
Context:

${contextString}

Question:
${query}
`;

      // Generate LLM Answer
      const answer = await LLMService.generateAnswer(finalPrompt);

      return res.json({
        answer,
        sources: chunks.length,
      });
    } catch (error: any) {
      return res.status(500).json({
        message: error.message || "RAG pipeline failed",
      });
    }
  }
}
