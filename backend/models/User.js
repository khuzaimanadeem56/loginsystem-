import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    password: { type: String, required: true },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    gender: String,
    bio: String,
    phone: String,
    image: String,
  },
  { collection: "users", timestamps: true }
);

export default mongoose.model("User", userSchema);
