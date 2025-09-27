const mongoose = require('mongoose');

const driverSchema = mongoose.Schema({
  name: { type: String, required: true },
  contact: { type: String, required: true, match: [/^\d{10}$/, "Contact number must be exactly 10 digits"] },
  licenseNo: { type: String, required: true, unique: true },
  availability: {
    type: String,
    enum: ["Available", "Assigned", "On Leave"],
    default: "Available"
  },
  history: [
    {
      deliveryId: { type: mongoose.Schema.Types.ObjectId, ref: "DeliveryAssignment" },
      status: { type: String }, // e.g., Completed, Cancelled
      date: { type: Date }
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Driver", driverSchema);