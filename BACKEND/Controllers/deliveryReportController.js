const DeliveryAssignment = require("../Models/deliveryAssignModel");
const { startOfMonth, endOfMonth } = require('date-fns');

// New function to get all delivery assignments
exports.getAllDeliveryReports = async (req, res) => {
  try {
    const reports = await DeliveryAssignment.find();
    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong.", error: error.message });
  }
};

// Aggregate and filter data for reports
exports.getMonthlyDeliveryReports = async (req, res) => {
  try {
    const { year, month } = req.query;
    if (!year || !month) {
      return res.status(400).json({ message: "Please provide both year and month (e.g., ?year=2025&month=1)." });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const reports = await DeliveryAssignment.find({
      createdAt: {
        $gte: startDate,
        $lte: endDate
      }
    });

    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong.", error: error.message });
  }
};

// Get deliveries by a specific driver
exports.getDeliveriesByDriver = async (req, res) => {
  try {
    const { driverId } = req.params;
    const deliveries = await DeliveryAssignment.find({ driverId: driverId });
    res.status(200).json(deliveries);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong.", error: error.message });
  }
};

// Get deliveries by a specific vehicle
exports.getDeliveriesByVehicle = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const deliveries = await DeliveryAssignment.find({ vehicleId: vehicleId });
    res.status(200).json(deliveries);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong.", error: error.message });
  }
};

// Get all completed orders
exports.getCompletedOrders = async (req, res) => {
    try {
        const assignments = await DeliveryAssignment.find({ status: "Delivered" });
        res.status(200).json(assignments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch completed orders" });
    }
};

// Export reports functionality
exports.getPendingOrders = async (req, res) => {
    try {
        const assignments = await DeliveryAssignment.find({ status: "Pending" });
        res.status(200).json(assignments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch pending orders" });
    }
};

// Optional: Add export functionality (e.g., CSV/PDF)
exports.exportReports = async (req, res) => {
  // This is a placeholder for a more complex implementation.
  // You would need a library like 'csv-stringify' or 'pdfkit' here.
  res.status(501).json({ message: "Export functionality is not yet implemented." });
};