import landscapeModel from "../../Models/customer/landscapeModel,js";

// Get all landscapes
export async function getAllLandscapes(req, res) {
  try {
    const landscapes = await landscapeModel
      .find()
      .sort({ createdAt: -1 })
      .populate("customerId", "name")
      .populate("landscaperId", "name");
    res.status(200).json(landscapes);
  } catch (error) {
    console.error("Error fetching landscapes:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Get single landscape by ID
export async function getLandscapeById(req, res) {
  try {
    const landscape = await landscapeModel
      .findById(req.params.id)
      .populate("customerId", "name")
      .populate("landscaperId", "name");
    if (!landscape)
      return res.status(404).json({ message: "Landscape not found" });
    res.json(landscape);
  } catch (error) {
    console.error("Error fetching landscape by ID:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Create new landscape
export async function createLandscape(req, res) {
  try {
    const { name, description, customerId, landscaperId, status } = req.body;

    const newLandscape = new landscapeModel({
      name,
      description,
      customerId,
      landscaperId,
      status, //defaults to "Pending" if not provided
    });

    await newLandscape.save();
    res
      .status(201)
      .json({ message: "Landscape created successfully", newLandscape });
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

    if (!updatedLandscape)
      return res.status(404).json({ message: "Landscape not found" });
    res
      .status(200)
      .json({ message: "Landscape updated successfully", updatedLandscape });
  } catch (error) {
    console.error("Error updating landscape:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Delete landscape
export async function deleteLandscape(req, res) {
  try {
    const deletedLandscape = await landscapeModel.findByIdAndDelete(
      req.params.id
    );
    if (!deletedLandscape)
      return res.status(404).json({ message: "Landscape not found" });
    res.status(200).json({ message: "Landscape deleted successfully" });
  } catch (error) {
    console.error("Error deleting landscape:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
