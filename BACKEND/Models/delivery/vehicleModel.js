import mongoose from "mongoose";

const vehicleSchema = mongoose.Schema({
  vehicleNo: { type: String, required: true, unique: true },
  type: { type: String, required: true }, // Van, Truck, 3-Wheeler
  status: {
    type: String,
    enum: ["Available", "In Use", "Under Maintenance"],
    default: "Available",
  },
  maintenanceLogs: [
    {
      date: { type: Date, default: Date.now },
      description: { type: String, required: true },
      cost: { type: Number, required: true },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Vehicle", vehicleSchema);
