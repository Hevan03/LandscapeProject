import express from "express";
import multer from "multer";
import path from "path";
import { createLandscape, getAllLandscapes,getLandscapeById, updateLandscape,deleteLandscape,getLandscapesForLandscaper,requestBlueprint,uploadBlueprint,getLandscapesForCustomer } from "../Controllers/landscapeController.js";

const router = express.Router();

// --- Multer Configuration ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === "projectImages") {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for Project Images!'), false);
    }
  } else if (["sitePlan", "quotation","blueprintFile"].includes(file.fieldname)) {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed for Site Plan!'), false);
    }
  } else {
    cb(null, false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
});

const landscapeUploadMiddleware = upload.fields([
    { name: 'projectImages', maxCount: 10 }, // for multiple project images
    { name: 'sitePlan', maxCount: 1 },      // for a single site plan file
    { name: 'quotation', maxCount: 1 }      // for a single quotation file

]);

const blueprintUploadMiddleware = upload.single('blueprintFile');

router.get("/", getAllLandscapes);
router.get("/:id", getLandscapeById);
router.get("/landscaper/:landscaperId", getLandscapesForLandscaper);
router.get("/customer/:customerId", getLandscapesForCustomer);
router.post("/", landscapeUploadMiddleware,createLandscape);
router.put("/:id", updateLandscape);
router.delete("/:id", deleteLandscape);
router.put("/:id/request-blueprint", requestBlueprint);
router.put("/:id/upload-blueprint", blueprintUploadMiddleware, uploadBlueprint);



export default router;

 