import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  userName: { type: String, required: true },
  productName: { type: String, required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Inventory" },
  quantity: { type: Number, required: true },
  totalAmount: { type: Number, required: true }, // PKR Amount
  paymentMethod: { type: String, required: true },
  transactionId: { type: String, required: true },
  address: { type: String, required: true },
  status: { type: String, default: "Pending" }, // Pending, Approved, Cancelled
  date: { type: Date, default: Date.now },
});

export default mongoose.model("Order", orderSchema);