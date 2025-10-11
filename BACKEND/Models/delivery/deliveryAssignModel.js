import mongoose from "mongoose";

const deliveryAssignSchema = mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Order", // Crucial for populate
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Driver",
    },
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Vehicle",
    },
    assignedDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      required: true,
      enum: ["Assigned", "In Transit", "Delivered"],
      default: "Assigned",
    },
  },
  { timestamps: true }
);

export default mongoose.model("DeliveryAssignment", deliveryAssignSchema);
