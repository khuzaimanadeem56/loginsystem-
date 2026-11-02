import express from "express";
import { upload, handleUpload } from "../config/cloudinary.js";
import {
  createInventory,
  getInventory,
  updateInventory,
  deleteInventory,
} from "../controllers/inventoryController.js";

const router = express.Router();

router.get("/", getInventory);
router.post("/", handleUpload(upload.single("image")), createInventory);
router.put("/:id", handleUpload(upload.single("image")), updateInventory);
router.delete("/:id", deleteInventory);

export default router;
