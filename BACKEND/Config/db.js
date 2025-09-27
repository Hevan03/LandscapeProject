db.js

const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb+srv://admin:yZMUHC5xRGVRiEQd@cluster0.vvw6xvv.mongodb.net/MernStackProject", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB Connected Successfully");
  } catch (err) {
    console.error("MongoDB Connection Failed:", err.message);
    process.exit(1); // Stop the server if DB fails
  }
};

module.exports = connectDB;