import mongoose from "mongoose";
const accidentReportSchema = mongoose.Schema(
  {
    driverId: { type: String, required: true }, // Matches frontend
    vehicleNo: { type: String, required: true }, // Vehicle number as string
    deliveryId: { type: String, required: false }, // Optional delivery reference
    description: { type: String, required: true },
    location: { type: String, required: true },
    photos: [
      {
        name: { type: String },
        url: { type: String },
      },
    ], // Array of photos
    time: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["Reported", "Under Investigation", "Resolved"],
      default: "Reported",
    },
  },
  { timestamps: true }
);

export default mongoose.model("AccidentReport", accidentReportSchema);
