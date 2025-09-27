// controllers/rating.controller.js
import User from "../models/User.js";

// Add rating
export const rateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { rating } = req.body; // rating = 1–5

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // update average rating
    const totalRating = user.rating * user.ratingCount + rating;
    user.ratingCount += 1;
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
    const { rating, comment, raterName } = req.body; // rating = 1–5

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    if (!raterName || raterName.trim() === '') {
      return res.status(400).json({ message: "Rater name is required" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // update average rating
    const totalRating = user.rating * user.ratingCount + rating;
    user.ratingCount += 1;
    user.rating = totalRating / user.ratingCount;

    await user.save();

    console.log(`Public rating added: ${raterName} rated ${user.username} with ${rating} stars`);
    if (comment) {
      console.log(`Comment: ${comment}`);
    }

    res.status(200).json({ message: "Rating added successfully", user });
  } catch (error) {
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
    const landscapers = await User.find({ role: "landscaper" })
      .sort({ rating: -1, ratingCount: -1 });

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
    res.status(500).json({ message: "Error fetching landscaper grades", error: error.message });
  }
};