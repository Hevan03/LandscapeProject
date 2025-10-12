// models/rentalOrderModel.js
import mongoose from "mongoose";

const rentalOrderSchema = new mongoose.Schema({
  machine: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Machinery",
    required: true,
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  duration: {
    type: Number,
    required: true,
    min: 1,
  },
  penaltyPerDay: {
    type: Number,
    required: false,
    min: 0,
    default: 0,
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  rentedAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["Pending", "Active", "Returned"],
    default: "Pending",
  },
});

const RentalOrder = mongoose.model("RentalOrder", rentalOrderSchema);
export default RentalOrder;
