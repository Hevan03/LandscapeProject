import AppointmentModel from "../../Models/landscape/appointmentModel.js";
import mongoose from "mongoose";

// Note: The multer configuration has been removed from this file.

// CREATE a new appointment
export async function createAppointment(req, res) {
  try {
    const { customer, landscaper, appointmentDate, timeSlot, contactNumber, customerAddress, siteAddress, siteLocation, siteArea } = req.body;

    // req.files is populated by the middleware in the route file
    const siteImages = req.files?.siteImages?.map((file) => file.path) || [];
    const sitePlan = req.files?.sitePlan?.[0]?.path || "";

    const newAppointment = new AppointmentModel({
      customer,
      landscaper,
      appointmentDate,
      timeSlot,
      contactNumber,
      customerAddress: JSON.parse(customerAddress),
      siteAddress: JSON.parse(siteAddress),
      siteLocation: JSON.parse(siteLocation),
      siteArea,
      siteImages,
      sitePlan,
    });

    await newAppointment.save();
    res.status(201).json({
      message: "Appointment booked successfully!",
      data: newAppointment,
    });
  } catch (error) {
    console.error("Error creating appointment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// GET all appointments
export async function getAllAppointments(req, res) {
  try {
    const appointments = await AppointmentModel.find({}).populate("customer", "name").populate("landscaper", "name").sort({ createdAt: -1 });
    res.status(200).json(appointments);
  } catch (error) {
    console.error("Error creating appointment:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
}

// GET appointments for a specific customer
export async function getAppointmentsForCustomer(req, res) {
  const { customerId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(customerId)) {
    return res.status(400).json({ message: "Invalid Customer ID" });
  }
  try {
    const appointments = await AppointmentModel.find({ customer: customerId }).populate("landscaper", "name contact").sort({ appointmentDate: -1 });
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch appointments" });
  }
}

// GET appointments for a specific landscaper
export async function getAppointmentsForLandscaper(req, res) {
  const { landscaperId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(landscaperId)) {
    return res.status(400).json({ message: "Invalid Landscaper ID" });
  }
  try {
    const appointments = await AppointmentModel.find({
      landscaper: landscaperId,
    })
      .populate("customer", "name email")
      .sort({ appointmentDate: -1 });
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch appointments" });
  }
}

// GET a single appointment by ID
export async function getAppointmentById(req, res) {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid ID" });
  }
  try {
    const appointment = await AppointmentModel.findById(id).populate("customer").populate("landscaper");
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });
    res.status(200).json(appointment);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch appointment" });
  }
}

// UPDATE an existing appointment
export async function updateAppointment(req, res) {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid ID" });
  }
  try {
    let updateData = { ...req.body };

    // Handle potential new file uploads
    if (req.files?.siteImages) updateData.siteImages = req.files.siteImages.map((f) => f.path);
    if (req.files?.sitePlan) updateData.sitePlan = req.files.sitePlan[0].path;

    // Parse JSON strings from form-data if they exist
    if (updateData.customerAddress) updateData.customerAddress = JSON.parse(updateData.customerAddress);
    if (updateData.siteAddress) updateData.siteAddress = JSON.parse(updateData.siteAddress);
    if (updateData.siteLocation) updateData.siteLocation = JSON.parse(updateData.siteLocation);

    const updated = await AppointmentModel.findByIdAndUpdate(id, { $set: updateData }, { new: true });
    if (!updated) return res.status(404).json({ message: "Appointment not found" });
    res.status(200).json({ message: "Appointment updated successfully", data: updated });
  } catch (error) {
    res.status(500).json({ message: "Error updating appointment" });
  }
}

// UPDATE an appointment's status
export async function updateAppointmentStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid ID" });
  }
  try {
    const updated = await AppointmentModel.findByIdAndUpdate(id, { status: status }, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ message: "Appointment not found" });
    res.status(200).json({ message: "Status updated successfully", data: updated });
  } catch (error) {
    res.status(500).json({ message: "Failed to update status" });
  }
}

// DELETE an appointment
export async function deleteAppointment(req, res) {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid ID" });
  }
  try {
    const deleted = await AppointmentModel.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Appointment not found" });
    res.status(200).json({ message: "Appointment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting appointment" });
  }
}
