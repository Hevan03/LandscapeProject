import express from "express";
import multer from "multer";
import path from "path";
import {
  createAppointment,
  getAllAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
  getAppointmentsForCustomer,
  getAppointmentsForLandscaper,
  updateAppointmentStatus,
} from "../Controllers/appointmentController.js";

const router = express.Router();

// --- Multer Configuration ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Files will be saved in the 'uploads' directory in your backend root
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    // Creates a unique filename to prevent overwriting
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  // Check the fieldname to apply different rules for images vs. plans
  if (file.fieldname === "siteImages") {
    // For images, check if the mimetype starts with 'image/'
    if (file.mimetype.startsWith('image/')) {
      cb(null, true); // Accept the file
    } else {
      cb(new Error('Only image files are allowed for Site Images!'), false); // Reject the file
    }
  } else if (file.fieldname === "sitePlan") {
    // For the plan, check for the exact 'application/pdf' mimetype
    if (file.mimetype === 'application/pdf') {
      cb(null, true); // Accept the file
    } else {
      cb(new Error('Only PDF files are allowed for Site Plan!'), false); // Reject the file
    }
  } else {
    // If it's some other unexpected file, reject it
    cb(null, false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // Limit files to 5MB each
});

// Using upload.fields() for multiple, different file inputs from the form.
const appointmentUploadMiddleware = upload.fields([
    { name: 'siteImages', maxCount: 5 }, // for multiple site images
    { name: 'sitePlan', maxCount: 1 }   // for a single plan file
]);


// --- Appointment API Routes ---

// GET all appointments
router.get("/", getAllAppointments);

// GET all appointments for a specific customer
router.get("/customer/:customerId", getAppointmentsForCustomer);

// GET all appointments for a specific landscaper
router.get("/landscaper/:landscaperId", getAppointmentsForLandscaper);

// GET a single appointment by its ID
router.get("/:id", getAppointmentById);

// POST a new appointment (with file uploads)
router.post("/", appointmentUploadMiddleware, createAppointment);

// PUT (update) an existing appointment (e.g., for editing the form later)
router.put("/:id", appointmentUploadMiddleware, updateAppointment);

// PATCH to update only the status of an appointment
router.patch("/:id/status", updateAppointmentStatus);

// DELETE an appointment
router.delete("/:id", deleteAppointment);


export default router;