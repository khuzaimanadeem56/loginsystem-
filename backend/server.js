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

app.use("/auth", authRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/reviews", reviewRoutes);
app.use("/inventory", inventoryRoutes);
app.use("/orders", orderRoutes); // 2. Yahan register karein
app.use("/stripe", stripeRoutes);
app.use("/help", helpRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});