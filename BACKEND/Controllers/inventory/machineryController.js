import Machinery from "../../Models/inventory/machineryModel.js";

// Add a new machine with images
export const addMachine = async (req, res) => {
  try {
    const { name, category, description, rentalPricePerDay, defaultDurationDays, penaltyPerDay, quantity } = req.body;

    // Get the array of image URLs from the uploaded files
    const imageUrls = req.files.map((file) => `/uploads/${file.filename}`);

    const newMachine = new Machinery({
      name,
      category,
      description,
      rentalPricePerDay,
      defaultDurationDays,
      penaltyPerDay,
      imageUrl: imageUrls,
      quantity,
    });

    const savedMachine = await newMachine.save();
    res.status(201).json({
      message: "Machine added successfully!",
      machine: savedMachine,
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      const errors = Object.values(err.errors).map((el) => el.message);
      return res.status(400).json({
        error: "Validation failed",
        details: errors.join(", "),
      });
    }
    res.status(500).json({
      error: "Failed to add machine",
      details: err.message,
    });
  }
};

// Display all machines
export const getAllMachines = async (req, res) => {
  try {
    const machines = await Machinery.find();
    res.status(200).json(machines);
  } catch (err) {
    res.status(500).json({
      error: "Failed to retrieve machines",
      details: err.message,
    });
  }
};

// Update a machine by ID
export const updateMachine = async (req, res) => {
  try {
    const updatedMachine = await Machinery.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedMachine) {
      return res.status(404).json({
        error: "Machine not found",
      });
    }
    res.status(200).json({
      message: "Machine updated successfully!",
      machine: updatedMachine,
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      const errors = Object.values(err.errors).map((el) => el.message);
      return res.status(400).json({
        error: "Validation failed",
        details: errors.join(", "),
      });
    }
    res.status(400).json({
      error: "Failed to update machine",
      details: err.message,
    });
  }
};

// Delete a machine by ID
export const deleteMachine = async (req, res) => {
  try {
    const deletedMachine = await Machinery.findByIdAndDelete(req.params.id);
    if (!deletedMachine) {
      return res.status(404).json({
        error: "Machine not found",
      });
    }
    res.status(200).json({
      message: "Machine deleted successfully!",
      machine: deletedMachine,
    });
  } catch (err) {
    res.status(500).json({
      error: "Failed to delete machine",
      details: err.message,
    });
  }
};
