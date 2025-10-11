import DeliveryAssignment from "../../Models/delivery/deliveryAssignModel.js";
import { startOfMonth, endOfMonth } from "date-fns";

// Get all delivery reports
export const getAllDeliveryReports = async (req, res) => {
  try {
    const reports = await DeliveryAssignment.find();
    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong.",
      error: error.message,
    });
  }
};

// Get monthly delivery reports
export const getMonthlyDeliveryReports = async (req, res) => {
  try {
    const { year, month } = req.query;
    if (!year || !month) {
      return res.status(400).json({
        message:
          "Please provide both year and month (e.g., ?year=2025&month=1).",
      });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const reports = await DeliveryAssignment.find({
      createdAt: { $gte: startDate, $lte: endDate },
    });

    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong.",
      error: error.message,
    });
  }
};

// Get deliveries by a specific driver
export const getDeliveriesByDriver = async (req, res) => {
  try {
    const { driverId } = req.params;
    const deliveries = await DeliveryAssignment.find({ driverId });
    res.status(200).json(deliveries);
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong.",
      error: error.message,
    });
  }
};

// Get deliveries by a specific vehicle
export const getDeliveriesByVehicle = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const deliveries = await DeliveryAssignment.find({ vehicleId });
    res.status(200).json(deliveries);
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong.",
      error: error.message,
    });
  }
};

// Get all completed orders
export const getCompletedOrders = async (req, res) => {
  try {
    const assignments = await DeliveryAssignment.find({ status: "Delivered" });
    res.status(200).json(assignments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch completed orders" });
  }
};

// Get all pending orders
export const getPendingOrders = async (req, res) => {
  try {
    const assignments = await DeliveryAssignment.find({ status: "Pending" });
    res.status(200).json(assignments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch pending orders" });
  }
};

// Export reports functionality (placeholder)
export const exportReports = async (req, res) => {
  res
    .status(501)
    .json({ message: "Export functionality is not yet implemented." });
};
