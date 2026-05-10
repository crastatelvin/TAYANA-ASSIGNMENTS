import fs from "fs";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";

export async function extractText(filePath: string): Promise<string> {
  if (filePath.endsWith(".pdf")) {
    const data = await pdfParse(fs.readFileSync(filePath));
    console.log("PDF chars:", data.text.length);
    return data.text;
  }

  if (filePath.endsWith(".docx")) {
    const result = await mammoth.extractRawText({ path: filePath });
    console.log("DOCX chars:", result.value.length);
    return result.value;
  }

  throw new Error("Unsupported file format");
}
