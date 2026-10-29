const raw = (import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || "").trim();
const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/?$/i.test(raw);
const cleaned = raw.replace(/\/$/, "");

// Production Vercel build must never call localhost — the browser would hit the user's PC, not the server.
export const API_URL = import.meta.env.PROD
  ? (cleaned && !isLocalhost ? cleaned : "/api")
  : (cleaned || "http://localhost:5000");
