import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: String,
    title: String,
    comment: String,
    rating: Number,
  },
  { collection: "reviews", timestamps: true }
);

export default mongoose.model("Review", reviewSchema);
