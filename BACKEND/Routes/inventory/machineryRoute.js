// machineryRoute.js
import express from "express";
import multer from "multer";
import path from "path";

import {
  addMachine,
  getAllMachines,
  updateMachine,
  deleteMachine,
} from "../../Controllers/inventory/machineryController.js";

const router = express.Router();

// Corrected Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Standardize to the 'uploads/' folder
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(
      new Error(
        "Error: File upload only supports JPEG, JPG, and PNG file types."
      )
    );
  },
}).array("images", 3);

router.post("/machines", upload, addMachine);
router.get("/machines", getAllMachines);
router.put("/machines/:id", upload, updateMachine);
router.delete("/machines/:id", deleteMachine);

export default router;
