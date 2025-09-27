import Order from '../Models/orderModel.js';
import { Cart } from '../Models/cartModel.js';
import Item from '../Models/itemModel.js'; 
import mongoose from 'mongoose';

// Create a new order from a customer's cart
export async function createOrder(req, res) {
  const { sessionId, customerId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(customerId)) {
    return res.status(400).json({ message: "Invalid customer ID provided." });
  }

  try {
    // 1. Find the cart
    const cart = await Cart.findOne({ sessionId });

    if (!cart || cart.items.length === 0) {
      return res.status(404).json({ message: "Cart not found or is empty." });
    }

    // 2️. Check stock for each item BEFORE creating order
    for (const cartItem of cart.items) {
      const dbItem = await Item.findById(cartItem.itemId);
      if (!dbItem) {
        return res
          .status(404)
          .json({ message: `Item with id ${cartItem.itemId} not found.` });
      }

      if (dbItem.quantity < cartItem.quantity) {
        return res
          .status(400)
          .json({ message: `Not enough stock for ${dbItem.itemname}` });
      }
    }

    // 3. Calculate total
    const totalAmount = cart.items.reduce(
      (sum, item) => sum + item.totalPrice,
      0
    );

    // 4. Create order
    const newOrder = new Order({
      customerId,
      items: cart.items,
      totalAmount,
      status: "Pending",
    });

    await newOrder.save();

    // 5. Reduce stock for each item
    for (const cartItem of cart.items) {
      await Item.findByIdAndUpdate(
        cartItem.itemId,
        { $inc: { quantity: -cartItem.quantity } }, // decrement by purchased quantity
        { new: true }
      );
    }

    // 6. Clear cart
    await Cart.deleteOne({ sessionId });

    res
      .status(201)
      .json({ message: "Order created successfully!", order: newOrder });
  } catch (err) {
    console.error("Error creating order:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Get all orders for a specific customer
export async function getCustomerOrders(req, res) {
    const { customerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(customerId)) {
        return res.status(400).json({ message: "Invalid customer ID provided." });
    }

    try {
        // Find orders by customerId and use .populate() to get the customer's name
        const orders = await Order.find({ customerId })
            .populate('customerId', 'name') // 'customerId' is the field to populate, 'name' is the field to retrieve
            .sort({ orderDate: -1 });
        
        res.status(200).json(orders);
    } catch (err) {
        console.error("Error fetching customer orders:", err);
        res.status(500).json({ message: "Internal server error" });
    }
}

// Get all shop orders (for inventory manager)
export async function getAllOrders(req, res) {
  try {
    const orders = await Order.find()
      .populate("customerId", "name")
      .sort({ orderDate: -1 });

    res.status(200).json(orders);
  } catch (err) {
    console.error("Error fetching all orders:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Delete an order by ID
export async function deleteOrder(req, res) {
  const { orderId } = req.params;

  try {
    const deletedOrder = await Order.findByIdAndDelete(orderId);
    if (!deletedOrder) {
      return res.status(404).json({ message: "Order not found." });
    }

    // Refund stock
    for (const item of deletedOrder.items) {
      await Item.findByIdAndUpdate(
        item.itemId,
        { $inc: { quantity: item.quantity } }, // add back stock
        { new: true }
      );
    }

    res
      .status(200)
      .json({ message: "Order cancelled & refunded.", order: deletedOrder });
  } catch (err) {
    console.error("Error deleting order:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Update order status (Shop orders)
export async function updateOrderStatus(req, res) {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!["Pending", "Completed", "Cancelled"].includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
    }

    try {
        const order = await Order.findByIdAndUpdate(
            orderId,
            { status },
            { new: true }
        ).populate("customerId", "name");

        if (!order) return res.status(404).json({ message: "Order not found" });

        res.status(200).json(order);
    } catch (err) {
        console.error("Error updating order status:", err);
        res.status(500).json({ message: "Internal server error" });
    }
}