import { Router } from "express";
import { ChatController } from "../controllers/chat.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { chatRateLimiter } from "../middlewares/rateLimit.middleware";

const router = Router();

router.get("/chat", authMiddleware, chatRateLimiter, ChatController.chat);
router.get("/chat/stream", authMiddleware, chatRateLimiter, ChatController.streamChat);

export default router;
