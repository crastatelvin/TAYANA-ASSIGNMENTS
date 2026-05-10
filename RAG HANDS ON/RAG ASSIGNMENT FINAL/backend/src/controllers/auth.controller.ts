import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

// In-memory user store for demo purposes
const DEMO_USERS = [
  { id: "user-001", username: "admin", password: "admin123" },
  { id: "user-002", username: "student", password: "student123" },
  { id: "user-003", username: "instructor", password: "instructor123" },
];

export class AuthController {
  static async login(req: Request, res: Response) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      const user = DEMO_USERS.find(
        (u) => u.username === username && u.password === password
      );

      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }

      const token = jwt.sign(
        { id: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      console.log(`✅ Login Success: ${user.username} (${user.id})`);

      return res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
        },
      });
    } catch (error: unknown) {
      console.error("Login error:", error);
      return res.status(500).json({ message: "Login failed" });
    }
  }
}
