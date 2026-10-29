// Detect environment variables across Vite, Next.js, and CRA conventions
const getEnvVar = () => {
  if (typeof import.meta !== "undefined" && import.meta.env) {
    return (
      import.meta.env.VITE_API_URL ||
      import.meta.env.NEXT_PUBLIC_API_URL ||
      import.meta.env.VITE_BACKEND_URL ||
      import.meta.env.VITE_API_BASE_URL ||
      ""
    );
  }
  if (typeof process !== "undefined" && process.env) {
    return (
      process.env.REACT_APP_API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      process.env.VITE_API_URL ||
      ""
    );
  }
  return "";
};

const raw = getEnvVar().trim();
const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/?$/i.test(raw);

// Clean trailing slashes
let cleaned = raw.replace(/\/+$/, "");

// HTTPS / Protocol Mismatch Guard:
// If the frontend is hosted over HTTPS, upgrade any remote HTTP API URLs to HTTPS to prevent mixed content blocking.
const isBrowser = typeof window !== "undefined" && Boolean(window.location);
const isHttpsFrontend = isBrowser && window.location.protocol === "https:";

if (cleaned && !isLocalhost) {
  if (cleaned.startsWith("http://") && (isHttpsFrontend || import.meta.env?.PROD)) {
    cleaned = cleaned.replace(/^http:\/\//i, "https://");
  } else if (!cleaned.startsWith("http://") && !cleaned.startsWith("https://") && !cleaned.startsWith("/")) {
    cleaned = (isHttpsFrontend || import.meta.env?.PROD ? "https://" : "http://") + cleaned;
  }
}

// In production:
// 1. If a valid remote backend URL is provided (e.g. Render, Railway, or separate Vercel deployment), use it.
// 2. If no URL is provided (or if it was left as localhost), use relative "/api" for same-domain Vercel rewrites.
// In local development:
// Use the configured URL or default to "http://localhost:5000".
export const API_URL = import.meta.env?.PROD
  ? (cleaned && !isLocalhost ? cleaned : "/api")
  : (cleaned || "http://localhost:5000");

// Safe helper to construct endpoint URLs
export const getApiUrl = (endpoint = "") => {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${API_URL}${cleanEndpoint}`;
};
