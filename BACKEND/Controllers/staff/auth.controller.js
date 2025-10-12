import bcrypt from "bcryptjs";
import User from "../../Models/staff/User.js";
import staff from "../../Models/staff/Employee_Service.js";
import Driver from "../../Models/delivery/driverModel.js";
import Landscaper from "../../Models/landscape/landscaperModel.js";
import MaintenanceWorker from "../../Models/customer/MaintenanceModel.js";
import { generateToken } from "../../utils/jwt.js";
import { hashPassword } from "../../utils/authAndNotify.js";
import Customer from "../../Models/customer/customerModel.js";

// ---------------- LOGIN ----------------
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    let user;
    let role = "user";
    user = await staff.findOne({ email: new RegExp(`^${email}$`, "i") });
    if (user) {
      if (user.role === "ManagementEmployee") {
        role = "management";
      } else role = "staff";
    } else {
      user = await Driver.findOne({ email: new RegExp(`^${email}$`, "i") });
      if (user) {
        role = "driver";
      } else {
        user = await Landscaper.findOne({ email: new RegExp(`^${email}$`, "i") });
        if (user) {
          role = "landscaper";
        } else {
          user = await MaintenanceWorker.findOne({ email: new RegExp(`^${email}$`, "i") });
          if (user) {
            role = "maintenance";
          } else {
            user = await Customer.findOne({ email: new RegExp(`^${email}$`, "i") });
            if (user) {
              role = "customer";
            }
          }
        }
      }
    }

    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    if (!user.passwordHash) {
      return res.status(400).json({ message: "No password set for this account." });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    const token = generateToken({
      id: user._id,
      serviceNum: user.serviceNum,
      role,
    });

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.Employee_Name || user.name || user.username || user.customerName,
        serviceNum: user.serviceNum,
        role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
    console.error("Login error:", error);
  }
};

// ---------------- GET PROFILE ----------------
export const getProfile = async (req, res) => {
  try {
    const { id, role } = req.user;
    let user = null;

    switch (role) {
      case "driver":
        user = await Driver.findById(id).select("-passwordHash");
        break;
      case "landscaper":
        user = await Landscaper.findById(id).select("-passwordHash");
        break;
      case "management":
        break;
      default:
        user = await User.findById(id).select("-passwordHash");
    }

    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Error fetching profile", error: error.message });
  }
};

// ---------------- UPDATE PROFILE PICTURE ----------------
export const updateProfilePicture = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No image file provided." });

    const { id, role } = req.user;
    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    const updateData = { Employee_Image: imageUrl };

    let updatedUser = null;

    switch (role) {
      case "driver":
        updatedUser = await Driver.findByIdAndUpdate(id, updateData, {
          new: true,
        }).select("-passwordHash");
        break;
      case "landscaper":
        updatedUser = await Landscaper.findByIdAndUpdate(id, updateData, {
          new: true,
        }).select("-passwordHash");
        break;
      default:
        updatedUser = await User.findByIdAndUpdate(id, updateData, {
          new: true,
        }).select("-passwordHash");
    }

    if (!updatedUser) return res.status(404).json({ message: "User not found." });

    res.status(200).json({
      message: "Profile picture updated successfully!",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating profile picture",
      error: error.message,
    });
  }
};
