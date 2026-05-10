import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

export class CacheService {
  private static redis: Redis | null = null;
  private static mockStore = new Map<string, string>();
  private static isRedisAvailable = false;

  static {
    try {
      this.redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
        maxRetriesPerRequest: 1,
        connectTimeout: 2000,
      });

      this.redis.on("error", (err) => {
        if (this.isRedisAvailable) {
          console.warn("⚠️ Redis connection lost. Falling back to in-memory cache.");
        }
        this.isRedisAvailable = false;
      });

      this.redis.on("connect", () => {
        console.log("✅ Connected to Redis.");
        this.isRedisAvailable = true;
      });
    } catch (e) {
      console.warn("⚠️ Redis initialization failed. Using in-memory cache.");
    }
  }

  static async get(key: string): Promise<string | null> {
    if (this.isRedisAvailable && this.redis) {
      try {
        return await this.redis.get(key);
      } catch {
        return this.mockStore.get(key) || null;
      }
    }
    return this.mockStore.get(key) || null;
  }

  static async set(key: string, value: string, ttlSeconds = 3600) {
    if (this.isRedisAvailable && this.redis) {
      try {
        await this.redis.set(key, value, "EX", ttlSeconds);
        return;
      } catch {
        // Fallback to mock
      }
    }
    this.mockStore.set(key, value);
  }
}
