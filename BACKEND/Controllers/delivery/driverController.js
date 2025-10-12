import Driver from "../../Models/delivery/driverModel.js";
import { hashPassword } from "../../utils/authAndNotify.js";

// Create a new driver
export const createDriver = async (req, res) => {
  try {
    const { name, email, contact, licenseNo, password, availability } = req.body;
    if (!name || !email || !contact || !licenseNo || !password) {
      return res.status(400).json({ success: false, message: "All fields required." });
    }
    const exists = await Driver.findOne({ email });
    if (exists) {
      return res.status(400).json({ success: false, message: "Email already exists." });
    }
    const passwordHash = await hashPassword(password);
    const driver = new Driver({
      name,
      email,
      phone: contact,
      licenseNo,
      passwordHash,
      driveravailability: availability,
    });
    await driver.save();
  } catch (error) {
    // Duplicate license number check
    if (error.code === 11000 && error.keyPattern?.licenseNo) {
      return res.status(400).json({
        message: "A driver with this license number already exists. Please use a unique license number.",
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all drivers
export const getAllDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find();
    res.status(200).json(drivers);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong.", error: error.message });
  }
};

// Get a driver by ID
export const getDriverById = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) {
      return res.status(404).json({ message: "Driver not found." });
    }
    res.status(200).json(driver);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong.", error: error.message });
  }
};

// Update a driver
export const updateDriver = async (req, res) => {
  try {
    const payload = { ...req.body };
    // Map potential legacy fields
    if (payload.contact && !payload.phone) payload.phone = payload.contact;
    if (payload.availability && !payload.driveravailability) payload.driveravailability = payload.availability;

    delete payload.contact;
    delete payload.availability;
    const updatedDriver = await Driver.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
    if (!updatedDriver) {
      return res.status(404).json({ message: "Driver not found." + error });
    }
    res.status(200).json(updatedDriver);
  } catch (error) {
    res.status(400).json({ message: "Invalid data provided.", error: error.message });
  }
};

// Delete a driver
export const deleteDriver = async (req, res) => {
  try {
    const deletedDriver = await Driver.findByIdAndDelete(req.params.id);
    if (!deletedDriver) {
      return res.status(404).json({ message: "Driver not found." });
    }
    res.status(200).json({ message: "Driver deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong.", error: error.message });
  }
};

// Get available drivers
export const getAvailableDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find({ driveravailability: "Available" });
    res.status(200).json(drivers);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch available drivers" });
  }
};
