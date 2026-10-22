import express from "express";
import multer from "multer";

import {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  getAllUsers,
  adminUpdateUser,
  deleteUser
} from "../controllers/authController.js";


const router = express.Router();

// multer config
const storage = multer.diskStorage({
  destination: "uploads",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "_" + file.originalname);
  }
});

const upload = multer({ storage });

router.post("/register", registerUser);
router.post("/login", loginUser);

router.get("/profile/:id", getProfile);
router.put("/profile/:id", upload.single("image"), updateProfile);

// ✅ ADMIN – ALL USERS
router.get("/users", getAllUsers);
router.put("/users/:id", adminUpdateUser);
router.delete("/users/:id", deleteUser);


export default router;
