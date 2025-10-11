import express from "express";
import {
  createDriver,
  getAllDrivers,
  getDriverById,
  updateDriver,
  deleteDriver,
  getAvailableDrivers,
} from "../../Controllers/delivery/driverController.js";

const router = express.Router();

router.post("/register", createDriver);
router.get("/", getAllDrivers);
router.get("/available", getAvailableDrivers); // Only for drivers!
router.get("/:id", getDriverById);
router.put("/:id", updateDriver);
router.delete("/:id", deleteDriver);

export default router;
