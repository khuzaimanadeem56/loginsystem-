import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, required: true },
    password: String,

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
  { collection: "users" }
);

export default mongoose.model("User", userSchema);
