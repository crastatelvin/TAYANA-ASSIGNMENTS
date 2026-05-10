import { Request, Response } from "express";
import { RetrievalService } from "../services/retrieval.service";
import { LLMService } from "../services/llm.service";
import { PromptService } from "../services/prompt.service";

export class ChatController {
  static async chat(req: Request, res: Response) {
    try {
      const query = req.query.q as string;

      if (!query) {
        return res.status(400).json({ message: "Query is required" });
      }

      const userId = (req as any).user.id;

      // 1. Anti-Injection Guard
      if (!PromptService.isSafe(query)) {
        return res.status(400).json({ message: "Prompt injection attempt detected" });
      }

      // 2. Retrieve Top 5 Chunks
      const chunks = await RetrievalService.search(query, userId);

      if (!chunks.length) {
        return res.json({
          answer: "I cannot find this in your documents.",
        });
      }

      // 3. Build Strict Prompt
      const strictPrompt = PromptService.buildStrictPrompt(chunks, query);

      // 4. Generate Strict Answer
      const answer = await LLMService.generateStrictAnswer(strictPrompt);

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
