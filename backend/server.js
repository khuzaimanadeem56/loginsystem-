import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import connectDB, { isDbConnected } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import stripeRoutes from "./routes/stripeRoutes.js";
import helpRoutes from "./routes/helpRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Load environment variables from cwd
dotenv.config();
// 2. If MONGO_URI is missing (e.g. running from project root), load from backend/.env
if (!process.env.MONGO_URI) {
  dotenv.config({ path: path.resolve(__dirname, ".env") });
}
if (!process.env.MONGO_URI) {
  dotenv.config({ path: path.resolve(__dirname, "../.env") });
}

const app = express();

// --- BULLETPROOF CORS CONFIGURATION ---
const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (mobile apps, curl, Postman, server-to-server)
    if (!origin) return callback(null, true);
    // Dynamically echo the requesting origin so credentials: true is accepted by browsers
    return callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Extra CORS headers safeguard
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept, Origin");
  }
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

// Initialize Database Connection on startup
connectDB().catch((err) => {
  console.warn(`[Startup Notice] Initial MongoDB connection pending: ${err.message}`);
});

// Database Guard Middleware for API requests
app.use(async (req, res, next) => {
  // Static uploads and health checks bypass database check
  if (
    req.path.includes("/uploads") ||
    req.path === "/health" ||
    req.path === "/api/health" ||
    req.path === "/" ||
    req.path === "/api"
  ) {
    return next();
  }

  try {
    if (!isDbConnected()) {
      await connectDB();
    }
    next();
  } catch (err) {
    console.error(`[DB Middleware] Blocked ${req.method} ${req.path} - DB disconnected:`, err.message);
    return res.status(503).json({
      error: "Database unavailable",
      message: "Server is running, but could not connect to MongoDB Atlas. Please ensure MONGO_URI is set in Vercel/production Environment Variables and MongoDB Atlas Network Access whitelist allows 0.0.0.0/0.",
      details: process.env.NODE_ENV === "production" ? undefined : err.message,
    });
  }
});

// Diagnostic & Health Check Endpoints
app.get(["/", "/api"], (_req, res) => {
  res.json({
    message: "Khuzi Xcessories Backend API is online",
    status: "healthy",
    database: isDbConnected() ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

app.get(["/health", "/api/health"], (_req, res) => {
  res.json({
    ok: true,
    status: "healthy",
    database: isDbConnected() ? "connected" : "disconnected",
    hasMongoUri: Boolean(process.env.MONGO_URI),
  });
});

// Dual Route Mounting: Handles BOTH /endpoint and /api/endpoint for seamless frontend & proxy routing
const mountRoutes = (path, router) => {
  app.use(path, router);
  app.use(`/api${path}`, router);
};

mountRoutes("/auth", authRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/uploads", express.static("uploads"));
mountRoutes("/reviews", reviewRoutes);
mountRoutes("/inventory", inventoryRoutes);
mountRoutes("/orders", orderRoutes);
mountRoutes("/stripe", stripeRoutes);
mountRoutes("/help", helpRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
