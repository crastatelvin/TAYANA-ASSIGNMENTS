import { Request, Response } from "express";
import { ingestionQueue } from "../queues/ingestion.queue";
import { FileModel } from "../models/file.model";

export class UploadController {
  static async upload(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded." });
      }

      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User context missing from token." });
      }

      const file = req.file;
      
      // 1. Extract text immediately on the API server
      const { fullText } = await import("../services/upload.service").then(m => m.UploadService.processFile(file));

      // 2. Create DB record
      const record = await FileModel.create({
        userId,
        fileName: file.originalname,
        status: "PROCESSING",
      });

      // 3. Add job to queue with EXTRACTED TEXT
      await ingestionQueue.add("process-file", {
        fullText,
        fileName: file.originalname,
        userId,
        fileId: record._id.toString(),
      });

      // 3. Immediate response
      return res.status(202).json({
        message: "File uploaded. Processing started...",
        fileId: record._id,
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      return res.status(500).json({
        message: error.message || "Upload failed",
      });
    }
  }
}
