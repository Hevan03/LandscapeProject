import progressModel from "../../Models/landscape/progressModel.js";
import landscapeModel from "../../Models/landscape/landscapeModel.js";
import mongoose from "mongoose";

//Get all progress posts
export async function getAllProgress(req, res) {
  try {
    const progresses = await progressModel
      .find()
      .sort({ createdAt: -1 })
      .populate("landscapeId", "name")
      .populate("landscaperId", "name")
      .populate("customerId", "name");

    res.status(200).json(progresses);
  } catch (error) {
    console.error("Error fetching progress posts:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

//Get s progress post by ID
export async function getProgressById(req, res) {
  try {
    const progress = await progressModel
      .findById(req.params.id)
      .populate("landscapeId", "name")
      .populate("landscaperId", "name")
      .populate("customerId", "name");
    if (!progress) {
      return res.status(404).json({ message: "Progress post not found" });
    }
    res.json(progress);
  } catch (error) {
    console.error("Error fetching progress post by ID:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

//Create a new progress post
export async function createProgress(req, res) {
  try {
    const { landscapeId, name, description, tasks } = req.body;

    const project = await landscapeModel
      .findById(landscapeId)
      .select("customerId landscaperId");
    if (!landscapeId) {
      return res.status(404).json({ message: "landscape not found" });
    }

    // Parse tasks string into JSON array
    // input: '"name":"Levelling Ground","completed":false'
    let parsedTasks = [];
    if (tasks) {
      parsedTasks = JSON.parse(tasks);
    }

    //Handle uploaded images from Multer
    const images = req.files.map((file) => file.path);

    const newProgress = new progressModel({
      landscapeId,
      customerId: project.customerId, // auto from project
      landscaperId: project.landscaperId, // auto from project
      name,
      description,
      tasks: parsedTasks,
      images,
    });

    await newProgress.save();
    res.status(201).json({ message: "Progress post created successfully" });
  } catch (error) {
    console.error("Error creating progress post:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Update a progress post
export async function updateProgress(req, res) {
  try {
    const { name, description, tasks } = req.body;

    let updateData = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (tasks) updateData.tasks = JSON.parse(tasks);

    // replace existing images
    if (req.files && req.files.length > 0) {
      updateData.images = req.files.map((file) => file.path);
    }

    const updatedProgress = await progressModel
      .findByIdAndUpdate(req.params.id, updateData, {
        new: true,
        runValidators: true,
      })
      .populate("landscapeId", "name")
      .populate("landscaperId", "name")
      .populate("customerId", "name");

    if (!updatedProgress) {
      return res.status(404).json({ message: "Progress post not found" });
    }

    res.status(200).json({
      message: "Progress post updated successfully",
      updatedProgress,
    });
  } catch (error) {
    console.error("Error updating progress post:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

//Delete a progress post
export async function deleteProgress(req, res) {
  try {
    const deletedProgress = await progressModel.findByIdAndDelete(
      req.params.id
    );
    if (!deletedProgress) {
      return res.status(404).json({ message: "Progress post not found" });
    }
    res.status(200).json({ message: "Progress post deleted successfully" });
  } catch (error) {
    console.error("Error deleting progress post:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

//get progress posts for the relative logged-in customer
export async function getProgressForCustomer(req, res) {
  try {
    const { customerId } = req.params;

    const progresses = await progressModel
      .find({ customerId })
      .sort({ createdAt: -1 })
      .populate("landscapeId", "name")
      .populate("landscaperId", "name");

    res.status(200).json(progresses);
  } catch (error) {
    console.error("Error fetching customer progress posts:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

//get progress posts for the relative logged-in landscaper
export async function getProgressForLandscaper(req, res) {
  try {
    const { landscaperId } = req.params;

    const progresses = await progressModel
      .find({ landscaperId })
      .sort({ createdAt: -1 })
      .populate("landscapeId", "name")
      .populate("landscaperId", "name")
      .populate("customerId", "name");

    res.status(200).json(progresses);
  } catch (error) {
    console.error("Error fetching landscaper progress posts:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getProgressForLandscape(req, res) {
  const { landscapeId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(landscapeId)) {
    return res.status(400).json({ message: "Invalid Landscape Project ID" });
  }

  try {
    const posts = await progressModel
      .find({ landscapeId: landscapeId })
      .sort({ createdAt: -1 })
      .populate("landscaperId", "name")
      // --- THIS IS THE FIX ---
      // Add this line to also fetch the landscape project's name
      .populate("landscapeId", "name");
    // --- END OF FIX ---

    res.status(200).json(posts);
  } catch (error) {
    console.error("Error fetching progress for landscape:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
