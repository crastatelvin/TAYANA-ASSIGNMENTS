// In production (Vercel), we can set VITE_API_BASE to the Railway backend URL
// In development, it falls back to the proxy path "/api"
export const API_BASE = import.meta.env.VITE_API_BASE || "/api";
