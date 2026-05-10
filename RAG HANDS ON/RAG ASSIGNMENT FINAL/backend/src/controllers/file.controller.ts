import { Request, Response } from "express";
import { FileModel } from "../models/file.model";

export class FileController {
  static async getStatus(req: Request, res: Response) {
    try {
      const { fileId } = req.params;

      const file = await FileModel.findById(fileId);

      if (!file) {
        return res.status(404).json({
          status: "NOT_FOUND",
        });
      }

      return res.json({
        status: file.status,
        fileName: file.fileName,
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
}
