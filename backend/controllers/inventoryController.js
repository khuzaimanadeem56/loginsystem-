import Inventory from "../models/Inventory.js";
import fs from "fs";
import path from "path";

export const createInventory = async (req, res) => {
  try {
    const { name, sale, inStock, description, discount } = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    const item = new Inventory({
      name,
      description: description || "",
      sale: sale ? Number(sale) : 0,
      discount: discount ? Number(discount) : 0,
      inStock: inStock === "true" || inStock === true,
      image: imagePath,
    });

    await item.save();
    res.status(201).json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, sale, inStock, description, discount } = req.body;
    const item = await Inventory.findById(id);
    if (!item) return res.status(404).json({ message: 'Not found' });

    if (name !== undefined) item.name = name;
    if (description !== undefined) item.description = description;
    if (sale !== undefined) item.sale = Number(sale) || 0;
    if (discount !== undefined) item.discount = Number(discount) || 0;
    if (inStock !== undefined) item.inStock = inStock === 'true' || inStock === true;
    if (req.file) {
      item.image = `/uploads/${req.file.filename}`;
    }

    await item.save();
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getInventory = async (req, res) => {
  try {
    const items = await Inventory.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Inventory.findById(id);
    if (!item) return res.status(404).json({ message: 'Not found' });

    // Attempt to remove image file if present
    if (item.image) {
      try {
        const filename = path.basename(item.image);
        const uploadsDir = path.join(process.cwd(), 'uploads');
        const filePath = path.join(uploadsDir, filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (fsErr) {
        console.warn('Failed to remove image file:', fsErr.message);
      }
    }

    await Inventory.findByIdAndDelete(id);
    res.json({ message: 'Inventory deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
