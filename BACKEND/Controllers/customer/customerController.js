import Customer from "../../Models/customer/customerModel.js";
import Driver from "../../Models/delivery/driverModel.js";
import Employee_Service from "../../Models/staff/Employee_Service.js";
import Landscaper from "../../Models/landscape/landscaperModel.js";
import { hashPassword } from "../../utils/authAndNotify.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Get all customers
export async function getAllCustomers(req, res) {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: { customers },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching customers" });
  }
}

// Create new customer
export async function createCustomer(req, res) {
  try {
    const { name } = req.body;
    const newCustomer = new Customer({ name });

    await newCustomer.save();
    res.status(201).json({ message: "Customer created successfully" });
  } catch (error) {
    console.error("Error creating customer:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Register Customer
export async function registerCustomer(req, res) {
  try {
    const { name, email, phone, password, dateOfBirth, address, referralNumber } = req.body;

    // Check if customer already exists
    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer) {
      return res.status(400).json({
        success: false,
        message: "Customer already exists with this email",
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Handle referral
    let referredBy = null;

    const cleanReferralNumber = referralNumber.startsWith("#") ? referralNumber.slice(1) : referralNumber;

    if (cleanReferralNumber) {
      const referrer = await Customer.findOne({
        registrationNumber: cleanReferralNumber,
      });
      console.log("passed 2");
      if (referrer) {
        referredBy = referrer._id;
        referrer.loyaltyPoints = (referrer.loyaltyPoints || 0) + 100;
        referrer.totalReferrals = (referrer.totalReferrals || 0) + 1;
        await referrer.save();
      }
    }

    // Create new customer
    const newCustomer = new Customer({
      name,
      email,
      phone,
      passwordHash: hashedPassword,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      address,
      referredBy,
    });

    // Save customer
    const savedCustomer = await newCustomer.save();

    // Generate JWT token
    const token = jwt.sign(
      {
        id: savedCustomer._id,
        email: savedCustomer.email,
        role: "customer",
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" }
    );

    // Return success response (exclude password)
    const customerResponse = {
      id: savedCustomer._id,
      registrationNumber: savedCustomer.registrationNumber,
      name: savedCustomer.name,
      email: savedCustomer.email,
      phone: savedCustomer.phone,
      dateOfBirth: savedCustomer.dateOfBirth,
      address: savedCustomer.address,
      status: savedCustomer.status,
      loyaltyLevel: savedCustomer.loyaltyLevel,
      loyaltyPoints: savedCustomer.loyaltyPoints,
      referredBy: savedCustomer.referredBy,
    };

    res.status(201).json({
      success: true,
      message: "Customer registered successfully",
      data: {
        customer: customerResponse,
        token,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}
export const getCustomerById = async (req, res) => {
  try {
    const customerId = req.params.id;
    const customer = await Customer.findById(customerId);
    console.log("pass");
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.status(200).json(customer);
  } catch (error) {
    res.status(500).json({ message: "Error fetching customer", error });
  }
};

// Delete customer by ID
export async function deleteCustomer(req, res) {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }
    res.status(200).json({ success: true, message: "Customer deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting customer" });
  }
}

export async function getCustomerStats(req, res) {
  try {
    const totalCustomers = await Customer.countDocuments();
    const activeCustomers = await Customer.countDocuments({ status: "active" });
    const loyaltyMembers = await Customer.countDocuments({
      loyaltyLevel: { $in: ["Silver", "Gold", "Platinum"] },
    });

    // Calculate total revenue (sum of totalSpent field)
    const revenueAgg = await Customer.aggregate([{ $group: { _id: null, total: { $sum: "$totalSpent" } } }]);
    const totalRevenue = revenueAgg[0]?.total || 0;

    // Customers created this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const newThisMonth = await Customer.countDocuments({
      createdAt: { $gte: startOfMonth },
    });

    res.status(200).json({
      success: true,
      data: {
        totalCustomers,
        activeCustomers,
        loyaltyMembers,
        totalRevenue,
        newThisMonth,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching stats" });
  }
}

// Add this function to your existing controller
export async function updateCustomer(req, res) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove sensitive fields that shouldn't be updated directly
    delete updateData.password;
    delete updateData.registrationNumber;

    const customer = await Customer.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Customer updated successfully",
      data: { customer },
    });
  } catch (error) {
    console.error("Update customer error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating customer",
      error: error.message,
    });
  }
}
