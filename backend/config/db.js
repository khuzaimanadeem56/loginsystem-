import mongoose from "mongoose";

let cachedConnectionPromise = null;

export const isDbConnected = () => mongoose.connection.readyState === 1;

const connectDB = async () => {
  // If already connected, return existing connection immediately
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const uri = process.env.MONGO_URI;
  if (!uri) {
    const errorMsg = "CRITICAL: MONGO_URI is missing from process.env! Please add MONGO_URI in your Vercel/production Environment Variables.";
    console.error(`[Database Error] ${errorMsg}`);
    throw new Error(errorMsg);
  }

  // Reuse in-flight connection promise across simultaneous requests (Serverless / Fluid compute)
  if (cachedConnectionPromise) {
    try {
      return await cachedConnectionPromise;
    } catch {
      cachedConnectionPromise = null;
    }
  }

  try {
    cachedConnectionPromise = mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, // 5 seconds fail-fast so requests don't hang indefinitely
      connectTimeoutMS: 10000,
    });

    const conn = await cachedConnectionPromise;
    console.log(`✅ MongoDB Connected successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    cachedConnectionPromise = null;
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error("👉 Common causes:");
    console.error("   1. MongoDB Atlas Network Access: Ensure '0.0.0.0/0' is added in Atlas Security > Network Access.");
    console.error("   2. Credentials: Check if the username/password in MONGO_URI is correct and has db permissions.");
    console.error("   3. Vercel Environment Variables: Ensure MONGO_URI is added in Vercel Project Settings > Environment Variables.");
    throw error;
  }
};

export default connectDB;
