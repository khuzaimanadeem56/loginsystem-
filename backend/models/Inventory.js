import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    image: { type: String },
    sale: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    inStock: { type: Boolean, default: true },
  },
  { collection: "inventory", timestamps: true }
);

export default mongoose.model("Inventory", inventorySchema);
