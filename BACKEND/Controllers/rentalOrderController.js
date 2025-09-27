// controllers/rentalOrderController.js
import RentalOrder from "../Models/rentalOrderModel.js";
import Machinery from "../Models/machineryModel.js";

// Create rental order
export const createRentalOrder = async (req, res) => {
  try {
    const { machineId, customerId, quantity, duration, totalPrice } = req.body;

    if (!customerId) {
      return res.status(400).json({ error: "Customer ID is required" });
    }

    const machine = await Machinery.findById(machineId);
    if (!machine) return res.status(404).json({ error: "Machine not found" });

    if (quantity > machine.quantity) {
      return res.status(400).json({ error: "Not enough stock available" });
    }

    // Reduce available stock
    machine.quantity -= quantity;
    await machine.save();

    const rentalOrder = new RentalOrder({
      machine: machineId,
      customerId, // 👈 include customer
      quantity,
      duration,
      totalPrice
    });

    await rentalOrder.save();
    res.status(201).json(rentalOrder);
  } catch (err) {
    res.status(500).json({ error: "Failed to create rental order", details: err.message });
  }
};


// Get all rental orders
export const getAllRentalOrders = async (req, res) => {
  try {
    const { customerId } = req.query;
    let query = {};
    if (customerId) query.customerId = customerId;

    const orders = await RentalOrder.find(query)
      .populate("machine")
      .populate("customerId");

    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch rental orders", details: err.message });
  }
};

// Cancel a rental order & refund stock
export const deleteRentalOrder = async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await RentalOrder.findByIdAndDelete(orderId).populate("machine");
    if (!order) {
      return res.status(404).json({ message: "Rental order not found." });
    }

    // Refund machine stock
    await Machinery.findByIdAndUpdate(
      order.machine,
      { $inc: { quantity: order.quantity } },
      { new: true }
    );

    res.status(200).json({ message: "Rental order cancelled & refunded.", order });
  } catch (err) {
    console.error("Error cancelling rental order:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update rental order status
export const updateRentalOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  if (!["Pending", "Active", "Returned"].includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  try {
    const order = await RentalOrder.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    ).populate("machine customerId");

    if (!order) return res.status(404).json({ message: "Order not found" });

    res.status(200).json(order);
  } catch (err) {
    console.error("Error updating status:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};





