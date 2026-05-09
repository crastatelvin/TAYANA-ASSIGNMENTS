import express from "express";
import uploadRoutes from "./routes/upload.routes";

const app = express();

app.use(express.json());
app.use("/api", uploadRoutes);

export default app;
