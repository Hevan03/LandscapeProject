import landscaperModel from "../../Models/customer/landscaperModel.js";
import Employee_Service from "../../Models/staff/Employee_Service.js";
import { hashPassword } from "../../utils/authAndNotify.js";

// Get all landscapers
export async function getAllLandscapers(req, res) {
  try {
    const landscapers = await landscaperModel.find().sort({ createdAt: -1 });
    res.status(200).json(landscapers);
  } catch (error) {
    console.error("Error fetching landscapers:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export const registerEmployee = async (req, res) => {
  try {
    const {
      Service_Num,
      Employee_Name,
      department,
      designation,
      status,
      role, // "ManagementEmployee" or "staff"
      password,
      Employee_Image,
      availability,
    } = req.body;

    // Basic validation
    if (!Service_Num || !Employee_Name || !role || !password) {
      return res.status(400).json({
        success: false,
        message: "Service_Num, Employee_Name, role, and password are required.",
      });
    }

    // Check for duplicate Service_Num
    const exists = await Employee_Service.findOne({ Service_Num });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Employee with this Service_Num already exists.",
      });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Build employee object
    const employeeData = {
      Service_Num,
      Employee_Name,
      department,
      designation,
      status: status || "active",
      role,
      passwordHash,
      Employee_Image,
      availability,
    };

    const employee = new Employee_Service(employeeData);
    await employee.save();

    res.status(201).json({
      success: true,
      message: "Employee registered successfully.",
      employee,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error registering employee.",
      error: error.message,
    });
  }
};
