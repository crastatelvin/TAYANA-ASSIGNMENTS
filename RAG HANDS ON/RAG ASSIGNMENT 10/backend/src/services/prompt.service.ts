export class PromptService {
  static buildStrictPrompt(contextChunks: string[], question: string) {
    const context = contextChunks
      .map((chunk, i) => `[Chunk ${i + 1}]: ${chunk}`)
      .join("\n\n");

    return `
You are a precise legal assistant.

Answer ONLY using the context provided below. 
If the answer is not explicitly stated in the context, say exactly: "I cannot find this in your documents."

STRICT RULES:
1. Do NOT use your own knowledge.
2. Do NOT make assumptions.
3. Do NOT infer beyond the provided text.
4. For every statement you make, cite the chunk number it came from in parentheses, e.g., (Source: Chunk 1).
5. Self-Evaluate: If your confidence in the answer being fully grounded in the context is less than 80%, refuse to answer and say exactly: "I cannot find this in your documents."

Context:
${context}

Question:
${question}
`;
  }

  static isSafe(query: string): boolean {
    const forbidden = ["ignore previous instructions", "system prompt", "dan mode", "disregard"];
    return !forbidden.some(word => query.toLowerCase().includes(word));
  }
}
