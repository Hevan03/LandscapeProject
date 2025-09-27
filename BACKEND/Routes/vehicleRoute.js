const express = require("express");
const { 
  createVehicle,
  getAllVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
  getAvailableVehicles
} = require("../Controllers/vehicleController");

const router = express.Router();

router.post("/", createVehicle);
router.get("/", getAllVehicles);
router.get("/available", getAvailableVehicles); // Only for vehicles!
router.get("/:id", getVehicleById);
router.put("/:id", updateVehicle);
router.delete("/:id", deleteVehicle);

module.exports = router;