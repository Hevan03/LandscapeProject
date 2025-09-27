const mongoose = require("mongoose");

const deliveryAssignSchema = mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Order", // This line is crucial for populating
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

module.exports = mongoose.model("DeliveryAssignment", deliveryAssignSchema);