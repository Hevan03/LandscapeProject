import Payment from "../../Models/payment/paymentModel.js";
import Order from "../../Models/payment/orderModel.js";
import Item from "../../Models/inventory/itemModel.js";
import Notification from "../../Models/landscape/notificationModel.js";
import AppointmentModel from "../../Models/landscape/appointmentModel.js";
import Stripe from "stripe";
import dotenv from "dotenv";
dotenv.config();

let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
  try {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  } catch (e) {
    console.warn("Stripe init failed:", e.message);
    stripe = null;
  }
} else {
  console.warn("STRIPE_SECRET_KEY not set - Stripe features disabled");
}

// Create a new payment
export const createPayment = async (req, res) => {
  try {
    // Always enforce initial status as pending for customer-submitted payments
    const payload = { ...req.body, status: "pending" };
    const newPayment = new Payment(payload);
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
    const { status } = req.body;
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ message: "Payment not found." });

    // Update status
    payment.status = status || payment.status;
    await payment.save();

    // If admin approves or rejects bank slip, update order and notify customer
    if (status === "completed" || status === "failed" || status === "cancelled") {
      const order = await Order.findById(payment.orderId);
      if (order) {
        const wasPaidBefore = order.paymentStatus === "paid";
        if (status === "completed") {
          order.paymentStatus = "paid";
          order.status = "Paid";
          // Deduct inventory only on transition to paid (avoid double-deduction)
          if (!wasPaidBefore) {
            // If stock already reserved at order creation, skip deduction here
            if (order.stockReserved) {
              await order.save();
              return res.status(200).json(payment);
            }
            const deductedIds = [];
            try {
              for (const it of order.items) {
                const updated = await Item.findOneAndUpdate(
                  { _id: it.itemId, quantity: { $gte: it.quantity } },
                  { $inc: { quantity: -it.quantity } },
                  { new: true }
                );
                if (!updated) {
                  throw new Error(`Insufficient stock for item ${it.itemName || it.itemId}`);
                }
                deductedIds.push({ id: it.itemId, qty: it.quantity });
              }
            } catch (e) {
              // rollback any partial deductions
              for (const d of deductedIds) {
                try {
                  await Item.findByIdAndUpdate(d.id, { $inc: { quantity: d.qty } });
                } catch {}
              }
              // revert payment status change on order
              order.paymentStatus = "unpaid";
              order.status = "Pending";
              await order.save();
              return res.status(409).json({ message: "Inventory deduction failed", error: e.message });
            }
          }
        } else {
          order.paymentStatus = "unpaid";
        }
        await order.save();
      }

      try {
        await Notification.create({
          type: status === "completed" ? "payment_approved" : "payment_rejected",
          audience: "customer",
          orderId: payment.orderId,
          customerId: payment.customerId,
          message:
            status === "completed"
              ? `Your payment for Order #${payment.orderId.toString().slice(-6)} has been approved.`
              : `Your payment for Order #${payment.orderId.toString().slice(-6)} was rejected. Please resubmit or contact support.`,
        });
      } catch (e) {
        console.warn("Failed to create customer payment notification:", e.message);
      }
    }

    res.status(200).json(payment);
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
      status: "pending",
    });

    await newPayment.save();

    // Update order status to pending verification instead of paid
    await Order.findByIdAndUpdate(orderId, {
      paymentStatus: "pending_verification",
      // keep delivery status as-is (default Pending), just attach paymentId for reference
      paymentId: newPayment._id,
    });

    // Create notification for admin indicating verification is required
    await Notification.create({
      type: "payment_pending_verification",
      audience: "admin",
      orderId,
      customerId,
      message: `Bank/inventory payment submitted for Order #${orderId
        .toString()
        .slice(-6)} - Amount: LKR ${amount.toLocaleString()} (Pending verification)`,
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
    const audience = req.query.audience;
    const filter = audience ? { audience } : {};
    const notifications = await Notification.find(filter).sort({ createdAt: -1 });
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
    const { amount, orderId, orderType } = req.body;
    const authUserId = req.user?.id;

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid payment amount" });
    }

    if (!stripe) return res.status(503).json({ message: "Stripe is not configured" });

    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // Convert to cents
      currency: "usd",
      metadata: { orderId, orderType, userId: authUserId || "unknown" },
    });

    // Save or upsert a pending Payment record keyed by transactionId
    const pendingData = {
      customerId: authUserId,
      orderType,
      orderId,
      amount: Math.round(amount),
      method: "Stripe",
      status: "pending",
      transactionId: paymentIntent.id,
    };

    await Payment.findOneAndUpdate({ transactionId: paymentIntent.id }, pendingData, { upsert: true, new: true, setDefaultsOnInsert: true });

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
    // Find existing pending payment by transactionId or orderId
    let payment = await Payment.findOne({ transactionId: paymentIntentId });
    if (!payment) {
      payment = await Payment.findOne({ orderId, method: paymentMethod, status: "pending" });
    }
    if (!payment) {
      // Fallback: create if not found (shouldn't normally happen)
      payment = new Payment({
        amount: 0,
        method: paymentMethod,
        customerId: req.user.id,
        orderId,
        orderType,
        status: "pending",
        transactionId: paymentIntentId,
      });
    }

    // Update order status based on order type
    if (orderType === "appointment") {
      const appointment = await AppointmentModel.findById(orderId);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      // Keep appointment in Payment Pending until admin verifies
      appointment.status = "Payment Pending";
      payment.amount = appointment.amount || 0;

      await appointment.save();
    } else if (orderType === "order") {
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      payment.amount = order.totalAmount || 0;

      // For Stripe, consider payment confirmed -> complete and deduct inventory now
      if (paymentMethod === "Stripe") {
        const alreadyPaid = order.paymentStatus === "paid";
        if (!alreadyPaid) {
          const deducted = [];
          try {
            for (const it of order.items) {
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
            return res.status(409).json({ message: "Inventory deduction failed", error: e.message });
          }
        }

        order.paymentStatus = "paid";
        order.status = "Paid";
        await order.save();
        payment.status = "completed";
      } else {
        // Non-Stripe (e.g., BankSlip): keep pending for admin verification
        order.paymentStatus = "pending_verification";
        await order.save();
        payment.status = "pending";
      }
    }

    await payment.save();

    // Notify admin that verification is required
    try {
      await Notification.create({
        type: "payment_pending_verification",
        audience: "admin",
        orderId,
        customerId: payment.customerId,
        message: `New ${paymentMethod} payment submitted for Order #${orderId.toString().slice(-6)} - Pending verification`,
      });
    } catch (e) {
      console.warn("Failed to create admin payment notification:", e.message);
    }

    res.status(200).json({
      message:
        orderType === "order" && paymentMethod === "Stripe"
          ? "Payment completed successfully"
          : "Payment submitted successfully and is pending verification",
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

    // Upsert or update existing pending bank slip to avoid duplicates
    const payment = await Payment.findOneAndUpdate(
      { orderId, method: "BankSlip", status: "pending" },
      {
        amount: parseFloat(amount),
        method: "BankSlip",
        customerId: customerId,
        orderId,
        status: "pending",
        transactionId: referenceNumber,
        bankSlipUrl: bankSlip,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Update order status based on order type
    if (orderType === "appointment") {
      const appointment = await AppointmentModel.findById(orderId);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      // Keep appointment in Payment Pending state (model has status only)
      appointment.status = "Payment Pending";
      await appointment.save();
    } else if (orderType === "order") {
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Mark order payment status as pending verification
      order.paymentStatus = "pending_verification";
      await order.save();
    }

    await payment.save();

    // Notify admin that a bank slip is pending verification
    try {
      await Notification.create({
        type: "payment_pending_verification",
        audience: "admin",
        orderId,
        customerId: payment.customerId,
        message: `Bank slip uploaded for Order #${orderId.toString().slice(-6)} - Pending verification`,
      });
    } catch (e) {
      console.warn("Failed to create admin payment verification notification:", e.message);
    }

    res.status(200).json({
      message: "Bank slip uploaded successfully. Payment is pending verification.",
      paymentId: payment._id,
    });
  } catch (error) {
    console.error("Error processing bank slip:", error);
    res.status(500).json({ message: "Failed to process bank slip", error: error.message });
  }
};
