import express from "express";
import Order from "../models/Order.js";

const router = express.Router();

// Order save karne ke liye (Checkout page se call hoga)
router.post("/", async (req, res) => {
  try {
    const newOrder = new Order(req.body);
    await newOrder.save();
    res.status(201).json({ message: "Order placed successfully" });
  } catch (error) {
    console.error('Order save error:', error);
    res.status(400).json({ error: error.message || "Transaction ID already used or invalid data" });
  }
});

// User ke apne orders fetch karne ke liye (History page)
// Accepts GET /orders?email=...
router.get("/", async (req, res) => {
  try {
    const { email } = req.query;
    const orders = await Order.find({ userEmail: email }).sort({ date: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Error fetching orders" });
  }
});


// 1. Admin ke liye saare orders fetch karna
router.get("/admin/all", async (req, res) => {
  try {
    const orders = await Order.find().sort({ date: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Error fetching all orders" });
  }
});

// 2. Order status update karna (Approve/Reject)
router.put("/status/:id", async (req, res) => {
  try {
    const { status } = req.body;
    await Order.findByIdAndUpdate(req.params.id, { status });
    res.json({ message: `Order ${status} successfully` });
  } catch (error) {
    res.status(500).json({ error: "Update failed" });
  }
});

export default router;