import { Request, Response } from "express";
import { RetrievalService } from "../services/retrieval.service";
import { LLMService } from "../services/llm.service";
import { PromptService } from "../services/prompt.service";
import { CacheService } from "../services/cache.service";
import { hashQuestion } from "../utils/hash.util";

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

      // 1. Check Cache
      const cacheKey = hashQuestion(userId, query);
      const cached = await CacheService.get(cacheKey);

      if (cached) {
        console.log("Cache Hit");
        return res.json({ 
          answer: cached, 
          sources: "cached", 
          cached: true 
        });
      }

      console.log("OpenAI Call");

      // 2. Run RAG
      const chunks = await RetrievalService.search(query, userId);

      if (!chunks.length) {
        return res.json({ 
          answer: "I cannot find this in your documents.", 
          sources: 0, 
          cached: false 
        });
      }

      const strictPrompt = PromptService.buildStrictPrompt(chunks, query);
      const answer = await LLMService.generateStrictAnswer(strictPrompt);

      // 3. Store in Cache
      await CacheService.set(cacheKey, answer, 60 * 60); // 1 hour

      return res.json({ answer, sources: chunks.length, cached: false });
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

      if (!PromptService.isSafe(query)) {
        return res.status(400).json({ message: "Prompt injection attempt detected" });
      }

      // 1. Check Cache
      const cacheKey = hashQuestion(userId, query);
      const cached = await CacheService.get(cacheKey);

      // Set SSE Headers
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.flushHeaders();

      if (cached) {
        console.log("Cache Hit");
        // Simulate streaming for cached response to maintain UI consistency
        res.write(`data: ${cached}\n\n`);
        res.write("data: [DONE]\n\n");
        return res.end();
      }

      console.log("OpenAI Call");

      // 2. Retrieve Context
      const chunks = await RetrievalService.search(query, userId);

      if (!chunks.length) {
        res.write(`data: I cannot find this in your documents.\n\n`);
        res.write("data: [DONE]\n\n");
        return res.end();
      }

      const strictPrompt = PromptService.buildStrictPrompt(chunks, query);

      // 3. Stream from LLM and Capture full answer for caching
      const stream = LLMService.generateStreamingAnswer(strictPrompt);
      let fullAnswer = "";

      for await (const chunk of stream) {
        fullAnswer += chunk;
        res.write(`data: ${chunk}\n\n`);
      }

      // 4. Store in Cache
      await CacheService.set(cacheKey, fullAnswer, 60 * 60);

      res.write("data: [DONE]\n\n");
      res.end();
    } catch (error: any) {
      console.error("Streaming Chat Error:", error.message);
      res.write(`data: Error: ${error.message}\n\n`);
      res.end();
    }
  }
}
