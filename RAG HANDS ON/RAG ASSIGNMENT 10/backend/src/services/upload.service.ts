import path from "path";
import fs from "fs";
import { extractTextFromFile } from "../utils/fileSwitcher";

export class UploadService {
  static async processFile(file: any) {
    const extension = path.extname(file.originalname).toLowerCase();

    const extractedText = await extractTextFromFile(file.path, extension);

    if (!extractedText || extractedText.trim().length === 0) {
      // Delete file if extraction fails to avoid junk
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      throw new Error("Extraction failed: Empty text.");
    }

    // Normalize text (Optional but Recommended)
    const cleanText = extractedText.replace(/\s+/g, " ").trim();

    console.log("File:", file.originalname);
    console.log("Character Count:", cleanText.length);

    // Delete file after successful extraction to prevent storage explosion
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    return {
      fileName: file.originalname,
      characterCount: cleanText.length,
      preview: cleanText.substring(0, 300),
      fullText: cleanText,
    };
  }
}
