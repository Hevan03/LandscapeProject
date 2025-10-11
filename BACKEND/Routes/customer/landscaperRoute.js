import express from "express";
import {
  getAllLandscapers,
  createLandscaper,
  registerLandscaper,
} from "../../Controllers/landscape/landscaperController.js";

const router = express.Router();

router.get("/", getAllLandscapers);
router.post("/", createLandscaper);
router.post("/register", registerLandscaper);

export default router;
