import Inventory from "../models/Inventory.js";
import fs from "fs";
import path from "path";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../config/cloudinary.js";

export const createInventory = async (req, res) => {
  try {
    const { name, sale, inStock, description, discount } = req.body || {};
    let imagePath = null;

    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.buffer, {
        folder: "inventory",
        filename: req.file.originalname,
        mimetype: req.file.mimetype,
      });
      imagePath = uploadResult.secure_url || uploadResult.url;
    }

    const item = new Inventory({
      name,
      description: description || "",
      sale: sale ? Number(sale) : 0,
      discount: discount ? Number(discount) : 0,
      inStock: inStock === "true" || inStock === true,
      image: imagePath,
    });

    await item.save();
    return res.status(201).json(item);
  } catch (err) {
    console.error("[Create Inventory Error]:", err);
    return res.status(500).json({ message: err.message || "Server error" });
  }
};

export const updateInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, sale, inStock, description, discount } = req.body || {};
    const item = await Inventory.findById(id);
    if (!item) return res.status(404).json({ message: "Not found" });

    if (name !== undefined) item.name = name;
    if (description !== undefined) item.description = description;
    if (sale !== undefined) item.sale = Number(sale) || 0;
    if (discount !== undefined) item.discount = Number(discount) || 0;
    if (inStock !== undefined) item.inStock = inStock === "true" || inStock === true;

    if (req.file) {
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
    }

    await item.save();
    return res.json(item);
  } catch (err) {
    console.error("[Update Inventory Error]:", err);
    return res.status(500).json({ message: err.message || "Server error" });
  }
};

export const getInventory = async (req, res) => {
  try {
    const items = await Inventory.find().sort({ createdAt: -1 });
    return res.json(items);
  } catch (err) {
    console.error("[Get Inventory Error]:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const deleteInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Inventory.findById(id);
    if (!item) return res.status(404).json({ message: "Not found" });

    // Safely remove image
    if (item.image) {
      try {
        if (item.image.includes("cloudinary.com")) {
          await deleteFromCloudinary(item.image);
        } else {
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
    return res.status(500).json({ message: err.message || "Server error" });
  }
};
