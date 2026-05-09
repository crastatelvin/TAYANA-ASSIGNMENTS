import { RecursiveCharacterTextSplitter } from "./services/chunk.service.js";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, "..", "sample.txt");
const text = fs.readFileSync(filePath, "utf-8");

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 800,
  chunkOverlap: 150,
});

const chunks = splitter.splitText(text);

console.log("Total Chunks:", chunks.length);
console.log("--------------------------------------------------");

chunks.forEach((chunk, index) => {
  console.log(`Chunk ${index + 1} (Length: ${chunk.length}):`);
  console.log(chunk.substring(0, 150) + "...");
  console.log("... " + chunk.substring(chunk.length - 150));
  console.log("--------------------------------------------------");
});
