import express from "express";
import { createRequest, getAllRequests  } from "../Controllers/landscaperRequestController.js";

const router = express.Router();

router.post("/", createRequest);
router.get("/", getAllRequests);

export default router;
