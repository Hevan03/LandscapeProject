// Models/landscaperModel.js

import mongoose from "mongoose";

const availabilitySchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  slots: {
    type: [String], // Array of time slots, e.g., ["09:00-10:00", "10:00-11:00"]
    required: true,
  },
});

const landscaperSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    phone: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String },
    Employee_Image: { type: String, required: false },
    specialties: {
      type: [String], // E.g., ["Lawn Care", "Garden Design", "Irrigation"]
      default: [],
    },
    availability: {
      type: [availabilitySchema],
      default: [],
    },
    rating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    passwordHash: { type: String, required: false },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    accountStatus: { type: String, enum: ["pending", "approved", "rejected", "inactive"], default: "pending" },
  },
  {
    timestamps: true,
  }
);

const landscaperModel = mongoose.model("Landscaper", landscaperSchema);
export default landscaperModel;
