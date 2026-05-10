import { Router } from "express";
import { upload } from "../middlewares/upload.middleware";
import { authMiddleware } from "../middlewares/auth.middleware";
import { UploadController } from "../controllers/upload.controller";

const router = Router();

router.post("/upload", authMiddleware, upload.single("file"), UploadController.upload);

export default router;
