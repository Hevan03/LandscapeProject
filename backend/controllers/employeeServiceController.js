import moment from "moment";
import Employee_Service from "../models/Employee_Service.js"; 
import multer from "multer";
import path from "path";
import User from "../models/User.js";
import { generateTempPassword, hashPassword, sendWhatsAppApproval } from "../utils/authAndNotify.js";
import { generatePassword } from '../utils/passwordGenerator.js';
import { sendApprovalMessage, sendRejectionMessage, formatPhoneNumber } from '../utils/whatsappService.js';
import Driver from "../models/Driver.js";
import Landscaper from "../models/Landscaper.js";
import ManagementEmployee from "../models/ManagementEmployee.js";

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

// ---------------- CREATE EMPLOYEE SERVICE ---------------- //
export const Create_Employee_Service = async (req, res) => {
  const {
    Service_Num,
    Employee_Name,
    Employee_Type,
    Employee_Contact_Num,
    Employee_Email,
    Employee_Adress,
    Created_By,
    Avilability,
    License_Num,
  } = req.body;

  const cvFile = req.file ? req.file.path : null;

  // Automatically set status to "Open" for admin review
  const Employee_Status = "Open";

  if (
    !Service_Num ||
    !Employee_Name ||
    !Employee_Type ||
    !Employee_Contact_Num ||
    !Employee_Email ||
    !Employee_Adress ||
    !Created_By ||
    !Avilability ||
    !cvFile
  ) {
    return res.status(400).json({
      status: "error",
      message: "All required fields including CV must be provided.",
    });
  }

  try {
    const existingEmployee = await Employee_Service.findOne({ Service_Num });
    if (existingEmployee) {
      return res.status(400).json({
        status: "error",
        code: "DUPLICATE_SERVICE_NUM",
        message: `An employee already exists with Service_Num: ${Service_Num}.`,
      });
    }

    // Status is automatically set to "Open" - no validation needed

    const validTypes = ["Landscaper", "General Employee", "Driver"];
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
      Service_Num,
      Employee_Name,
      Employee_Status,
      Employee_Type,
      Employee_Contact_Num,
      Employee_Email,
      Employee_Adress,
      Created_By,
      Created_Dtm: moment().toDate(),
      Avilability,
      Employee_CV: cvFile,
    };

    if (Employee_Type === "Driver") {
      newEmployeeData.License_Num = License_Num;
    }

    const newEmployee = new Employee_Service(newEmployeeData);
    await newEmployee.save();

    return res.status(201).json({
      status: "success",
      message: "Employee service record created successfully with CV upload.",
      data: newEmployee,
    });
  } catch (error) {
    console.error("Error creating employee service record:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to create employee service record.",
      errors: { exception: error.message },
    });
  }
};


//Read function
export const getOpenEmployees = async (req, res) => {
  try {
    const openEmployees = await Employee_Service.find({ Employee_Status: "Open" });
    res.status(200).json(openEmployees);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving open employees", error });
  }
};

// Get all employees (for landscaper ratings page)
export const getAllEmployees = async (req, res) => {
  try {
    const allEmployees = await Employee_Service.find({});
    res.status(200).json(allEmployees);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving employees", error });
  }
};



// update function
// export const approveEmployee = async (req, res) => {
//   try {
//     const { serviceNum } = req.params; // Service_Num from URL
//     const { approveBy, approveReason } = req.body; // values from frontend

//     // Find employee with matching Service_Num and status "Open"
//     const employee = await Employee_Service.findOne({ Service_Num: serviceNum, Employee_Status: "Open" });

//     if (!employee) {
//       return res.status(404).json({ message: "Employee not found or already approved" });
//     }

//     // Update fields
//     employee.Employee_Status = "Approve";
//     employee.Approve_By = approveBy;
//     employee.Approve_Dtm = new Date();
//     employee.Approve_Reason = approveReason;

//     await employee.save();

//     res.status(200).json({ message: "Employee approved successfully", employee });
//   } catch (error) {
//     res.status(500).json({ message: "Error approving employee", error });
//   }
// };




// export const approveEmployee = async (req, res) => {
//   try {
//     console.log("Approve request received:", { serviceNum: req.params.serviceNum, body: req.body });
    
//     const { serviceNum } = req.params;
//     const { approveBy, approveReason } = req.body;

//     if (!approveBy) return res.status(400).json({ message: "approveBy is required" });

//     // Find Open employee
//     const employee = await Employee_Service.findOne({
//       Service_Num: serviceNum,
//       Employee_Status: "Open",
//     });

//     if (!employee) return res.status(404).json({ message: "Employee not found or already approved" });

//     console.log("Found employee:", employee.Employee_Name);

//     const generatedPassword = generatePassword(10);

//     // Approve employee
//     employee.Employee_Status = "Approve";
//     employee.Approve_By = approveBy;
//     employee.Approve_Dtm = new Date();
//     employee.Approve_Reason = approveReason || "Approved by admin";
//     employee.Employee_Password = generatedPassword;

//     if (!employee.Employee_Adress) employee.Employee_Adress = "Address not provided";
//     if (!employee.Avilability) employee.Avilability = "Full-time";

//     await employee.save();
//     console.log("Employee status updated to Approve");

//     // Create User
//     try {
//       const existingUser = await User.findOne({ serviceNum: employee.Service_Num.toString() });
//       if (!existingUser) {
//         let userRole = "";
//         if (employee.Employee_Type === "Driver") userRole = "driver";
//         else if (employee.Employee_Type === "Landscaper") userRole = "landscaper";
//         else if (employee.Employee_Type === "General Employee") userRole = "employee";

        

//         const newUser = new User({
//           serviceNum: employee.Service_Num.toString(),
//           username: employee.Employee_Name.toLowerCase().replace(/\s+/g, "_"),
//           phone: employee.Employee_Contact_Num,
//           passwordHash: await hashPassword(generatedPassword),
//           role: userRole,
//           status: "active",
//           rating: 0,
//           ratingCount: 0,
//         });

//         await newUser.save();
//         console.log("User created for rating system:", newUser.username);
//       } else {
//         console.log("User already exists:", existingUser.username);
//       }
//     } catch (userError) {
//       console.error("Error creating User:", userError);
//     }

//     // Insert into relevant collection
//     try {
//       if (employee.Employee_Type === "General Employee") {
//         await ManagementEmployee.create({
//           serviceNum: employee.Service_Num,
//           name: employee.Employee_Name,
//           email: employee.Employee_Email,
//           phone: employee.Employee_Contact_Num,
//           address: employee.Employee_Adress,
//           availability: employee.Avilability,
//           passwordHash: await hashPassword(generatedPassword),
//           status: "active",
//         });
      
//         console.log("Driver record created");
//       } else if (employee.Employee_Type === "Landscaper") {
//         await Landscaper.create({
//           serviceNum: employee.Service_Num,
//           name: employee.Employee_Name,
//           email: employee.Employee_Email,
//           phone: employee.Employee_Contact_Num,
//           address: employee.Employee_Adress,
//           availability: employee.Avilability,
//           passwordHash: await hashPassword(generatedPassword),
//           status: "active",
//         });
//         console.log("Landscaper record created");
//       } else if 
//       (employee.Employee_Type === "Driver") {
//         await Driver.create({
//           serviceNum: employee.Service_Num,
//           name: employee.Employee_Name,
//           email: employee.Employee_Email,
//           phone: employee.Employee_Contact_Num,
//           address: employee.Employee_Adress,
//           availability: employee.Avilability,
//           passwordHash: await hashPassword(generatedPassword),
//           status: "active",
//         });
      
//         console.log("Management employee record created");
//       }
//     } catch (collError) {
//       console.error("Error inserting into specific collection:", collError);
//     }

//     // Send WhatsApp message
//     try {
//       const formattedPhone = formatPhoneNumber(employee.Employee_Contact_Num);
//       const whatsappResult = await sendApprovalMessage(
//         formattedPhone,
//         employee.Employee_Name,
//         employee.Employee_Email,
//         generatedPassword,
//         employee.Employee_Type
//       );

//       if (whatsappResult.success) console.log("WhatsApp approval message sent");
//       else console.error("WhatsApp message failed:", whatsappResult.error);
//     } catch (whatsappError) {
//       console.error("WhatsApp messaging error:", whatsappError);
//     }

//     res.status(200).json({
//       message: "Employee approved successfully.",
//       employee: {
//         Service_Num: employee.Service_Num,
//         Employee_Name: employee.Employee_Name,
//         Employee_Status: employee.Employee_Status,
//         Approve_By: employee.Approve_By,
//         Approve_Dtm: employee.Approve_Dtm,
//       },
//     });
//   } catch (error) {
//     console.error("Error in approveEmployee:", error);
//     res.status(500).json({ message: "Error approving employee", error: error.message });
//   }
// };




export const approveEmployee = async (req, res) => {
  try {
    console.log("Approve request received:", { serviceNum: req.params.serviceNum, body: req.body });
    
    const { serviceNum } = req.params;
    const { approveBy, approveReason } = req.body;

    // Validate required fields
    if (!approveBy) return res.status(400).json({ message: "approveBy is required" });

    console.log("Looking for employee with Service_Num:", serviceNum);

    // 1) Find employee with "Open" status
    const employee = await Employee_Service.findOne({
      Service_Num: serviceNum,
      Employee_Status: "Open",
    });

    if (!employee) return res.status(404).json({ message: "Employee not found or already approved" });

    console.log("Found employee:", employee.Employee_Name);

    // 2) Generate password for approved employee
    const generatedPassword = generatePassword(10);
    
    // 3) Approve employee with password
    employee.Employee_Status = "Approve"; 
    employee.Approve_By = approveBy;
    employee.Approve_Dtm = new Date();
    employee.Approve_Reason = approveReason || "Approved by admin";
    employee.Employee_Password = generatedPassword;
    
    if (!employee.Employee_Adress) employee.Employee_Adress = "Address not provided";
    if (!employee.Avilability) employee.Avilability = "Full-time";

     // ✅ Set image field if uploaded
    if (req.file) {
      employee.Employee_Image = req.file.path;
    }
    
    await employee.save();
    console.log("Employee status updated to Approve with generated password");

    // 4) Determine availability (multi-date and slots)
    const availabilityData = employee.availability || []; // empty array if not provided

    // 5) Create User record for rating system
    try {
      const existingUser = await User.findOne({ serviceNum: employee.Service_Num.toString() });
      
      if (!existingUser) {
        let userRole = 'employee';
        if (employee.Employee_Type === 'Driver') userRole = 'driver';
        else if (employee.Employee_Type === 'Landscaper') userRole = 'landscaper';
        else if (employee.Employee_Type === 'General Employee') userRole = 'management';

        const newUser = new User({
          serviceNum: employee.Service_Num.toString(),
          username: employee.Employee_Name.toLowerCase().replace(/\s+/g, '_'),
          phone: employee.Employee_Contact_Num,
          passwordHash: await hashPassword(generatedPassword),
          role: userRole,
          status: 'active',
          rating: 0,
          ratingCount: 0,
          availability: availabilityData,
          image: employee.Employee_Image || null // include uploaded image
        });
        
        await newUser.save();
        console.log("User created for rating system:", newUser.username);
      } else {
        console.log("User already exists for rating system:", existingUser.username);
      }
    } catch (userError) {
      console.error("Error creating user for rating system:", userError);
    }

    // 6) Insert into Driver / Landscaper / Management collections
    try {
      const employeeData = {
        serviceNum: employee.Service_Num,
        name: employee.Employee_Name,
        email: employee.Employee_Email,
        phone: employee.Employee_Contact_Num,
        address: employee.Employee_Adress,
        passwordHash: await hashPassword(generatedPassword),
        status: "active",
        availability: availabilityData,
        image: employee.Employee_Image || null
      };

      if (employee.Employee_Type === "Driver") {
        await Driver.create(employeeData);
        console.log("Driver record created");
      } else if (employee.Employee_Type === "Landscaper") {
        await Landscaper.create(employeeData);
        console.log("Landscaper record created");
      } else if (employee.Employee_Type === "General Employee") {
        await ManagementEmployee.create(employeeData);
        console.log("Management employee record created");
      }
    } catch (collError) {
      console.error("Error inserting into specific collection:", collError);
    }

    // 7) Send WhatsApp approval message
    try {
      const formattedPhone = formatPhoneNumber(employee.Employee_Contact_Num);
      const whatsappResult = await sendApprovalMessage(
        formattedPhone,
        employee.Employee_Name,
        employee.Employee_Email,
        generatedPassword,
        employee.Employee_Type
      );
      
      if (whatsappResult.success) console.log("WhatsApp approval message sent successfully");
      else console.error("Failed to send WhatsApp message:", whatsappResult.error);
    } catch (whatsappError) {
      console.error("WhatsApp messaging error:", whatsappError);
    }

    res.status(200).json({
      message: "Employee approved successfully.",
      employee: {
        Service_Num: employee.Service_Num,
        Employee_Name: employee.Employee_Name,
        Employee_Status: employee.Employee_Status,
        Approve_By: employee.Approve_By,
        Approve_Dtm: employee.Approve_Dtm
      }
    });
  } catch (error) {
    console.error("Error in approveEmployee:", error);
    res.status(500).json({ message: "Error approving employee", error: error.message });
  }
};






// ---------------- REJECT EMPLOYEE ---------------- //
export const rejectEmployee = async (req, res) => {
  try {
    console.log("Reject request received:", { serviceNum: req.params.serviceNum, body: req.body });
    
    const { serviceNum } = req.params;
    const { rejectionReason } = req.body;

    console.log("Looking for employee with Service_Num:", serviceNum);

    // 1) Find employee with "Open" status
    const employee = await Employee_Service.findOne({
      Service_Num: serviceNum,
      Employee_Status: "Open",
    });

    if (!employee) {
      console.log("Employee not found or not Open status");
      return res.status(404).json({ message: "Employee not found or already processed" });
    }

    console.log("Found employee for rejection:", employee.Employee_Name);

    // 2) Send WhatsApp rejection message before deleting
    try {
      const formattedPhone = formatPhoneNumber(employee.Employee_Contact_Num);
      const whatsappResult = await sendRejectionMessage(
        formattedPhone,
        employee.Employee_Name,
        rejectionReason || "Application did not meet current requirements",
        employee.Employee_Type
      );
      
      if (whatsappResult.success) {
        console.log("WhatsApp rejection message sent successfully");
      } else {
        console.error("Failed to send WhatsApp message:", whatsappResult.error);
      }
    } catch (whatsappError) {
      console.error("WhatsApp messaging error:", whatsappError);
      // Continue with rejection even if WhatsApp fails
    }

    // 3) Delete the employee record (since it's rejected)
    await Employee_Service.deleteOne({ Service_Num: serviceNum });
    console.log("Employee application rejected and removed");

    res.status(200).json({
      message: "Employee application rejected successfully.",
      employeeName: employee.Employee_Name,
      serviceNum: serviceNum,
      rejectionReason: rejectionReason || "Application did not meet current requirements"
    });
  } catch (error) {
    console.error("Error in rejectEmployee:", error);
    res.status(500).json({ message: "Error rejecting employee", error: error.message });
  }
};



//delet function
export const deleteEmployee = async (req, res) => {
  try {
    const serviceNum = Number(req.params.serviceNum); // convert string to number

    const employee = await Employee_Service.findOne({ 
      Service_Num: serviceNum, 
      Employee_Status: "Open" 
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

    res.status(200).json({ message: `Employee with Service_Num ${serviceNum} deleted successfully` });
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

