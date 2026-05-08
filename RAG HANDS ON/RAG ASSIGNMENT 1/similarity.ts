import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });

// Dot Product Function
function dotProduct(a: number[], b: number[]): number {
    if (a.length !== b.length) {
        throw new Error("Vectors must be same length");
    }

    return a.reduce((sum, value, index) => {
        return sum + value * b[index]!;
    }, 0);
}

// Cosine Similarity Function
function cosineSimilarity(a: number[], b: number[]): number {
    const dot = dotProduct(a, b);

    const magnitudeA = Math.sqrt(dotProduct(a, a));
    const magnitudeB = Math.sqrt(dotProduct(b, b));

    return dot / (magnitudeA * magnitudeB);
}

async function main() {
    const sentences = [
        "I love coding in JavaScript",
        "TypeScript is my favorite programming language",
        "I love eating pizza",
        "Node.js backend development is powerful",
    ];

    // Generate embeddings using Gemini
    const result = await model.batchEmbedContents({
        requests: sentences.map((t) => ({
            content: { parts: [{ text: t }] },
        })),
    });

    const vectors = result.embeddings.map((e) => e.values);

    const [vec1, vec2, vec3, vec4] = vectors;

    if (!vec1 || !vec2 || !vec3 || !vec4) {
        throw new Error("Failed to generate all required embeddings");
    }

    // Similarity Calculations
    const js_ts_dot = dotProduct(vec1, vec2);
    const js_pizza_dot = dotProduct(vec1, vec3);
    const js_node_dot = dotProduct(vec1, vec4);

    const js_ts_cos = cosineSimilarity(vec1, vec2);
    const js_pizza_cos = cosineSimilarity(vec1, vec3);
    const js_node_cos = cosineSimilarity(vec1, vec4);

    console.log("\n===== DOT PRODUCT RESULTS =====");

    console.log("JavaScript vs TypeScript:", js_ts_dot);
    console.log("JavaScript vs Pizza:", js_pizza_dot);
    console.log("JavaScript vs Node.js:", js_node_dot);

    console.log("\n===== COSINE SIMILARITY RESULTS =====");

    console.log("JavaScript vs TypeScript:", js_ts_cos);
    console.log("JavaScript vs Pizza:", js_pizza_cos);
    console.log("JavaScript vs Node.js:", js_node_cos);

    // Retrieval Simulation
    const similarities = [
        {
            sentence: sentences[1],
            score: js_ts_cos,
        },
        {
            sentence: sentences[2],
            score: js_pizza_cos,
        },
        {
            sentence: sentences[3],
            score: js_node_cos,
        },
    ];

    similarities.sort((a, b) => b.score - a.score);

    console.log("\n===== TOP RETRIEVAL RESULT =====");
    console.log(similarities[0]);
}

main();