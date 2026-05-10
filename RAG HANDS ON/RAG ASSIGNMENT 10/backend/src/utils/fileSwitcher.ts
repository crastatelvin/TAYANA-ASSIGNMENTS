import fs from "fs";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";

export const extractTextFromFile = async (
  filePath: string,
  fileType: string
): Promise<string> => {
  if (fileType === ".pdf") {
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    return data.text;
  }

  if (fileType === ".docx") {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  }

  throw new Error("Unsupported file type");
};
