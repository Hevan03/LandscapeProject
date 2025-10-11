// Routes/landscaperRoute.js

import express from "express";
import {
  getAllLandscapers,
  createLandscaper,
  getLandscaperById,
  addOrUpdateAvailability,
  updateLandscaperProfile,
  removeAvailability,
} from "../../Controllers/landscape/landscaperController.js";
import upload from "../../middleware/upload.js"; // for profile image upload
import { authMiddleware } from "../../middleware/auth.js";

const router = express.Router();

// GET all landscapers
router.get("/", getAllLandscapers);

// GET a single landscaper by ID
router.get("/profile/:id", getLandscaperById);

// POST a new landscaper
router.post("/register", createLandscaper);

// PATCH to update availability for a specific landscaper - Can delete if not needed
router.post("/:id/availability", addOrUpdateAvailability);
router.delete("/:id/availability", removeAvailability);

router.put("/update-profile/:id", authMiddleware, upload.single("profileImage"), updateLandscaperProfile);

export default router;
