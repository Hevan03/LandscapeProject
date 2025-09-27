import express from "express";
import multer from "multer";
import {
  createProgress,
  getAllProgress,
  getProgressById,
  updateProgress,
  deleteProgress,
  getProgressForCustomer,
  getProgressForLandscaper,
  getProgressForLandscape
} from "../Controllers/progressController.js";

const router = express.Router();

// Configuring multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); 
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);  
  },
});

const upload = multer({ storage });

// Routes
router.get("/", getAllProgress);  
router.get("/:id", getProgressById); 
router.post("/", upload.array("images", 5), createProgress);  
router.put("/:id", upload.array("images", 5), updateProgress);  
router.delete("/:id", deleteProgress);  
router.get("/customer/:customerId", getProgressForCustomer);  
router.get("/landscaper/:landscaperId", getProgressForLandscaper);
router.get("/landscape/:landscapeId", getProgressForLandscape);

export default router;
