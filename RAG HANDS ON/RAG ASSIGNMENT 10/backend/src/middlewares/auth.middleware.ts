import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.warn("⚠️ Auth Failed: Header missing or not Bearer");
    return res.status(401).json({ message: "Authorization header missing or invalid" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token missing" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET!) as any;
    (req as any).user = decoded;
    console.log(`✅ Auth Success: User ${decoded.id}`);
    next();
  } catch (error: any) {
    console.error(`❌ Auth Failed: ${error.message}`);
    return res.status(401).json({ message: "Invalid token" });
  }
};
