import mongoose from "mongoose";
const { Schema } = mongoose;

const addressSchema = new Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  district: { type: String, required: true },
}, { _id: false });

const locationSchema = new Schema({
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
}, { _id: false });

const appointmentSchema = new Schema(
  {
    customer: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
    landscaper: { type: Schema.Types.ObjectId, ref: "Landscaper", required: true },
    appointmentDate: { type: Date, required: true },
    timeSlot: { type: String, required: true },
    contactNumber: { type: String, required: true },
    customerAddress: addressSchema,
    siteAddress: addressSchema,
    siteLocation: locationSchema,
    siteArea: { type: String }, // e.g., "1500 sq ft"
    siteImages: [{ type: String }], // Paths to uploaded images
    sitePlan: { type: String }, // Path to a single uploaded plan
    status: {
      type: String,
      enum: ["Payment Pending", "Confirmed", "In Progress", "Completed", "Cancelled"],
      default: "Payment Pending",
    },
  },
  { timestamps: true }
);

const AppointmentModel = mongoose.model("Appointment", appointmentSchema);
export default AppointmentModel;