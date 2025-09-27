import express from "express";
import { login, getProfile, updateProfilePicture } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/auth.js"; // Assuming you have this
import upload from "../middleware/upload.js";

const router = express.Router();

router.post("/login", login);
router.get("/profile", authMiddleware, getProfile);

// ✅ New Route for Profile Picture Upload
// - 'authMiddleware' protects the route
// - 'upload.single("profileImage")' handles the file upload. 
//   'profileImage' must be the field name in the form data from the frontend.
router.put(
  "/profile/picture",
  authMiddleware,
  upload.single("profileImage"),
  updateProfilePicture
);

export default router;