const mongoose = require('mongoose');

const accidentReportSchema = mongoose.Schema({
  driverId: { type: String, required: true }, // Changed to String to match frontend
  vehicleNo: { type: String, required: true }, // Changed from vehicleId to vehicleNo
  deliveryId: { type: String, required: false }, // Changed to String and made optional
  description: { type: String, required: true },
  photos: [{ 
    name: { type: String },
    url: { type: String }
  }], // Changed from single photo to array of photos
  time: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ["Reported", "Under Investigation", "Resolved"],
    default: "Reported"
  }
}, { timestamps: true });

module.exports = mongoose.model("AccidentReport", accidentReportSchema);