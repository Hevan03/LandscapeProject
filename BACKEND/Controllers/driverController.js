const Driver = require("../Models/driverModel");

// Create a new driver
const createDriver = async (req, res) => {
  try {
    const newDriver = new Driver(req.body);
    await newDriver.save();
    res.status(201).json(newDriver);
  } catch (error) {
    // Check for MongoDB duplicate key error (error code 11000)
    if (error.code === 11000 && error.keyPattern.licenseNo) {
      return res.status(400).json({ message: "A driver with this license number already exists. Please use a unique license number." });
    }
    // Handle other validation errors
    res.status(400).json({ message: "Invalid data provided.", error: error.message });
  }
};

// Get all drivers
const getAllDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find();
    res.status(200).json(drivers);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong.", error: error.message });
  }
};

// Get a driver by ID
const getDriverById = async (req, res) => {
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
const updateDriver = async (req, res) => {
  try {
    const updatedDriver = await Driver.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updatedDriver) {
      return res.status(404).json({ message: "Driver not found." });
    }
    res.status(200).json(updatedDriver);
  } catch (error) {
    res.status(400).json({ message: "Invalid data provided.", error: error.message });
  }
};

// Delete a driver
const deleteDriver = async (req, res) => {
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



const getAvailableDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find({ availability: "Available" });
    res.status(200).json(drivers);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch available drivers" });
  }
};

module.exports = {
  createDriver,
  getAllDrivers,
  getDriverById,
  updateDriver,
  deleteDriver,
  getAvailableDrivers
};