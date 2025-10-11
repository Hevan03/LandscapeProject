import express from "express";
import Order from "../../Models/payment/orderModel.js";
import {
  getMonthlyDeliveryReports,
  getDeliveriesByDriver,
  getDeliveriesByVehicle,
  exportReports,
  getAllDeliveryReports,
  getCompletedOrders,
} from "../../Controllers/delivery/deliveryReportController.js";

const router = express.Router();

// Get pending orders
router.get("/pending", async (req, res) => {
  try {
    const pendingOrders = await Order.find({ status: "Pending" }).sort({
      createdAt: -1,
    });
    res.status(200).json(pendingOrders);
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

// Get all completed orders
router.get("/completed", getCompletedOrders);

export default router;
