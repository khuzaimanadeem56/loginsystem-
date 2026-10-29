import User from "../models/User.js";
import bcrypt from "bcryptjs";

export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const exist = await User.findOne({ email });
    if (exist) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const role = email === "khuzi56@gmail.com" ? "admin" : "user";

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role
    });

    res.status(201).json({
      message: "Registered successfully",
      user: {
        _id: user._id,
        name: user.name || "User",
        email: user.email,
        role: user.role,
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // ✅ SIRF RESPONSE
res.status(200).json({
  message: "Login successful",
  user: {
    _id: user._id,
    name: user.name || "User",
    email: user.email,
    gender: user.gender || "",
    image: user.image || ""
  }
});



  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// GET PROFILE
export const getProfile = async (req, res) => {
  const user = await User.findById(req.params.id);
  res.json(user);
};

// UPDATE PROFILE
export const updateProfile = async (req, res) => {
  try {
    const { name, gender, bio, phone } = req.body; // ✅ phone bhi include

    const updateData = { name, gender, bio, phone }; // ✅ phone update me

    if (req.file) {
      updateData.image = req.file.filename; // image upload handle
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json({
      message: "Profile updated successfully",
      user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
// 👇 YEH FUNCTION MUST HO
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ADMIN – UPDATE USER
// ✅ ADMIN – UPDATE USER
export const adminUpdateUser = async (req, res) => {
  try {
    const { name, email, phone, gender, bio } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, gender, bio },
      { new: true }
    );

    res.json({
      message: "User updated by admin",
      user
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ ADMIN – DELETE USER
export const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);

    res.json({
      message: "User deleted successfully"
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



