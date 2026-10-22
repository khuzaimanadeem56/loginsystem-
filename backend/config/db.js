import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/bobby");
    console.log("MongoDB Connected (DB: bobby)");
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

export default connectDB;
