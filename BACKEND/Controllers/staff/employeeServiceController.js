import moment from "moment";
import Employee_Service from "../../Models/staff/Employee_Service.js";
import Customer from "../../Models/customer/customerModel.js";
import multer from "multer";
import path from "path";
import User from "../../Models/staff/User.js";
import { generateTempPassword, hashPassword, sendWhatsAppApproval } from "../../utils/authAndNotify.js";
import { generatePassword } from "../../utils/passwordGenerator.js";
import { sendApprovalMessage, sendRejectionMessage, formatPhoneNumber } from "../../utils/whatsappService.js";
import Driver from "../../Models/delivery/driverModel.js";
import Landscaper from "../../Models/landscape/landscaperModel.js";
import Maintenance from "../../Models/customer/MaintenanceModel.js";
import { type } from "os";

// ---------------- MULTER SETUP ---------------- //
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/cv/"); // folder for storing CVs
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed!"), false);
  }
};

// middleware to use in route
export const uploadCV = multer({ storage, fileFilter });

export const Create_Employee_Service = async (req, res) => {
  const { Employee_Name, Employee_Type, Employee_Contact_Num, Employee_Email, Employee_Adress, Created_By, Avilability, License_Num } = req.body;
  const cvFile = req.file ? req.file.path : null;
  const Employee_Status = "Open";
  const accountStatus = "pending";

  if (!Employee_Name || !Employee_Type || !Employee_Contact_Num || !Employee_Email || !Employee_Adress || !Created_By || !Avilability || !cvFile) {
    return res.status(400).json({
      status: "error",
      message: "All required fields including CV must be provided.",
    });
  }

  try {
    // Check for existing employee by email or contact number in all models
    let existingEmployee =
      (await Employee_Service.findOne({ email: Employee_Email })) ||
      (await Driver.findOne({ email: Employee_Email })) ||
      (await Landscaper.findOne({ email: Employee_Email })) ||
      (await Maintenance.findOne({ email: Employee_Email }));

    if (existingEmployee) {
      return res.status(400).json({
        status: "error",
        code: "DUPLICATE_EMPLOYEE",
        message: `An employee already exists with this same email id.`,
      });
    }

    const validTypes = ["Landscaper", "General Employee", "Driver", "Maintenance Worker"];
    if (!validTypes.includes(Employee_Type)) {
      return res.status(400).json({
        status: "error",
        message: `Invalid Employee_Type. Allowed values: ${validTypes.join(", ")}.`,
      });
    }

    if (Employee_Type === "Driver" && !License_Num) {
      return res.status(400).json({
        status: "error",
        message: "License_Num is required for Employee_Type 'Driver'.",
      });
    }

    const validAvailability = ["Full-time", "Part-time", "Contract"];
    if (!validAvailability.includes(Avilability)) {
      return res.status(400).json({
        status: "error",
        message: `Invalid Avilability. Allowed values: ${validAvailability.join(", ")}.`,
      });
    }

    const newEmployeeData = {
      Employee_Name,
      Employee_Status,
      Employee_Type,
      Employee_Contact_Num,
      email: Employee_Email,
      Employee_Adress,
      Created_By,
      Created_Dtm: moment().toDate(),
      Avilability,
      Employee_CV: cvFile,
      accountStatus,
    };

    if (Employee_Type === "Driver") {
      newEmployeeData.License_Num = License_Num;
    }

    // Save to specific model based on Employee_Type
    if (Employee_Type === "Driver") {
      await Driver.create({
        name: Employee_Name,
        email: Employee_Email,
        phone: Employee_Contact_Num,
        address: Employee_Adress,
        licenseNo: License_Num,
        image: null,
        accountStatus,
      });
    } else if (Employee_Type === "Landscaper") {
      await Landscaper.create({
        name: Employee_Name,
        email: Employee_Email,
        phone: Employee_Contact_Num,
        address: Employee_Adress,
        //availability: Avilability,
        image: null,
        accountStatus,
      });
    } else if (Employee_Type === "General Employee") {
      await Employee_Service.create({
        Employee_Name: Employee_Name,
        email: Employee_Email,
        phone: Employee_Contact_Num,
        address: Employee_Adress,
        //availability: Avilability,
        image: null,
        accountStatus,
      });
    } else if (Employee_Type === "Maintenance Worker") {
      await Maintenance.create({
        name: Employee_Name,
        email: Employee_Email,
        phone: Employee_Contact_Num,
        address: Employee_Adress,
        //availability: Avilability,
        image: null,
        accountStatus,
      });
    }

    return res.status(201).json({
      status: "success",
      message: "Employee service record created successfully with CV upload.",
      data: newEmployeeData,
    });
  } catch (error) {
    console.error("Error creating employee service record:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to create employee service record." + error.message,
      errors: { exception: error.message },
    });
  }
};

export const getAllEmployees = async (req, res) => {
  try {
    const allEmployees = await Employee_Service.find({});
    res.status(200).json(allEmployees);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving employees", error });
  }
};

export const approveEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { approveBy, approveReason } = req.body;

    // Validate required fields
    if (!approveBy) return res.status(400).json({ message: "approveBy is required" });

    let employee = null;
    let employeeType = null;
    let employeename = null;

    employee = await Employee_Service.findOne({ _id: id, accountStatus: "pending" });
    if (employee) {
      employeeType = "General Employee";
      employeename = employee.Employee_Name;
    }
    if (!employee) {
      employee = await Driver.findOne({ _id: id, accountStatus: "pending" });
      if (employee) {
        employeeType = "Driver";
        employeename = employee.name;
      }
    }
    if (!employee) {
      employee = await Landscaper.findOne({ _id: id, accountStatus: "pending" });
      if (employee) {
        employeeType = "Landscaper";
        employeename = employee.name;
      }
    }
    if (!employee) {
      employee = await Maintenance.findOne({ _id: id, accountStatus: "pending" });
      if (employee) {
        employeeType = "Maintenance Worker";
        employeename = employee.name;
      }
    }

    if (!employee) return res.status(404).json({ message: "Employee not found or already processed" });

    // Now you can use employeeType for notifications, logging, etc.

    if (!employee) return res.status(404).json({ message: "Employee not found or already approved" });
    const plainPassword = generatePassword(10);
    // Mark as approved
    employee.Employee_Status = "Approve";
    employee.accountStatus = "approved";
    employee.Approve_By = approveBy;
    employee.Approve_Dtm = new Date();
    employee.employeeType = employeeType;
    employee.Approve_Reason = approveReason || "Approved by admin";
    employee.Employee_Password = plainPassword;

    if (!employee.Employee_Adress) employee.Employee_Adress = "Address not provided";
    if (!employee.Avilability) employee.Avilability = "Full-time";
    if (req.file) employee.Employee_Image = req.file.path;

    //save password in db when approve
    const hashed = await hashPassword(plainPassword);
    if (employee instanceof Employee_Service) {
      employee.passwordHash = hashed;
    } else if (employee instanceof Driver) {
      employee.passwordHash = hashed;
    } else if (employee instanceof Landscaper) {
      employee.passwordHash = hashed;
    } else if (employee instanceof Maintenance) {
      employee.passwordHash = hashed;
    }

    await employee.save();
    // Optionally send WhatsApp message (keep if needed)
    try {
      const formattedPhone = formatPhoneNumber(employee.phone);
      await sendApprovalMessage(formattedPhone, employeename, employee.email, employee.Employee_Password, employee.employeeType);
    } catch (whatsappError) {
      // Log but do not fail
      console.error("WhatsApp messaging error:", whatsappError);
    }

    res.status(200).json({
      message: "Employee approved successfully.",
      employee: {
        _id: employee._id,
        Employee_Name: employee.Employee_Name,
        Employee_Status: employee.Employee_Status,
        Approve_By: employee.Approve_By,
        Approve_Dtm: employee.Approve_Dtm,
      },
    });
  } catch (error) {
    console.error("Error in approveEmployee:", error);
    res.status(500).json({ message: "Error approving employee", error: error.message });
  }
};

export const rejectEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    // Find employee in all models, only with accountStatus: "pending"
    let employee =
      (await Employee_Service.findOne({ _id: id, accountStatus: "pending" })) ||
      (await Driver.findOne({ _id: id, accountStatus: "pending" })) ||
      (await Landscaper.findOne({ _id: id, accountStatus: "pending" })) ||
      (await Maintenance.findOne({ _id: id, accountStatus: "pending" }));

    if (!employee) {
      return res.status(404).json({ message: "Employee not found or already processed" });
    }

    // Optionally send WhatsApp rejection message before updating
    try {
      const formattedPhone = formatPhoneNumber(employee.Employee_Contact_Num);
      await sendRejectionMessage(
        formattedPhone,
        employee.Employee_Name,
        rejectionReason || "Application did not meet current requirements",
        employee.Employee_Type
      );
    } catch (whatsappError) {
      console.error("WhatsApp messaging error:", whatsappError);
      // Continue with rejection even if WhatsApp fails
    }

    // Mark as rejected (do not delete, just update status)
    employee.Employee_Status = "Rejected";
    employee.accountStatus = "rejected";
    employee.Reject_Reason = rejectionReason || "Application did not meet current requirements";
    employee.Reject_Dtm = new Date();

    await employee.save();

    res.status(200).json({
      message: "Employee application rejected successfully.",
      employeeName: employee.Employee_Name,
      employeeId: employee._id,
      rejectionReason: employee.Reject_Reason,
    });
  } catch (error) {
    console.error("Error in rejectEmployee:", error);
    res.status(500).json({ message: "Error rejecting employee", error: error.message });
  }
};

export const deleteEmployee = async (req, res) => {
  try {
    const serviceNum = Number(req.params.serviceNum); // convert string to number

    const employee = await Employee_Service.findOne({
      Service_Num: serviceNum,
      Employee_Status: "Open",
    });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found or not in Open status" });
    }

    //  // ✅ Create notification
    // const notification = new Notification({
    //   Service_Num: serviceNum,
    //   message: `Employee ${employee.Employee_Name} (Service #${serviceNum}) was rejected and removed.`
    // });
    // await notification.save();

    await Employee_Service.deleteOne({ Service_Num: serviceNum });

    res.status(200).json({
      message: `Employee with Service_Num ${serviceNum} deleted successfully`,
    });
  } catch (error) {
    res.status(500).json({ message: "Error deleting employee", error });
  }
};

export const getUsersGroupedByRole = async (req, res) => {
  try {
    const users = await User.find();
    const grouped = users.reduce((acc, user) => {
      acc[user.role] = acc[user.role] || [];
      acc[user.role].push(user);
      return acc;
    }, {});
    res.status(200).json(grouped);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error });
  }
};

// export const registerEmployee = async (req, res) => {
//   try {
//     const {
//       Employee_Name,
//       email,
//       department,
//       designation,
//       status,
//       role, // "ManagementEmployee" or "staff"
//       password,
//       Employee_Image,
//       availability,
//     } = req.body;
//     console.log("Registering employee:", req.body);

//     // Basic validation
//     if (!Employee_Name || !password || !email) {
//       return res.status(400).json({
//         success: false,
//         message: "Employee_Name, email, and password are required.",
//       });
//     }

//     // Auto-generate Service_Num
//     const lastEmployee = await Employee_Service.findOne({}, {}, { sort: { Service_Num: -1 } });
//     const Service_Num = lastEmployee ? lastEmployee.Service_Num + 1 : 1001; // Start from 1001 if none

//     // Hash password
//     const passwordHash = await hashPassword(password);

//     // Build employee object
//     const employeeData = {
//       Service_Num,
//       Employee_Name,
//       email,
//       department,
//       designation,
//       status: status || "active",
//       role,
//       passwordHash,
//       Employee_Image,
//       availability,
//     };

//     const employee = new Employee_Service(employeeData);
//     await employee.save();

//     res.status(201).json({
//       success: true,
//       message: "Employee registered successfully.",
//       employee,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Error registering employee.",
//       error: error.message,
//     });
//   }
// };

export const getEmployeeById = async (req, res) => {
  try {
    const userId = req.params.id;
    let user = null;
    let role = null;

    user = await Employee_Service.findById(userId);
    if (user) role = "staff";
    if (!user) {
      user = await Driver.findById(userId);
      if (user) role = "driver";
    }
    if (!user) {
      user = await Landscaper.findById(userId);
      if (user) role = "landscaper";
    }
    if (!user) {
      user = await Customer.findById(userId);
      if (user) role = "customer";
    }
    if (!user) {
      user = await Maintenance.findById(userId);
      if (user) role = "maintenance";
    }

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json({ user, role });
  } catch (error) {
    res.status(500).json({ message: "Error fetching user details.", error });
  }
};

export const getAllUsersGrouped = async (req, res) => {
  try {
    const employees = await Employee_Service.find({});
    const drivers = await Driver.find({});
    const landscapers = await Landscaper.find({});
    const customers = await Customer.find({});
    const maintenance = await Maintenance.find({});

    res.status(200).json({
      employees,
      drivers,
      landscapers,
      customers,
      maintenance,
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving users", error });
  }
};

export const getAllOpenUsersGrouped = async (req, res) => {
  try {
    const employees = await Employee_Service.find({ accountStatus: "pending" });
    const drivers = await Driver.find({ accountStatus: "pending" });
    const landscapers = await Landscaper.find({ accountStatus: "pending" });
    const maintenanceWorkers = await Maintenance.find({ accountStatus: "pending" });

    res.status(200).json({
      employees,
      drivers,
      landscapers,
      maintenanceWorkers,
      customers,
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving users", error });
  }
};

export const getAllApprovedUsersGrouped = async (req, res) => {
  try {
    const employees = await Employee_Service.find({ accountStatus: "approved" });
    const drivers = await Driver.find({ accountStatus: "approved" });
    const landscapers = await Landscaper.find({ accountStatus: "approved" });
    const maintenanceWorkers = await Maintenance.find({ accountStatus: "approved" });

    res.status(200).json({
      employees,
      drivers,
      landscapers,
      maintenanceWorkers,
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving users", error });
  }
};
