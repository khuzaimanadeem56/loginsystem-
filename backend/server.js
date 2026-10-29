import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import orderRoutes from "./routes/orderRoutes.js"; // 1. Import karein
import stripeRoutes from "./routes/stripeRoutes.js";
import helpRoutes from "./routes/helpRoutes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

connectDB();

const mountRoutes = (path, router) => {
  app.use(path, router);
  app.use(`/api${path}`, router);
};

app.get(["/health", "/api/health"], (_req, res) => {
  res.json({ ok: true });
});

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