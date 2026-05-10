import crypto from "crypto";

/**
 * Generates a consistent hash for a user's question.
 * Includes userId for multi-tenant safety.
 */
export function hashQuestion(userId: string, question: string): string {
  return crypto
    .createHash("sha256")
    .update(`${userId}:${question}`)
    .digest("hex");
}
