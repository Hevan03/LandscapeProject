// config/db.js
import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const mongoURI =
      process.env.MONGODB_URI ||
      "mongodb+srv://as12:7f6VADFpqvMOVTWw@cluster0.mvkphrl.mongodb.net/landscape_management";

    const options = {
      dbName: "landscape_management", // Ensure correct DB is used
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000,         // Close sockets after 45s of inactivity
    };

    await mongoose.connect(mongoURI, options);

    console.log("✅ MongoDB connected successfully");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    console.log("⚠️  Server will continue without database connection");
    // process.exit(1); // optional: keep commented for dev/testing
  }

  // Extra error event logging
  mongoose.connection.on("error", (err) => {
    console.error("❌ MongoDB runtime error:", err);
  });
};

export default connectDB;
