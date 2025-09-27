import customerModel from "../Models/customerModel.js";

// Get all customers
export async function getAllCustomers(req, res) {
  try {
    const customers = await customerModel.find().sort({ createdAt: -1 });
    res.status(200).json(customers);
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Create new customer
export async function createCustomer(req, res) {
  try {
    const { name } = req.body;
    const newCustomer = new customerModel({ name });
    await newCustomer.save();
    res.status(201).json({ message: "Customer created successfully" });
  } catch (error) {
    console.error("Error creating customer:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}