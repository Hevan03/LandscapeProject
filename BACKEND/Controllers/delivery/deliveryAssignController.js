import DeliveryAssignment from "../../Models/delivery/deliveryAssignModel.js";
import { Parser } from "json2csv";
import Driver from "../../Models/delivery/driverModel.js";
import Vehicle from "../../Models/delivery/vehicleModel.js";
import Order from "../../Models/payment/orderModel.js";

let Notification = null;

// Try to import Notification model
try {
  Notification = (await import("../../Models/landscape/notificationModel.js")).default;
  console.log("Notification model imported successfully in deliveryAssignController");
} catch (error) {
  console.error("Error importing Notification model:", error);
}

// Create a new delivery assignment
export const createDeliveryAssignment = async (req, res) => {
  try {
    const { driverId, vehicleId, orderId } = req.body;

    const driver = await Driver.findById(driverId);
    const vehicle = await Vehicle.findById(vehicleId);
    const order = await Order.findById(orderId);

    if (!driver || !vehicle || !order) {
      return res.status(404).json({ message: "Driver, Vehicle, or Order not found." });
    }

    if (driver.driveravailability !== "Available") {
      return res.status(400).json({ message: "Driver is not available for assignment." });
    }

    if (vehicle.status !== "Available") {
      return res.status(400).json({ message: "Vehicle is not available for assignment." });
    }

    const allowUnpaid = process.env.ALLOW_UNPAID_ASSIGNMENTS === "true" || req.body.allowUnpaid === true;
    if (!allowUnpaid) {
      if (order.paymentStatus !== "paid" || order.status !== "Paid") {
        return res.status(400).json({ message: "Order must be paid before assignment." });
      }
    }

    const newAssignment = new DeliveryAssignment({
      orderId,
      driverId,
      vehicleId,
      status: "Assigned",
    });
    await newAssignment.save();

    await Driver.findByIdAndUpdate(driverId, { driveravailability: "Assigned" });
    await Vehicle.findByIdAndUpdate(vehicleId, { status: "In Use" });

    await Order.findByIdAndUpdate(orderId, {
      status: "Assigned",
      assignedDriver: driverId,
      assignedVehicle: vehicleId,
      deliveryAssignment: newAssignment._id,
      deliveryAssignedDate: new Date(),
    });

    if (Notification) {
      try {
        await Notification.create({
          type: "delivery_assigned",
          audience: "customer",
          orderId: orderId,
          customerId: order.customerId?.toString?.() || String(order.customerId),
          message: `Your order #${orderId.toString().slice(-6)} has been scheduled for delivery. Vehicle: ${vehicle.vehicleNo}.`,
        });
        console.log("Delivery assignment notification created successfully");
      } catch (notifError) {
        console.error("Error creating delivery assignment notification:", notifError);
      }
    }

    res.status(201).json({
      message: "Delivery assignment created successfully",
      assignment: newAssignment,
    });
  } catch (error) {
    console.error("Error in createDeliveryAssignment:", error);
    res.status(500).json({
      message: "Something went wrong on the server.",
      error: error.message,
    });
  }
};

// Export delivery assignments as CSV
export const exportDeliveryAssignmentsCsv = async (req, res) => {
  try {
    const assignments = await DeliveryAssignment.find().populate("driverId").populate("vehicleId").populate("orderId");

    const rows = assignments.map((a) => ({
      assignmentId: a._id?.toString() || "",
      orderId: a.orderId?._id?.toString() || "",
      driverName: a.driverId?.name || "",
      driverContact: a.driverId?.phone || "",
      vehicleNo: a.vehicleId?.vehicleNo || "",
      status: a.status || "",
      assignedDate: a.assignedDate ? new Date(a.assignedDate).toISOString() : "",
      deliveryAssignedDate: a.orderId?.deliveryAssignedDate ? new Date(a.orderId.deliveryAssignedDate).toISOString() : "",
      orderStatus: a.orderId?.status || "",
      paymentStatus: a.orderId?.paymentStatus || "",
      totalAmount: a.orderId?.totalAmount ?? "",
    }));

    const fields = [
      "assignmentId",
      "orderId",
      "driverName",
      "driverContact",
      "vehicleNo",
      "status",
      "assignedDate",
      "deliveryAssignedDate",
      "orderStatus",
      "paymentStatus",
      "totalAmount",
    ];
    const parser = new Parser({ fields });
    const csv = parser.parse(rows);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="delivery-report.csv"');
    res.status(200).send(csv);
  } catch (error) {
    console.error("CSV export failed:", error);
    res.status(500).json({ message: "Failed to generate report", error: error.message });
  }
};

// Get orders in Pending status (no assignment yet)
export const getPendingOrders = async (req, res) => {
  try {
    const query = {
      status: "Pending",
      $or: [{ assignedDriver: null }, { assignedDriver: { $exists: false } }],
    };
    const pendingOrders = await Order.find(query).sort({ createdAt: -1 });
    res.status(200).json(pendingOrders);
  } catch (error) {
    console.error("Error fetching pending orders:", error);
    res.status(500).json({ message: "Error fetching pending orders", error: error.message });
  }
};

// Get all delivery assignments
export const getAllDeliveryAssignments = async (req, res) => {
  try {
    const assignments = await DeliveryAssignment.find().populate("driverId").populate("vehicleId").populate("orderId");
    res.status(200).json(assignments);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong.", error: error.message });
  }
};

// Get a delivery assignment by ID
export const getDeliveryAssignmentById = async (req, res) => {
  try {
    const assignment = await DeliveryAssignment.findById(req.params.id).populate("driverId").populate("vehicleId");
    if (!assignment) return res.status(404).json({ message: "Delivery assignment not found." });
    res.status(200).json(assignment);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong.", error: error.message });
  }
};

// Update a delivery assignment
export const updateDeliveryAssignment = async (req, res) => {
  try {
    const { status } = req.body;
    const assignment = await DeliveryAssignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ message: "Delivery assignment not found." });

    // Apply updates
    if (status) assignment.status = status;
    const updatedAssignment = await assignment.save();

    // Reflect status to related entities
    try {
      const order = await Order.findById(updatedAssignment.orderId);
      if (order) {
        if (status === "Assigned") {
          order.status = "Assigned";
        } else if (status === "In Transit") {
          order.status = "In Transit";
        } else if (status === "Delivered") {
          order.status = "Delivered";
        }
        await order.save();
      }

      // Free up driver and vehicle after delivery is completed
      if (status === "Delivered") {
        if (updatedAssignment.driverId) await Driver.findByIdAndUpdate(updatedAssignment.driverId, { driveravailability: "Available" });
        if (updatedAssignment.vehicleId) await Vehicle.findByIdAndUpdate(updatedAssignment.vehicleId, { status: "Available" });
      }

      // Send notification to customer on status change
      if (Notification && order && status) {
        try {
          const notifType =
            status === "Assigned"
              ? "delivery_assigned"
              : status === "In Transit"
              ? "delivery_in_transit"
              : status === "Delivered"
              ? "delivery_completed"
              : "delivery_updated";

          await Notification.create({
            type: notifType,
            audience: "customer",
            orderId: order._id,
            customerId: order.customerId?.toString?.() || String(order.customerId),
            message:
              status === "Assigned"
                ? `Your order #${order._id.toString().slice(-6)} has been assigned for delivery.`
                : status === "In Transit"
                ? `Your order #${order._id.toString().slice(-6)} is now in transit.`
                : status === "Delivered"
                ? `Your order #${order._id.toString().slice(-6)} has been delivered.`
                : `Delivery status for order #${order._id.toString().slice(-6)} updated to ${status}.`,
          });
        } catch (nErr) {
          console.warn("Failed to create delivery status notification:", nErr.message);
        }
      }
    } catch (e) {
      console.warn("Failed to update related entities for delivery assignment:", e.message);
    }

    res.status(200).json(updatedAssignment);
  } catch (error) {
    res.status(400).json({ message: "Invalid data provided.", error: error.message });
  }
};

// Delete a delivery assignment
export const deleteDeliveryAssignment = async (req, res) => {
  try {
    const deletedAssignment = await DeliveryAssignment.findByIdAndDelete(req.params.id);
    if (!deletedAssignment) return res.status(404).json({ message: "Delivery assignment not found." });
    res.status(200).json({ message: "Delivery assignment deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong.", error: error.message });
  }
};

// Get paid orders that need delivery assignment
export const getPaidOrders = async (req, res) => {
  try {
    const query = {
      paymentStatus: "paid",
      status: "Paid",
      $or: [{ assignedDriver: null }, { assignedDriver: { $exists: false } }],
    };
    const paidOrders = await Order.find(query).populate("customerId", "name").sort({ createdAt: -1 });
    res.status(200).json(paidOrders);
  } catch (error) {
    console.error("Error fetching paid orders:", error);
    res.status(500).json({ message: "Error fetching paid orders", error: error.message });
  }
};

// Get available drivers for assignment
export const getAvailableDrivers = async (req, res) => {
  try {
    const availableDrivers = await Driver.find({ driveravailability: "Available" });
    res.status(200).json(availableDrivers);
  } catch (error) {
    console.error("Error fetching available drivers:", error);
    res.status(500).json({ message: "Something went wrong.", error: error.message });
  }
};

// Get available vehicles for assignment
export const getAvailableVehicles = async (req, res) => {
  try {
    const availableVehicles = await Vehicle.find({ status: "Available" });
    res.status(200).json(availableVehicles);
  } catch (error) {
    console.error("Error fetching available vehicles:", error);
    res.status(500).json({ message: "Something went wrong.", error: error.message });
  }
};

// Get deliveries assigned to a specific driver
export const getDriverDeliveries = async (req, res) => {
  try {
    const { driverId } = req.params;
    const deliveries = await DeliveryAssignment.find({ driverId })
      .populate({
        path: "orderId",
        populate: { path: "customerId", select: "name" },
      })
      .populate("driverId", "name")
      .populate("vehicleId", "vehicleNo")
      .sort({ assignedDate: -1 });
    res.status(200).json(deliveries);
  } catch (error) {
    console.error("Error fetching driver deliveries:", error);
    res.status(500).json({ message: "Something went wrong.", error: error.message });
  }
};
