import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },
  amount: { type: Number, required: true },
  method: {
    type: String,
    enum: ["BankSlip", "Cash", "Stripe"],
    required: true,
  },
  bankSlipUrl: { type: String, default: null },
  status: {
    type: String,
    enum: ["pending", "completed", "failed", "refunded"],
    default: "pending",
  },
  notes: { type: String },
  paymentDate: { type: Date, default: Date.now },
  transactionId: {
    type: String,
  },
});

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
