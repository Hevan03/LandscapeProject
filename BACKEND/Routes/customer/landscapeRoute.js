import express from "express";
import {
  createLandscape,
  getAllLandscapes,
  getLandscapeById,
  updateLandscape,
  deleteLandscape,
} from "../../Controllers/customer/landscapeController.js";

const router = express.Router();

router.get("/", getAllLandscapes);
router.get("/:id", getLandscapeById);
router.post("/", createLandscape);
router.put("/:id", updateLandscape);
router.delete("/:id", deleteLandscape);

export default router;
