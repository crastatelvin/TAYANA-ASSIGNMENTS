import { Request, Response } from "express";
import { UploadService } from "../services/upload.service";

export class UploadController {
  static async upload(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded." });
      }

      const result = await UploadService.processFile(req.file);

      return res.status(200).json({
        message: "File processed successfully",
        data: result,
      });
    } catch (error: any) {
      return res.status(500).json({
        message: error.message || "Extraction failed",
      });
    }
  }
}
