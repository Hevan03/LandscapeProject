import express from "express";
import {
  createWorker,
  getAllWorkers,
  getWorkerById,
  updateWorker,
  deleteWorker,
  getMyProfile,
  updateMyProfile,
  updateAvailability,
  createHireRequest,
  getMyHires,
  respondToHireRequest,
  getAllHires,
  respondToHireAdmin,
  getMyCustomerHires,
} from "../../Controllers/customer/maintenanceWorkerController.js";
import { createMaintenancePayment, getMyMaintenancePayments } from "../../Controllers/payment/maintenancePaymentController.js";
import { authMiddleware } from "../../middleware/auth.js";

const router = express.Router();

// Public CRUD
router.post("/", createWorker);
router.get("/", getAllWorkers);
router.get("/:id", getWorkerById);
router.put("/:id", updateWorker);
router.delete("/:id", deleteWorker);

// Authenticated maintenance worker endpoints
router.get("/me/profile", authMiddleware, getMyProfile);
router.put("/me/profile", authMiddleware, updateMyProfile);
router.put("/me/availability", authMiddleware, updateAvailability);

// Customer creates a hire request
router.post("/hire", authMiddleware, createHireRequest);

// Maintenance worker views and responds to hires
router.get("/me/hires", authMiddleware, getMyHires);
router.put("/me/hires/:hireId/respond", authMiddleware, respondToHireRequest);

// Customer: view my hire requests
router.get("/customer/hires", authMiddleware, getMyCustomerHires);

// Admin endpoints: list and respond to any hire
router.get("/admin/hires", authMiddleware, getAllHires);
router.post("/admin/hires/:hireId/respond", authMiddleware, respondToHireAdmin);

// Maintenance payment endpoints
router.post("/me/payments", authMiddleware, createMaintenancePayment);
router.get("/me/payments", authMiddleware, getMyMaintenancePayments);

export default router;
