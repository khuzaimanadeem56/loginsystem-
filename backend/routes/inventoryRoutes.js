import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { createInventory, getInventory, updateInventory, deleteInventory } from "../controllers/inventoryController.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, "..", "uploads");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, unique + ext);
  },
});

const upload = multer({ storage });

const router = express.Router();

router.get("/", getInventory);
router.post("/", upload.single("image"), createInventory);
router.put("/:id", upload.single("image"), updateInventory);
router.delete("/:id", deleteInventory);

export default router;
