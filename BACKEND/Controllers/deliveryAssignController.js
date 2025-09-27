const DeliveryAssignment = require("../Models/deliveryAssignModel");
const { Parser } = require('json2csv');
const Driver = require("../Models/driverModel");
const Vehicle = require("../Models/vehicleModel");
const Order = require("../Models/orderModel");
let Notification; // For notifications

// Try to import Notification model
try {
    Notification = require("../Models/notificationModel");
    console.log("Notification model imported successfully in deliveryAssignController");
} catch (error) {
    console.error("Error importing Notification model:", error);
    Notification = null;
}

// Create a new delivery assignment
const createDeliveryAssignment = async (req, res) => {
    try {
        const { driverId, vehicleId, orderId } = req.body;

        // Check if the driver and vehicle exist
        const driver = await Driver.findById(driverId);
        const vehicle = await Vehicle.findById(vehicleId);
        const order = await Order.findById(orderId);

        if (!driver || !vehicle || !order) {
            return res.status(404).json({ message: "Driver, Vehicle, or Order not found." });
        }

        // Check if driver and vehicle are available
        if (driver.availability !== "Available") {
            return res.status(400).json({ message: "Driver is not available for assignment." });
        }

        if (vehicle.status !== "Available") {
            return res.status(400).json({ message: "Vehicle is not available for assignment." });
        }

        // Check if order is paid (allow override for demos)
        const allowUnpaid = process.env.ALLOW_UNPAID_ASSIGNMENTS === 'true' || req.body.allowUnpaid === true;
        if (!allowUnpaid) {
            if (order.paymentStatus !== "paid" || order.status !== "Paid") {
                return res.status(400).json({ message: "Order must be paid before assignment." });
            }
        }

        const newAssignment = new DeliveryAssignment({
            orderId,
            driverId,
            vehicleId,
            status: "Assigned"
        });
        await newAssignment.save();

        // Update driver and vehicle status
        await Driver.findByIdAndUpdate(driverId, { availability: "Assigned" });
        await Vehicle.findByIdAndUpdate(vehicleId, { status: "In Use" });
        
        // Update the order with assignment details
        await Order.findByIdAndUpdate(orderId, { 
            status: "Assigned",
            assignedDriver: driverId,
            assignedVehicle: vehicleId,
            deliveryAssignment: newAssignment._id,
            deliveryAssignedDate: new Date()
        });

        // Create notification for the assigned driver
        if (Notification) {
            try {
                await Notification.create({
                    type: 'delivery_assigned',
                    orderId: orderId,
                    customerId: driverId, // Use driver's ID as recipient now that separate login is removed
                    message: `New delivery assigned: Order #${orderId.toString().slice(-6)} - Vehicle: ${vehicle.vehicleNo}`
                });
                console.log('Delivery assignment notification created successfully');
            } catch (notifError) {
                console.error('Error creating delivery assignment notification:', notifError);
            }
        }

        res.status(201).json({
            message: "Delivery assignment created successfully",
            assignment: newAssignment
        });
    } catch (error) {
        console.error("Error in createDeliveryAssignment:", error);
        res.status(500).json({ message: "Something went wrong on the server.", error: error.message });
    }
};

// Export delivery assignments as CSV
const exportDeliveryAssignmentsCsv = async (req, res) => {
    try {
        const assignments = await DeliveryAssignment.find()
            .populate('driverId')
            .populate('vehicleId')
            .populate('orderId');

        const rows = assignments.map((a) => ({
            assignmentId: a._id?.toString() || '',
            orderId: a.orderId?._id?.toString() || '',
            driverName: a.driverId?.name || '',
            driverContact: a.driverId?.contact || '',
            vehicleNo: a.vehicleId?.vehicleNo || '',
            status: a.status || '',
            assignedDate: a.assignedDate ? new Date(a.assignedDate).toISOString() : '',
            deliveryAssignedDate: a.orderId?.deliveryAssignedDate ? new Date(a.orderId.deliveryAssignedDate).toISOString() : '',
            orderStatus: a.orderId?.status || '',
            paymentStatus: a.orderId?.paymentStatus || '',
            totalAmount: a.orderId?.totalAmount ?? ''
        }));

        const fields = [
            'assignmentId','orderId','driverName','driverContact','vehicleNo','status','assignedDate','deliveryAssignedDate','orderStatus','paymentStatus','totalAmount'
        ];
        const parser = new Parser({ fields });
        const csv = parser.parse(rows);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="delivery-report.csv"');
        res.status(200).send(csv);
    } catch (error) {
        console.error('CSV export failed:', error);
        res.status(500).json({ message: 'Failed to generate report', error: error.message });
    }
};

// Get orders in Pending status (no assignment yet) — for quick demo without payments
const getPendingOrders = async (req, res) => {
    try {
        const query = {
            status: "Pending",
            $or: [
                { assignedDriver: null },
                { assignedDriver: { $exists: false } }
            ]
        };

        // Keep it robust: avoid populate to prevent missing model issues
        const pendingOrders = await Order.find(query).sort({ createdAt: -1 });

        res.status(200).json(pendingOrders);
    } catch (error) {
        console.error("Error fetching pending orders:", error);
        res.status(500).json({ message: "Error fetching pending orders", error: error.message });
    }
};

// Get all delivery assignments
const getAllDeliveryAssignments = async (req, res) => {
    try {
        const assignments = await DeliveryAssignment.find().populate('driverId').populate('vehicleId');
        res.status(200).json(assignments);
    } catch (error) {
        res.status(500).json({ message: "Something went wrong.", error: error.message });
    }
};

// Get a delivery assignment by ID
const getDeliveryAssignmentById = async (req, res) => {
    try {
        const assignment = await DeliveryAssignment.findById(req.params.id).populate('driverId').populate('vehicleId');
        if (!assignment) {
            return res.status(404).json({ message: "Delivery assignment not found." });
        }
        res.status(200).json(assignment);
    } catch (error) {
        res.status(500).json({ message: "Something went wrong.", error: error.message });
    }
};

// Update a delivery assignment
const updateDeliveryAssignment = async (req, res) => {
    try {
        const updatedAssignment = await DeliveryAssignment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updatedAssignment) {
            return res.status(404).json({ message: "Delivery assignment not found." });
        }
        res.status(200).json(updatedAssignment);
    } catch (error) {
        res.status(400).json({ message: "Invalid data provided.", error: error.message });
    }
};

// Delete a delivery assignment
const deleteDeliveryAssignment = async (req, res) => {
    try {
        const deletedAssignment = await DeliveryAssignment.findByIdAndDelete(req.params.id);
        if (!deletedAssignment) {
            return res.status(404).json({ message: "Delivery assignment not found." });
        }
        res.status(200).json({ message: "Delivery assignment deleted successfully." });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong.", error: error.message });
    }
};

// Get paid orders that need delivery assignment
const getPaidOrders = async (req, res) => {
    try {
        const query = {
            paymentStatus: "paid",
            status: "Paid",
            $or: [
                { assignedDriver: null },
                { assignedDriver: { $exists: false } }
            ]
        };
        const paidOrders = await Order.find(query).sort({ createdAt: -1 });
        res.status(200).json(paidOrders);
    } catch (error) {
        console.error("Error fetching paid orders:", error);
        res.status(500).json({ message: "Error fetching paid orders", error: error.message });
    }
};

// Get available drivers for assignment
const getAvailableDrivers = async (req, res) => {
    try {
        const availableDrivers = await Driver.find({ availability: "Available" });
        res.status(200).json(availableDrivers);
    } catch (error) {
        console.error("Error fetching available drivers:", error);
        res.status(500).json({ message: "Something went wrong.", error: error.message });
    }
};

// Get available vehicles for assignment
const getAvailableVehicles = async (req, res) => {
    try {
        const availableVehicles = await Vehicle.find({ status: "Available" });
        res.status(200).json(availableVehicles);
    } catch (error) {
        console.error("Error fetching available vehicles:", error);
        res.status(500).json({ message: "Something went wrong.", error: error.message });
    }
};

// Get deliveries assigned to a specific driver
const getDriverDeliveries = async (req, res) => {
    try {
        const { driverId } = req.params;
        
        const deliveries = await DeliveryAssignment.find({ driverId })
            .populate('orderId')
            .populate('vehicleId')
            .sort({ assignedDate: -1 });
            
        res.status(200).json(deliveries);
    } catch (error) {
        console.error("Error fetching driver deliveries:", error);
        res.status(500).json({ message: "Something went wrong.", error: error.message });
    }
};

module.exports = { 
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
    exportDeliveryAssignmentsCsv
};