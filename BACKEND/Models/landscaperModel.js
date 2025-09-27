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
    contact: {
      type: String,
      required: true,
      unique: true, // Assuming contact info like email or phone is unique
    },
    specialties: {
      type: [String], // E.g., ["Lawn Care", "Garden Design", "Irrigation"]
      default: [],
    },
    availability: {
      type: [availabilitySchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const landscaperModel = mongoose.model("Landscaper", landscaperSchema);
export default landscaperModel;