import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import connectDB, { isDbConnected } from "../config/db.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../config/cloudinary.js";

// Safe JWT Secret reader with fallback
const getJwtSecret = () => {
  return (
    process.env.JWT_SECRET ||
    process.env.JWT_KEY ||
    "antigravity_jwt_secret_fallback_key_2026"
  );
};

// Generate JWT Helper
const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role: role || "user" },
    getJwtSecret(),
    { expiresIn: "30d" }
  );
};

// ==========================================
// REGISTER USER
// ==========================================
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body || {};

  try {
    // 1. Ensure DB connection is active
    if (!isDbConnected()) {
      await connectDB();
    }

    // 2. Validate inputs
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    if (typeof password !== "string" || password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long.",
      });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanName = name ? String(name).trim() : cleanEmail.split("@")[0];

    // 3. Check for existing user
    const exist = await User.findOne({ email: cleanEmail });
    if (exist) {
      return res.status(400).json({
        message: "User with this email already exists.",
      });
    }

    // 4. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const role = cleanEmail === "khuzi56@gmail.com" ? "admin" : "user";

    // 5. Create user in DB
    const user = await User.create({
      name: cleanName,
      email: cleanEmail,
      password: hashedPassword,
      role,
    });

    // 6. Generate token
    const token = generateToken(user._id, user.role);

    return res.status(201).json({
      message: "Registered successfully",
      token,
      user: {
        _id: user._id,
        name: user.name || "User",
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("[Register Error]:", error);

    // MongoDB duplicate key error code
    if (error.code === 11000) {
      return res.status(400).json({
        message: "An account with this email already exists.",
      });
    }

    // Mongoose validation error
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: Object.values(error.errors).map((e) => e.message).join(", "),
      });
    }

    // Database connection issues
    if (
      error.name === "MongoServerSelectionError" ||
      error.name === "MongoNetworkError" ||
      error.message?.includes("buffering timed out")
    ) {
      return res.status(503).json({
        message:
          "Database connection error. Please verify MongoDB Atlas Network Access whitelist (0.0.0.0/0) and MONGO_URI.",
      });
    }

    return res.status(500).json({
      message: error.message || "Internal server error during registration.",
    });
  }
};

// ==========================================
// LOGIN USER
// ==========================================
export const loginUser = async (req, res) => {
  const { email, password } = req.body || {};

  try {
    // 1. Ensure DB connection is active
    if (!isDbConnected()) {
      await connectDB();
    }

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user._id, user.role);

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        name: user.name || "User",
        email: user.email,
        role: user.role || (user.email === "khuzi56@gmail.com" ? "admin" : "user"),
        gender: user.gender || "",
        image: user.image || "",
      },
    });
  } catch (error) {
    console.error("[Login Error]:", error);

    if (
      error.name === "MongoServerSelectionError" ||
      error.name === "MongoNetworkError" ||
      error.message?.includes("buffering timed out")
    ) {
      return res.status(503).json({
        message:
          "Database connection error. Please verify MongoDB Atlas Network Access whitelist (0.0.0.0/0) and MONGO_URI.",
      });
    }

    return res.status(500).json({
      message: error.message || "Internal server error during login.",
    });
  }
};

// ==========================================
// GET PROFILE
// ==========================================
export const getProfile = async (req, res) => {
  try {
    if (!isDbConnected()) await connectDB();
    const user = await User.findById(req.params.id);
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ==========================================
// UPDATE PROFILE
// ==========================================
export const updateProfile = async (req, res) => {
  try {
    if (!isDbConnected()) await connectDB();
    const { name, gender, bio, phone } = req.body || {};
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (gender !== undefined) updateData.gender = gender;
    if (bio !== undefined) updateData.bio = bio;
    if (phone !== undefined) updateData.phone = phone;

    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.buffer, {
        folder: "profiles",
        filename: req.file.originalname,
        mimetype: req.file.mimetype,
      });

      // Cleanup prior Cloudinary image if it exists
      try {
        const existingUser = await User.findById(req.params.id);
        if (existingUser?.image && existingUser.image.includes("cloudinary.com")) {
          deleteFromCloudinary(existingUser.image).catch(() => {});
        }
      } catch {
        // Non-fatal
      }

      updateData.image = uploadResult.secure_url || uploadResult.url;
    }

    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.json({
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("[Update Profile Error]:", error);
    return res.status(500).json({
      message: error.message || "Failed to update profile.",
    });
  }
};

// ==========================================
// ADMIN: GET ALL USERS
// ==========================================
export const getAllUsers = async (req, res) => {
  try {
    if (!isDbConnected()) await connectDB();
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ==========================================
// ADMIN: UPDATE USER
// ==========================================
export const adminUpdateUser = async (req, res) => {
  try {
    if (!isDbConnected()) await connectDB();
    const { name, email, phone, gender, bio } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, gender, bio },
      { new: true }
    );

    res.json({
      message: "User updated by admin",
      user,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ==========================================
// ADMIN: DELETE USER
// ==========================================
export const deleteUser = async (req, res) => {
  try {
    if (!isDbConnected()) await connectDB();
    await User.findByIdAndDelete(req.params.id);

    res.json({
      message: "User deleted successfully",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
