// Routes/landscaperRoute.js

import express from "express";
import {
  getAllLandscapers,
  createLandscaper,
  getLandscaperById,
  addOrUpdateAvailability, // <-- RENAMED/IMPROVED
  removeAvailability,
} from "../Controllers/landscaperController.js";

const router = express.Router();

// GET all landscapers
router.get("/", getAllLandscapers);

// GET a single landscaper by ID
router.get("/:id", getLandscaperById);

// POST a new landscaper
router.post("/", createLandscaper);

// PATCH to update availability for a specific landscaper
router.post("/:id/availability", addOrUpdateAvailability);
router.delete("/:id/availability", removeAvailability);

export default router;