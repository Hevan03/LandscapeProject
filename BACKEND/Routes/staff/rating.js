// routes/rating.js
import express from "express";
import { rateUser, getUsersByRating, getLandscaperGrades, rateUserPublic, getEmployeeRatings } from "../../Controllers/staff/rating.controller.js";
import { authMiddleware } from "../../middleware/auth.js";

const router = express.Router();

router.post("/:userId/rate", authMiddleware, rateUser); // rate a user (authenticated)
router.post("/:userId/rate-public", rateUserPublic); // rate a user (public)
router.get("/", getUsersByRating); // ordered ratings
router.get("/landscapers/grades", getLandscaperGrades); // landscaper grades
router.get("/employee/:userId", getEmployeeRatings);

export default router;
