const express = require("express");
const {
  getMonthlyDeliveryReports,
  getDeliveriesByDriver,
  getDeliveriesByVehicle,
  exportReports,
  getAllDeliveryReports,
  getCompletedOrders
} = require("../Controllers/deliveryReportController");

const Order = require("../Models/orderModel"); // ✅ FIX: import Order model

const router = express.Router();

// Route to get pending orders
router.get("/pending", async (req, res) => {
  try {
    const pendingOrders = await Order.find({ status: "Pending" });
    res.json(pendingOrders);
  } catch (err) {
    console.error("Error fetching pending orders:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get all delivery reports
router.get("/", getAllDeliveryReports);

// Get monthly delivery reports
router.get("/monthly", getMonthlyDeliveryReports);

// Get deliveries by driver
router.get("/driver/:driverId", getDeliveriesByDriver);

// Get deliveries by vehicle
router.get("/vehicle/:vehicleId", getDeliveriesByVehicle);

// Export delivery reports
router.get("/export", exportReports);

router.get("/completed", getCompletedOrders);

module.exports = router;
