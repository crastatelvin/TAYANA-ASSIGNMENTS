import { Request, Response } from "express";
import { IngestionService } from "../services/ingestion.service";

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

      const result = await IngestionService.ingestFile(req.file, userId);

      return res.status(200).json({
        message: "Document ingested and vectorized successfully",
        data: result,
      });
    } catch (error: any) {
      console.error("Ingestion error:", error);
      return res.status(500).json({
        message: error.message || "Ingestion failed",
      });
    }
  }
}
