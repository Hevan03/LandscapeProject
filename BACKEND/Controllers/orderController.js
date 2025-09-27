const Order = require("../Models/orderModel");

const getPendingOrders = async (req, res) => {
  try {
    const orders = await Order.find({ status: "Pending" });
    res.status(200).json(orders);
  } catch (error) {
    console.error(error); 
    res.status(500).json({ message: "Failed to fetch pending orders" });
  }
};

// Get all orders
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('assignedDriver', 'username')
      .populate('assignedVehicle', 'vehicleNo')
      .sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    console.error(error); 
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

// Create a new order manually
const createOrder = async (req, res) => {
  try {
    const { readyForAssignment = false } = req.body;

    const orderData = {
      customerId: req.body.customerId || "manual_order_" + Date.now(),
      items: req.body.items,
      totalAmount: req.body.totalAmount,
      status: readyForAssignment ? "Paid" : "Pending",
      paymentStatus: readyForAssignment ? "paid" : "unpaid"
    };

    const newOrder = new Order(orderData);
    await newOrder.save();

    res.status(201).json({
      message: "Order created successfully",
      order: newOrder
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Failed to create order", error: error.message });
  }
};

// Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["Pending", "Paid", "Assigned", "In Transit", "Delivered"];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      message: "Order status updated successfully",
      order: updatedOrder
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Failed to update order status", error: error.message });
  }
};

// Assign driver and vehicle to order
const assignDelivery = async (req, res) => {
  try {
    const { driverId, vehicleId } = req.body;
    
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { 
        assignedDriver: driverId,
        assignedVehicle: vehicleId,
        status: "Assigned",
        deliveryAssignedDate: new Date()
      },
      { new: true, runValidators: true }
    ).populate('assignedDriver', 'username')
     .populate('assignedVehicle', 'vehicleNo');

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      message: "Delivery assigned successfully",
      order: updatedOrder
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Failed to assign delivery", error: error.message });
  }
};

// Get orders by status
const getOrdersByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const orders = await Order.find({ status })
      .populate('assignedDriver', 'username')
      .populate('assignedVehicle', 'vehicleNo')
      .sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch orders", error: error.message });
  }
};

// Get order statistics for dashboard
const getOrderStats = async (req, res) => {
  try {
    const stats = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    const formattedStats = {
      pending: 0,
      assigned: 0,
      inTransit: 0,
      delivered: 0,
      total: 0
    };

    stats.forEach(stat => {
      const status = stat._id.toLowerCase().replace(' ', '');
      formattedStats[status] = stat.count;
      formattedStats.total += stat.count;
    });

    res.status(200).json(formattedStats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch order statistics", error: error.message });
  }
};

module.exports = { 
  getPendingOrders,
  getAllOrders,
  createOrder,
  updateOrderStatus,
  assignDelivery,
  getOrdersByStatus,
  getOrderStats
};