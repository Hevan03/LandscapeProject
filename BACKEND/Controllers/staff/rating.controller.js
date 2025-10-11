import User from "../../Models/staff/User.js";
import Employee_Service from "../../Models/staff/Employee_Service.js";
import Driver from "../../Models/delivery/driverModel.js";
import Landscaper from "../../Models/landscape/landscaperModel.js";
import Customer from "../../Models/customer/customerModel.js";
import MaintenanceWorker from "../../Models/customer/MaintenanceModel.js"; // <-- Add this import

// Add rating
export const rateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { rating } = req.body; // rating = 1–5

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    // Check all possible models for the user, matching login controller logic
    let user = null;
    let userModel = null;

    // Check Staff/Employee model
    user = await Employee_Service.findById(userId);
    if (user) userModel = Employee_Service;

    // Check Driver model if not found
    if (!user) {
      user = await Driver.findById(userId);
      if (user) userModel = Driver;
    }

    // Check Landscaper model if not found
    if (!user) {
      user = await Landscaper.findById(userId);
      if (user) userModel = Landscaper;
    }

    // Check MaintenanceWorker model if not found
    if (!user) {
      user = await MaintenanceWorker.findById(userId);
      if (user) userModel = MaintenanceWorker;
    }

    // Check Customer model if not found
    if (!user) {
      user = await Customer.findById(userId);
      if (user) userModel = Customer;
    }

    if (!user) return res.status(404).json({ message: "User not found" });

    // Update average rating
    const totalRating = (user.rating || 0) * (user.ratingCount || 0) + rating;
    user.ratingCount = (user.ratingCount || 0) + 1;
    user.rating = totalRating / user.ratingCount;

    await user.save();

    res.status(200).json({ message: "Rating added successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Error rating user", error: error.message });
  }
};

// Add rating (public endpoint - no authentication required)
export const rateUserPublic = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("Public rating request for userId:", userId);
    const { rating, comment, clientName } = req.body; // rating = 1–5

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    // Check all possible models for the user
    let user = null;
    let userModel = null;
    let role = null;

    // Check Staff/Employee model
    user = await Employee_Service.findById(userId);
    if (user) {
      userModel = Employee_Service;
      role = "staff";
    }
    console.log("User found in Employee_Service:", !!user);

    // Check Driver model if not found
    if (!user) {
      user = await Driver.findById(userId);
      if (user) {
        userModel = Driver;
        role = "driver";
      }
    }
    console.log("User found in Driver:", !!user);

    // Check Landscaper model if not found
    if (!user) {
      user = await Landscaper.findById(userId);
      if (user) {
        userModel = Landscaper;
        role = "landscaper";
      }
    }
    console.log("User found in Landscaper:", !!user);

    // Check MaintenanceWorker model if not found
    if (!user) {
      user = await MaintenanceWorker.findById(userId);
      if (user) {
        userModel = MaintenanceWorker;
        role = "maintenance";
      }
    }

    if (!user) return res.status(404).json({ message: "User not found" });

    // Update average rating
    const totalRating = (user.rating || 0) * (user.ratingCount || 0) + rating;
    user.ratingCount = (user.ratingCount || 0) + 1;
    user.rating = totalRating / user.ratingCount;

    // Add the rating to the user's ratings array if it exists
    if (!user.ratings) user.ratings = [];

    user.ratings.push({
      rating,
      comment,
      clientName,
      createdAt: new Date(),
    });

    await user.save();

    if (comment) {
      console.log(`Comment: ${comment}`);
    }

    res.status(200).json({ message: "Rating added successfully", user });
  } catch (error) {
    console.error("Error in public rating endpoint:", error);
    res.status(500).json({ message: "Error rating user", error: error.message });
  }
};

export const getUsersByRating = async (req, res) => {
  try {
    const { role } = req.query; // optional filter by role: employee, driver, landscaper

    let query = {};
    if (role) query.role = role;

    const users = await User.find(query).sort({ rating: -1, ratingCount: -1 });

    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: "Error fetching ratings", error: error.message });
  }
};

export const getLandscaperGrades = async (req, res) => {
  try {
    const landscapers = await User.find({ role: "landscaper" }).sort({
      rating: -1,
      ratingCount: -1,
    });

    const graded = landscapers.map((u, idx) => {
      let grade = "C"; // default lowest grade
      if (idx < 3) grade = "A";
      else if (idx < 6) grade = "B";
      else if (idx < 9) grade = "C";
      else grade = "D"; // extend as needed

      return {
        id: u._id,
        name: u.username,
        rating: u.rating.toFixed(2),
        grade,
      };
    });

    res.status(200).json({ landscapers: graded });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching landscaper grades",
      error: error.message,
    });
  }
};

export const getEmployeeRatings = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check all possible models for the user
    let user = null;

    // Check Staff/Employee model
    user = await Employee_Service.findById(userId);

    // Check Driver model if not found
    if (!user) {
      user = await Driver.findById(userId);
    }

    // Check Landscaper model if not found
    if (!user) {
      user = await Landscaper.findById(userId);
    }

    // Check MaintenanceWorker model if not found
    if (!user) {
      user = await MaintenanceWorker.findById(userId);
    }

    if (!user) return res.status(404).json({ message: "Employee not found" });

    // Return the ratings array if it exists
    const ratings = user.ratings || [];

    res.status(200).json(ratings);
  } catch (error) {
    res.status(500).json({ message: "Error fetching employee ratings", error: error.message });
  }
};
