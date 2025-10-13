import Order from "../../Models/payment/orderModel.js";
import Item from "../../Models/inventory/itemModel.js";

// Get pending orders
export const getPendingOrders = async (req, res) => {
  try {
    const orders = await Order.find({ status: "Pending" });
    res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch pending orders" });
  }
};

// Get all orders
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("customerId", "name email") // ✅ Add this line
      .populate("assignedDriver", "username")
      .populate("assignedVehicle", "vehicleNo")
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};


// Create a new order manually
export const createOrder = async (req, res) => {
  try {
    const { customerId, items, totalAmount, readyForAssignment = false } = req.body;
    console.log("Creating order with data:", req.body);

    if (!customerId || !items || !Array.isArray(items) || items.length === 0 || !totalAmount) {
      return res.status(400).json({ message: "Missing required fields: customerId, items, totalAmount" });
    }

    // Reserve stock immediately by deducting inventory per item
    const deducted = [];
    try {
      for (const it of items) {
        const updated = await Item.findOneAndUpdate(
          { _id: it.itemId, quantity: { $gte: it.quantity } },
          { $inc: { quantity: -it.quantity } },
          { new: true }
        );
        if (!updated) {
          throw new Error(`Insufficient stock for item ${it.itemName || it.itemId}`);
        }
        deducted.push({ id: it.itemId, qty: it.quantity });
      }
    } catch (e) {
      // rollback partial deductions
      for (const d of deducted) {
        try {
          await Item.findByIdAndUpdate(d.id, { $inc: { quantity: d.qty } });
        } catch {}
      }
      return res.status(409).json({ message: "Insufficient stock for one or more items", error: e.message });
    }

    const orderData = {
      customerId,
      items,
      totalAmount,
      status: readyForAssignment ? "Paid" : "Pending",
      paymentStatus: readyForAssignment ? "paid" : "unpaid",
      stockReserved: true,
    };

    const newOrder = new Order(orderData);
    await newOrder.save();

    res.status(201).json({
      message: "Order created successfully",
      order: newOrder,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Failed to create order", error: error.message });
  }
};

// Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["Pending", "Paid", "Assigned", "In Transit", "Delivered"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updatedOrder = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      message: "Order status updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Failed to update order status", error: error.message });
  }
};

// Assign driver and vehicle to order
export const assignDelivery = async (req, res) => {
  try {
    const { driverId, vehicleId } = req.body;

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      {
        assignedDriver: driverId,
        assignedVehicle: vehicleId,
        status: "Assigned",
        deliveryAssignedDate: new Date(),
      },
      { new: true, runValidators: true }
    )
      .populate("assignedDriver", "username")
      .populate("assignedVehicle", "vehicleNo");

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      message: "Delivery assigned successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Failed to assign delivery", error: error.message });
  }
};

// Get orders by status
export const getOrdersByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const orders = await Order.find({ status })
      .populate("assignedDriver", "username")
      .populate("assignedVehicle", "vehicleNo")
      .sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch orders", error: error.message });
  }
};

// Get order statistics for dashboard
export const getOrderStats = async (req, res) => {
  try {
    const stats = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const formattedStats = {
      pending: 0,
      assigned: 0,
      inTransit: 0,
      delivered: 0,
      total: 0,
    };

    stats.forEach((stat) => {
      const status = stat._id.toLowerCase().replace(" ", "");
      formattedStats[status] = stat.count;
      formattedStats.total += stat.count;
    });

    res.status(200).json(formattedStats);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch order statistics",
      error: error.message,
    });
  }
};

// Get order by ID
// Get orders by customer ID
export const getOrdersByCustomerId = async (req, res) => {
  try {
    const customerId = req.params.customerId;
    const orders = await Order.find({ customerId })
      .populate("assignedDriver", "username")
      .populate("assignedVehicle", "vehicleNo")
      .sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch orders by customer", error: error.message });
  }
};

// Cancel a shop order and restock items
export const cancelOrderAndRestock = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.status !== "Pending") {
      return res.status(400).json({ message: "Only pending orders can be cancelled" });
    }

    // Restock each item quantity only if stock was reserved earlier
    if (order.stockReserved) {
      for (const it of order.items) {
        try {
          await Item.findByIdAndUpdate(it.itemId, { $inc: { quantity: it.quantity } });
        } catch (e) {
          console.warn("Failed to restock item", it.itemId, e.message);
        }
      }
    }

    // Delete the order after restocking
    await Order.findByIdAndDelete(orderId);

    return res.status(200).json({ message: "Order cancelled & items restocked (if reserved)." });
  } catch (error) {
    console.error("Error cancelling order:", error);
    res.status(500).json({ message: "Failed to cancel order", error: error.message });
  }
};
