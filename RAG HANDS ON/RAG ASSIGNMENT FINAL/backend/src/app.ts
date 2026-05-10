import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import chatRoutes from "./routes/chat.routes";
import uploadRoutes from "./routes/upload.routes";
import authRoutes from "./routes/auth.routes";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.use("/api", authRoutes);
app.use("/api", chatRoutes);
app.use("/api", uploadRoutes);

export default app;
