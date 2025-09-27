import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Driver from "../models/Driver.js";
import Landscaper from "../models/Landscaper.js";
import ManagementEmployee from "../models/ManagementEmployee.js";
import { generateToken } from "../utils/jwt.js";

// ---------------- LOGIN ----------------
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        let user = await User.findOne({ email }) ||
                   await Driver.findOne({ email }) ||
                   await Landscaper.findOne({ email }) ||
                   await ManagementEmployee.findOne({ email });

        if (!user) return res.status(400).json({ message: "Invalid email or password" });

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

        // Determine role dynamically
        let role = user.role || (user.constructor.modelName === "Driver" ? "driver" :
                                user.constructor.modelName === "Landscaper" ? "landscaper" :
                                user.constructor.modelName === "ManagementEmployee" ? "management" :
                                "user");

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
                serviceNum: user.serviceNum,
                role,
            },
        });

    } catch (error) {
        res.status(500).json({ message: "Login failed", error: error.message });
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
                user = await ManagementEmployee.findById(id).select("-passwordHash");
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
                updatedUser = await Driver.findByIdAndUpdate(id, updateData, { new: true }).select("-passwordHash");
                break;
            case "landscaper":
                updatedUser = await Landscaper.findByIdAndUpdate(id, updateData, { new: true }).select("-passwordHash");
                break;
            case "management":
                updatedUser = await ManagementEmployee.findByIdAndUpdate(id, updateData, { new: true }).select("-passwordHash");
                break;
            default:
                updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true }).select("-passwordHash");
        }

        if (!updatedUser) return res.status(404).json({ message: "User not found." });

        res.status(200).json({
            message: "Profile picture updated successfully!",
            user: updatedUser,
        });

    } catch (error) {
        res.status(500).json({ message: "Error updating profile picture", error: error.message });
    }
};
