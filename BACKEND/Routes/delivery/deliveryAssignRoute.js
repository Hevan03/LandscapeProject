import express from "express";
import {
  createDeliveryAssignment,
  getAllDeliveryAssignments,
  getDeliveryAssignmentById,
  updateDeliveryAssignment,
  deleteDeliveryAssignment,
  getPaidOrders,
  getPendingOrders,
  getAvailableDrivers,
  getAvailableVehicles,
  getDriverDeliveries,
  exportDeliveryAssignmentsCsv,
} from "../../Controllers/delivery/deliveryAssignController.js";

const router = express.Router();

// Route to create a new delivery assignment
router.post("/", createDeliveryAssignment);

// Route to get all delivery assignments
router.get("/", getAllDeliveryAssignments);

// Route to get paid orders that need assignment
router.get("/paid-orders", getPaidOrders);

// Route to get pending orders (no assignment yet) for quick demo
router.get("/pending-orders", getPendingOrders);

// Route to get available drivers
router.get("/available-drivers", getAvailableDrivers);

// Route to get available vehicles
router.get("/available-vehicles", getAvailableVehicles);

// Route to get deliveries for a specific driver
router.get("/driver/:driverId", getDriverDeliveries);

// CSV report download
router.get("/report.csv", exportDeliveryAssignmentsCsv);

// Route to get a single delivery assignment by ID
router.get("/:id", getDeliveryAssignmentById);

// Route to update a delivery assignment
router.put("/:id", updateDeliveryAssignment);

// Route to delete a delivery assignment
router.delete("/:id", deleteDeliveryAssignment);

export default router;
