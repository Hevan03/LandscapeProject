import Payment from "../../Models/payment/paymentModel.js";
import Order from "../../Models/payment/orderModel.js";
import Notification from "../../Models/landscape/notificationModel.js";
import AppointmentModel from "../../Models/landscape/appointmentModel.js";
import Stripe from "stripe";
import dotenv from "dotenv";
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create a new payment
export const createPayment = async (req, res) => {
  try {
    const newPayment = new Payment(req.body);
    await newPayment.save();
    res.status(201).json(newPayment);
  } catch (error) {
    res.status(400).json({ message: "Invalid data provided.", error: error.message });
  }
};

// Get all payments
export const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find();
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong.", error: error.message });
  }
};

// Get a payment by ID
export const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found." });
    }
    res.status(200).json(payment);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong.", error: error.message });
  }
};

// Update a payment
export const updatePayment = async (req, res) => {
  try {
    const updatedPayment = await Payment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updatedPayment) {
      return res.status(404).json({ message: "Payment not found." });
    }
    res.status(200).json(updatedPayment);
  } catch (error) {
    res.status(400).json({ message: "Invalid data provided.", error: error.message });
  }
};

// Delete a payment
export const deletePayment = async (req, res) => {
  try {
    const deletedPayment = await Payment.findByIdAndDelete(req.params.id);
    if (!deletedPayment) {
      return res.status(404).json({ message: "Payment not found." });
    }
    res.status(200).json({ message: "Payment deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong.", error: error.message });
  }
};

// Create inventory payment (integration point)
export const createInventoryPayment = async (req, res) => {
  try {
    const { orderId, customerId, amount, method, bankSlipUrl, notes } = req.body;

    // Create payment record
    const newPayment = new Payment({
      orderId,
      customerId,
      amount,
      method,
      bankSlipUrl,
      notes,
    });

    await newPayment.save();

    // Update order status
    await Order.findByIdAndUpdate(orderId, {
      paymentStatus: "paid",
      status: "Paid",
      paymentId: newPayment._id,
    });

    // Create notification for admin
    await Notification.create({
      type: "payment_received",
      orderId,
      customerId,
      message: `New payment received for Order #${orderId.toString().slice(-6)} - Amount: LKR ${amount.toLocaleString()}`,
    });

    res.status(201).json({
      message: "Payment created successfully",
      payment: newPayment,
    });
  } catch (error) {
    res.status(400).json({ message: "Error creating payment", error: error.message });
  }
};

// Get order details for payment
export const getOrderForPayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId).populate("customerId", "name");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: "Error fetching order", error: error.message });
  }
};

// Get all notifications
export const getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Error fetching notifications", error: error.message });
  }
};

// Mark notification as read
export const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const notification = await Notification.findByIdAndUpdate(notificationId, { isRead: true }, { new: true });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json({ message: "Notification marked as read", notification });
  } catch (error) {
    res.status(500).json({ message: "Error updating notification", error: error.message });
  }
};

// Create payment intent for Stripe
export const createPaymentIntent = async (req, res) => {
  try {
    console.log("Request body for payment intent:", req.body);
    const { amount, orderId, orderType, userId } = req.body;

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid payment amount" });
    }

    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // Convert to cents
      currency: "usd",
      metadata: {
        orderId,
        orderType,
        userId,
      },
    });

    //need to save in Payment model
    const payment = new Payment({
      customerId: userId,
      orderType,
      orderId: orderId,
      amount: Math.round(amount),
      method: "Stripe",
      orderId,
      orderType,
      status: "pending",
      transactionId: paymentIntent.id,
    });

    await payment.save();

    res.status(200).json({
      message: "Payment intent created successfully",
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    res.status(500).json({ message: "Failed to create payment intent", error: error.message });
  }
};

// Confirm payment after Stripe payment is successful
export const confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId, orderId, orderType, paymentMethod } = req.body;

    // Create payment record
    const payment = new Payment({
      amount: 0, // Will be updated from order
      paymentMethod,
      userId: req.user.id,
      orderId,
      orderType,
      status: "completed",
      transactionId: paymentIntentId,
    });

    // Update order status based on order type
    if (orderType === "appointment") {
      const appointment = await AppointmentModel.findById(orderId);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }

      appointment.paymentStatus = "paid";
      appointment.status = "confirmed";
      payment.amount = appointment.amount || 0;

      await appointment.save();
    } else if (orderType === "order") {
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      order.paymentStatus = "paid";
      order.status = "processing";
      payment.amount = order.total || 0;

      await order.save();
    }

    await payment.save();

    res.status(200).json({
      message: "Payment confirmed successfully",
      paymentId: payment._id,
    });
  } catch (error) {
    console.error("Error confirming payment:", error);
    res.status(500).json({ message: "Failed to confirm payment", error: error.message });
  }
};

// Process bank slip upload
export const processBankSlip = async (req, res) => {
  try {
    //need to extact from form data
    const { amount, orderId, customerId, orderType, referenceNumber } = req.body;

    console.log("Received bank slip data:", req.body, req.file);
    const bankSlip = req.file ? req.file.path : null;

    if (!bankSlip) {
      return res.status(400).json({ message: "Bank slip is required" });
    }

    // Create payment record with pending status
    const payment = new Payment({
      amount: parseFloat(amount),
      method: "BankSlip",
      customerId: customerId,
      orderId,
      status: "pending",
      transactionId: referenceNumber,
      bankSlipUrl: bankSlip,
    });

    // Update order status based on order type
    if (orderType === "appointment") {
      const appointment = await AppointmentModel.findById(orderId);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }

      appointment.paymentStatus = "pending";
      await appointment.save();
    } else if (orderType === "order") {
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      order.paymentStatus = "pending";
      await order.save();
    }

    await payment.save();

    res.status(200).json({
      message: "Bank slip uploaded successfully. Payment is pending verification.",
      paymentId: payment._id,
    });
  } catch (error) {
    console.error("Error processing bank slip:", error);
    res.status(500).json({ message: "Failed to process bank slip", error: error.message });
  }
};
