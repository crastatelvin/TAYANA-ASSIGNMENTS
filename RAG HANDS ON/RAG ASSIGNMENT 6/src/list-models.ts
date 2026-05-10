import dotenv from "dotenv";

dotenv.config();

async function listModelsRaw() {
  const key = process.env.GOOGLE_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
  
  try {
    const response = await fetch(url);
    const data: any = await response.json();
    
    if (data.error) {
        console.error("API Error:", data.error.message);
        return;
    }
    
    console.log("Available Models:");
    data.models.forEach((m: any) => {
        if (m.supportedGenerationMethods.includes("embedContent")) {
            console.log(`- ${m.name} (${m.displayName})`);
        }
    });
  } catch (error) {
    console.error("Fetch Error:", error);
  }
}

listModelsRaw();
