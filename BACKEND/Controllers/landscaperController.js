// Controllers/landscaperController.js

import landscaperModel from "../Models/landscaperModel.js";
import mongoose from "mongoose";

// Get all landscapers
export async function getAllLandscapers(req, res) {
  try {
    const landscapers = await landscaperModel.find().sort({ createdAt: -1 });
    res.status(200).json(landscapers);
  } catch (error) {
    console.error("Error fetching landscapers:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// GET a single landscaper by ID
export async function getLandscaperById(req, res) {
  const { id } = req.params;

  // Check if the ID is a valid MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid landscaper ID" });
  }

  try {
    const landscaper = await landscaperModel.findById(id);

    if (!landscaper) {
      return res.status(404).json({ message: "Landscaper not found" });
    }

    res.status(200).json(landscaper);
  } catch (error) {
    console.error("Error fetching landscaper:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Create new landscaper
export async function createLandscaper(req, res) {
  try {
    const { name, contact, specialties, availability } = req.body;

    // Basic validation
    if (!name || !contact) {
      return res
        .status(400)
        .json({ message: "Name and contact are required" });
    }

    const newLandscaper = new landscaperModel({
      name,
      contact,
      specialties,
      availability,
    });

    await newLandscaper.save();
    res
      .status(201)
      .json({ message: "Landscaper created successfully", data: newLandscaper });
  } catch (error) {
    console.error("Error creating landscaper:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * Adds a new availability entry or updates the slots for an existing one.
 */
export async function addOrUpdateAvailability(req, res) {
  const { id } = req.params;
  const { date, slots } = req.body; // Expects a single date and an array of slots

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid landscaper ID" });
  }
  if (!date || !slots) {
    return res.status(400).json({ message: "Date and slots are required" });
  }

  try {
    const landscaper = await landscaperModel.findById(id);
    if (!landscaper) {
      return res.status(404).json({ message: "Landscaper not found" });
    }

    // Use a timezone-safe method to compare dates
    const targetDate = new Date(date).toISOString().split('T')[0];

    // Check if availability for this date already exists
    const dateIndex = landscaper.availability.findIndex(avail => {
        const existingDate = new Date(avail.date).toISOString().split('T')[0];
        return existingDate === targetDate;
    });

    if (dateIndex > -1) {
      // If date exists, update its slots
      landscaper.availability[dateIndex].slots = slots;
    } else {
      // If date does not exist, add it to the array
      landscaper.availability.push({ date, slots });
    }

    const updatedLandscaper = await landscaper.save();
    res.status(200).json({
      message: "Availability updated successfully",
      data: updatedLandscaper,
    });

  } catch (error) {
    console.error("Error updating availability:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * Removes an availability entry for a specific date.
 */
export async function removeAvailability(req, res) {
  const { id } = req.params;
  const { date } = req.body; // Expects just the date to remove

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid landscaper ID" });
  }
  if (!date) {
    return res.status(400).json({ message: "Date is required" });
  }

  try {
    // We use MongoDB's $pull operator to remove an item from an array
    const updatedLandscaper = await landscaperModel.findByIdAndUpdate(
      id,
      {
        $pull: {
          availability: { date: new Date(date) } // Find and remove the entry matching this date
        }
      },
      { new: true } // Return the updated document
    );
    
    if (!updatedLandscaper) {
        return res.status(404).json({ message: "Landscaper not found" });
    }

    res.status(200).json({
      message: `Availability for ${new Date(date).toISOString().split('T')[0]} removed successfully`,
      data: updatedLandscaper,
    });
  } catch (error) {
    console.error("Error removing availability:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
