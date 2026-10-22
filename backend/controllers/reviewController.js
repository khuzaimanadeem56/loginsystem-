import Review from "../models/Review.js";

// GET all reviews
export const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST a review
export const addReview = async (req, res) => {
  try {
    const { userId, name, title, comment, rating } = req.body;
    const review = await Review.create({ userId, name, title, comment, rating });
    res.status(201).json({ message: "Review submitted successfully", review });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
