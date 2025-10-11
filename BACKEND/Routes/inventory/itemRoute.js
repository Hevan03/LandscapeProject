import express from "express";
import multer from "multer";
import {
  getitemById,
  deleteitem,
  updateitem,
  createitem,
  getAllitems,
} from "../../Controllers/inventory/itemController.js";

const router = express.Router();

// Configure multer for single file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Save files inside /uploads
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // Unique filename
  },
});

const upload = multer({ storage });

router.get("/", getAllitems);
router.get("/:id", getitemById);
// Corrected to use "image" to match the frontend
router.post("/", upload.single("image"), createitem);
// Corrected to use "image" to match the frontend
router.put("/:id", upload.single("image"), updateitem);
router.delete("/:id", deleteitem);

export default router;
