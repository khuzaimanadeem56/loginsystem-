import Inventory from "../models/Inventory.js";
import fs from "fs";
import path from "path";
import connectDB, { isDbConnected } from "../config/db.js";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../config/cloudinary.js";

export const createInventory = async (req, res) => {
  try {
    if (!isDbConnected()) {
      await connectDB();
    }

    const { name, sale, inStock, description, discount } = req.body || {};

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Product name is required." });
    }

    let imagePath = null;

    if (req.file) {
      try {
        const uploadResult = await uploadToCloudinary(req.file.buffer, {
          folder: "inventory",
          filename: req.file.originalname,
          mimetype: req.file.mimetype,
        });
        imagePath = uploadResult.secure_url || uploadResult.url;
      } catch (uploadErr) {
        console.warn("[Inventory Upload Warning]:", uploadErr.message);
        if (req.file.buffer) {
          const mime = req.file.mimetype || "image/jpeg";
          imagePath = `data:${mime};base64,${req.file.buffer.toString("base64")}`;
        }
      }
    }

    const item = new Inventory({
      name: name.trim(),
      description: description ? description.trim() : "",
      sale: sale ? Number(sale) : 0,
      discount: discount ? Number(discount) : 0,
      inStock: inStock === "true" || inStock === true,
      image: imagePath,
    });

    await item.save();
    return res.status(201).json(item);
  } catch (err) {
    console.error("[Create Inventory Error]:", err);
    return res.status(500).json({ message: err.message || "Server error while saving product." });
  }
};

export const updateInventory = async (req, res) => {
  try {
    if (!isDbConnected()) {
      await connectDB();
    }

    const { id } = req.params;
    const { name, sale, inStock, description, discount } = req.body || {};
    const item = await Inventory.findById(id);
    if (!item) return res.status(404).json({ message: "Product not found" });

    if (name !== undefined) item.name = name.trim();
    if (description !== undefined) item.description = description.trim();
    if (sale !== undefined) item.sale = Number(sale) || 0;
    if (discount !== undefined) item.discount = Number(discount) || 0;
    if (inStock !== undefined) item.inStock = inStock === "true" || inStock === true;

    if (req.file) {
      try {
        const uploadResult = await uploadToCloudinary(req.file.buffer, {
          folder: "inventory",
          filename: req.file.originalname,
          mimetype: req.file.mimetype,
        });

        // Cleanup previous image if hosted on Cloudinary
        if (item.image && item.image.includes("cloudinary.com")) {
          deleteFromCloudinary(item.image).catch(() => {});
        }

        item.image = uploadResult.secure_url || uploadResult.url;
      } catch (uploadErr) {
        console.warn("[Inventory Update Upload Warning]:", uploadErr.message);
        if (req.file.buffer) {
          const mime = req.file.mimetype || "image/jpeg";
          item.image = `data:${mime};base64,${req.file.buffer.toString("base64")}`;
        }
      }
    }

    await item.save();
    return res.json(item);
  } catch (err) {
    console.error("[Update Inventory Error]:", err);
    return res.status(500).json({ message: err.message || "Server error while updating product." });
  }
};

export const getInventory = async (req, res) => {
  try {
    if (!isDbConnected()) {
      await connectDB();
    }
    const items = await Inventory.find().sort({ createdAt: -1 });
    return res.json(items);
  } catch (err) {
    console.error("[Get Inventory Error]:", err);
    return res.status(500).json({ message: "Server error while loading products." });
  }
};

export const deleteInventory = async (req, res) => {
  try {
    if (!isDbConnected()) {
      await connectDB();
    }

    const { id } = req.params;
    const item = await Inventory.findById(id);
    if (!item) return res.status(404).json({ message: "Product not found" });

    // Safely remove image if stored on Cloudinary or local uploads
    if (item.image) {
      try {
        if (item.image.includes("cloudinary.com")) {
          await deleteFromCloudinary(item.image);
        } else if (!item.image.startsWith("data:")) {
          const filename = path.basename(item.image);
          const uploadsDir = path.join(process.cwd(), "uploads");
          const filePath = path.join(uploadsDir, filename);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
      } catch (cleanupErr) {
        console.warn("Non-fatal notice during image cleanup:", cleanupErr.message);
      }
    }

    await Inventory.findByIdAndDelete(id);
    return res.json({ message: "Inventory deleted" });
  } catch (err) {
    console.error("[Delete Inventory Error]:", err);
    return res.status(500).json({ message: err.message || "Server error while deleting product." });
  }
};
