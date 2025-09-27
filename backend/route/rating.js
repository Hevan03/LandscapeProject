// routes/rating.js
import express from "express";
import { rateUser, getUsersByRating, getLandscaperGrades, rateUserPublic } from "../controllers/rating.controller.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.post("/:userId/rate", authMiddleware, rateUser);       // rate a user (authenticated)
router.post("/:userId/rate-public", rateUserPublic);         // rate a user (public)
router.get("/all", getUsersByRating);                         // ordered ratings
router.get("/landscapers/grades", getLandscaperGrades);       // landscaper grades

export default router;
