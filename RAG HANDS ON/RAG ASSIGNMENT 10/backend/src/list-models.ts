import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

async function main() {
  console.log("Checking available models for current API key...");
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    const data = await response.json();
    
    if (data.models) {
      console.log("Available Models:");
      data.models.forEach((m: any) => {
        console.log(`- ${m.name}`);
      });
    } else {
      console.log("No models found or error in response:", JSON.stringify(data, null, 2));
    }
  } catch (e) {
    console.error("Failed to list models:", e);
  }
}

main();
