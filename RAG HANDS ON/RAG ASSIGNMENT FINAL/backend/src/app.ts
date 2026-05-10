import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import chatRoutes from "./routes/chat.routes";
import uploadRoutes from "./routes/upload.routes";
import authRoutes from "./routes/auth.routes";

dotenv.config();

const app = express();

const corsOrigin = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.replace(/\/$/, "") : "*";
app.use(cors({ origin: corsOrigin }));
app.use(express.json());
app.use(express.static("public"));

app.use("/api", authRoutes);
app.use("/api", chatRoutes);
app.use("/api", uploadRoutes);

// Health check
app.get("/health", (req, res) => res.json({ status: "ok" }));

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("❌ GLOBAL ERROR:", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === "production" ? {} : err
  });
});

export default app;
