import { Request, Response } from "express";
import { RetrievalService } from "../services/retrieval.service";
import { LLMService } from "../services/llm.service";
import { PromptService } from "../services/prompt.service";

export class ChatController {
  static async chat(req: Request, res: Response) {
    try {
      const query = req.query.q as string;
      const userId = (req as any).user.id;

      if (!query) {
        return res.status(400).json({ message: "Query is required" });
      }

      if (!PromptService.isSafe(query)) {
        return res.status(400).json({ message: "Prompt injection attempt detected" });
      }

      const chunks = await RetrievalService.search(query, userId);

      if (!chunks.length) {
        return res.json({ answer: "I cannot find this in your documents.", sources: 0 });
      }

      const strictPrompt = PromptService.buildStrictPrompt(chunks, query);
      const answer = await LLMService.generateStrictAnswer(strictPrompt);

      return res.json({ answer, sources: chunks.length });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || "RAG pipeline failed" });
    }
  }

  static async streamChat(req: Request, res: Response) {
    try {
      const query = req.query.q as string;
      const userId = (req as any).user.id;

      if (!query) {
        return res.status(400).json({ message: "Query is required" });
      }

      // 1. Anti-Injection Guard
      if (!PromptService.isSafe(query)) {
        return res.status(400).json({ message: "Prompt injection attempt detected" });
      }

      // 2. Set SSE Headers
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.flushHeaders();

      // 3. Retrieve Context (Synchronous before stream)
      const chunks = await RetrievalService.search(query, userId);

      if (!chunks.length) {
        res.write(`data: I cannot find this in your documents.\n\n`);
        res.write("data: [DONE]\n\n");
        return res.end();
      }

      // 4. Build Prompt
      const strictPrompt = PromptService.buildStrictPrompt(chunks, query);

      // 5. Stream from LLM
      const stream = LLMService.generateStreamingAnswer(strictPrompt);

      for await (const chunk of stream) {
        // SSE format requires "data: " prefix and double newline
        res.write(`data: ${chunk}\n\n`);
      }

      // 6. End Stream
      res.write("data: [DONE]\n\n");
      res.end();
    } catch (error: any) {
      console.error("Streaming Chat Error:", error.message);
      res.write(`data: Error: ${error.message}\n\n`);
      res.end();
    }
  }
}
