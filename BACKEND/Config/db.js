import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

console.log("Current working directory:", process.cwd());
console.log("MONGO_URI:", process.env.MONGO_URI);
const URL = process.env.MONGO_URI;

const connectDB = async () => {
  try {
    // Add validation to check if URL exists
    if (!URL) {
      throw new Error("MongoDB URI is not defined in environment variables");
    }

    await mongoose.connect(URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB Connected Successfully");
  } catch (err) {
    console.error("❌ MongoDB Connection Failed:", err.message);
    process.exit(1); // Stop the server if DB fails
  }
};

export default connectDB;
