import landscapeModel from "../../Models/landscape/landscapeModel.js";
import Order from "../../Models/payment/orderModel.js";
import mongoose from "mongoose";

// Get all landscapes
export async function getAllLandscapes(req, res) {
  try {
    const landscapes = await landscapeModel.find().sort({ createdAt: -1 }).populate("customerId", "name").populate("landscaperId", "name");
    res.status(200).json(landscapes);
  } catch (error) {
    console.error("Error fetching landscapes:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Get single landscape by ID
export async function getLandscapeById(req, res) {
  try {
    const landscape = await landscapeModel.findById(req.params.id).populate("customerId", "name").populate("landscaperId", "name");
    if (!landscape) return res.status(404).json({ message: "Landscape not found" });
    res.json(landscape);
  } catch (error) {
    console.error("Error fetching landscape by ID:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Create new landscape
export async function createLandscape(req, res) {
  try {
    const { name, description, customerId, landscaperId, status, totalCost } = req.body;

    const projectImages = req.files?.projectImages?.map((file) => file.path) || [];
    const sitePlan = req.files?.sitePlan?.[0]?.path || "";
    const quotation = req.files?.quotation?.[0]?.path || "";

    const newLandscape = new landscapeModel({
      name,
      description,
      customerId,
      landscaperId,
      status,
      totalCost,
      projectImages,
      sitePlan,
      quotation,
    });

    await newLandscape.save();
    res.status(201).json({ message: "Landscape created successfully", newLandscape });
  } catch (error) {
    console.error("Error creating landscape:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Update landscape
export async function updateLandscape(req, res) {
  try {
    const { name, description, customerId, landscaperId, status } = req.body;

    const updatedLandscape = await landscapeModel.findByIdAndUpdate(
      req.params.id,
      { name, description, customerId, landscaperId, status },
      { new: true, runValidators: true }
    );

    if (!updatedLandscape) return res.status(404).json({ message: "Landscape not found" });
    res.status(200).json({ message: "Landscape updated successfully", updatedLandscape });
  } catch (error) {
    console.error("Error updating landscape:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Delete landscape
export async function deleteLandscape(req, res) {
  try {
    const deletedLandscape = await landscapeModel.findByIdAndDelete(req.params.id);
    if (!deletedLandscape) return res.status(404).json({ message: "Landscape not found" });
    res.status(200).json({ message: "Landscape deleted successfully" });
  } catch (error) {
    console.error("Error deleting landscape:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * Fetches all landscape projects for a specific landscaper.
 */
export async function getLandscapesForLandscaper(req, res) {
  try {
    const landscaperId = req.params.landscaperId;
    const landscapes = await landscapeModel.find({ landscaperId });
    res.json(landscapes);

    // if (!mongoose.Types.ObjectId.isValid(landscaperId)) {
    //   return res.status(400).json({ message: "Invalid Landscaper ID" });
    // }

    //
    //   const landscapes = await landscapeModel
    //     .find({ landscaperId: landscaperId }) // Find projects matching the ID
    //     .sort({ createdAt: -1 })
    //     .populate("customerId", "name"); // We only need the customer's name

    //   res.status(200).json(landscapes);
  } catch (error) {
    console.error("Error fetching landscaper's projects:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getLandscapesForCustomer(req, res) {
  const { customerId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(customerId)) {
    return res.status(400).json({ message: "Invalid Customer ID" });
  }

  try {
    const landscapes = await landscapeModel
      .find({ customerId: customerId }) // Find projects matching the customer ID
      .sort({ createdAt: -1 })
      .populate("landscaperId", "name"); // Populate the landscaper's name for the UI

    res.status(200).json(landscapes);
  } catch (error) {
    console.error("Error fetching customer's projects:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// --- Blueprint Functions from the plan ---

// Called by the customer to request a blueprint
export async function requestBlueprint(req, res) {
  try {
    const updatedLandscape = await landscapeModel.findByIdAndUpdate(req.params.id, { blueprintRequested: true }, { new: true });
    if (!updatedLandscape) return res.status(404).json({ message: "Landscape not found" });
    res.status(200).json(updatedLandscape);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}

// Called by the landscaper to upload a blueprint
export async function uploadBlueprint(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No blueprint file uploaded." });
    }
    const updatedLandscape = await landscapeModel.findByIdAndUpdate(req.params.id, { blueprintFile: req.file.path }, { new: true });
    if (!updatedLandscape) return res.status(404).json({ message: "Landscape not found" });
    res.status(200).json(updatedLandscape);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}

export const createAdvancePaymentOrder = async (req, res) => {
  const { customerId, projectId, amount } = req.body;
  try {
    const order = new Order({
      customerId,
      projectId,
      amount,
      orderType: "advance",
      status: "Paid",
      paymentStatus: "paid",
      paidAt: new Date(),
    });
    await order.save();
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: "Failed to save advance payment", error: err.message });
  }
};

export const createBalancePaymentOrder = async (req, res) => {
  const { customerId, projectId, amount } = req.body;
  try {
    const order = new Order({
      customerId,
      projectId,
      amount,
      orderType: "balance",
      status: "Paid",
      paymentStatus: "paid",
      paidAt: new Date(),
    });
    await order.save();
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: "Failed to save balance payment", error: err.message });
  }
};

export const updateProjectStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const project = await landscapeModel.findByIdAndUpdate(id, { status }, { new: true });
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: "Error updating status", error: error.message });
  }
};
