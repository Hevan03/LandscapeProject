const express = require("express");
const { 
  createDriver, 
  getAllDrivers, 
  getDriverById, 
  updateDriver, 
  deleteDriver,
  getAvailableDrivers
} = require("../Controllers/driverController");

const router = express.Router();

router.post("/", createDriver);
router.get("/", getAllDrivers);
router.get("/available", getAvailableDrivers); // Only for drivers!
router.get("/:id", getDriverById);
router.put("/:id", updateDriver);
router.delete("/:id", deleteDriver);

module.exports = router;