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
    enum: ["BankSlip", "Cash"],
    required: true,
  },
  bankSlipUrl: { type: String, default: null },
  status: {
    type: String,
    enum: ["Pending", "Completed", "Failed"],
    default: "Pending",
  },
  notes: { type: String },
  paymentDate: { type: Date, default: Date.now },
});

const ItemPayment = mongoose.model("ItemPayment", paymentSchema);

export default ItemPayment;
