/**
 * Send WhatsApp message to customer when landscaper confirms appointment
 * @param {string} phoneNumber - Customer's phone number
 * @param {string} customerName - Customer's name
 * @param {string|Date} appointmentDate - Appointment date
 * @param {string} timeSlot - Time slot
 * @param {string} siteAddress - Site address (street)
 * @param {string} landscaperName - Landscaper's name
 */
export const sendAppointmentConfirmation = async (phoneNumber, customerName, appointmentDate, timeSlot, siteAddress, landscaperName) => {
  try {
    const client = getTwilioClient();
    const toWhatsApp = `whatsapp:${phoneNumber.startsWith("+") ? phoneNumber : "+" + phoneNumber}`;
    const formattedDate = typeof appointmentDate === "string" ? new Date(appointmentDate).toLocaleDateString() : appointmentDate.toLocaleDateString();
    const message = `🌿 *Appointment Confirmed!* 🌿\n\nDear ${customerName},\n\nYour landscaping appointment has been *confirmed* by ${landscaperName}.\n\n📅 *Date:* ${formattedDate}\n⏰ *Time Slot:* ${timeSlot}\n📍 *Site Address:* ${siteAddress}\n\nThank you for choosing LeafSphere! We look forward to serving you.\n\nIf you have any questions, reply to this message.\n\nBest regards,\nLeafSphere Team`;
    if (!client) {
      console.log("WHATSAPP MESSAGE (Appointment Confirmation) would be sent to:", toWhatsApp);
      console.log("MESSAGE CONTENT:", message);
      return { success: true, messageSid: "simulated-message-id", simulated: true };
    }
    const response = await client.messages.create({
      body: message,
      from: fromWhatsApp,
      to: toWhatsApp,
    });
    console.log("Appointment confirmation WhatsApp message sent successfully:", response.sid);
    return { success: true, messageSid: response.sid };
  } catch (error) {
    console.error("Error sending appointment confirmation WhatsApp message:", error);
    return { success: false, error: error.message };
  }
};
import twilio from "twilio";

// Initialize Twilio client only when needed
const getTwilioClient = () => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromWhatsApp = process.env.TWILIO_WHATSAPP_NUMBER;

  if (!accountSid || !authToken || accountSid === "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" || authToken === "your_twilio_auth_token_here") {
    console.log("Twilio credentials not configured. WhatsApp messages will be logged instead of sent.");
    return null;
  }

  return twilio(accountSid, authToken);
};

// WhatsApp sandbox number (for development) or your approved WhatsApp business number
const fromWhatsApp = process.env.TWILIO_WHATSAPP_NUMBER || process.env.TWILIO_WHATSAPP_FROM || "whatsapp:+14155238886";

/**
 * Send WhatsApp message for approved employee
 * @param {string} phoneNumber - Employee's phone number (format: +1234567890)
 * @param {string} employeeName - Employee's name
 * @param {string} email - Employee's email
 * @param {string} password - Generated password
 * @param {string} employeeType - Type of employee (Landscaper, General Employee, Driver)
 */
export const sendApprovalMessage = async (phoneNumber, employeeName, email, password, employeeType) => {
  try {
    const client = getTwilioClient();

    // Format phone number for WhatsApp
    const toWhatsApp = `whatsapp:${phoneNumber.startsWith("+") ? phoneNumber : "+" + phoneNumber}`;

    const message = `🎉 *Congratulations ${employeeName}!* 🎉

✅ Your application for *${employeeType}* position has been *APPROVED*!

Welcome to our LeafSphere team! We're excited to have you join us and contribute to creating beautiful outdoor spaces.

📧 *Your Login Credentials:*
• Email: ${email}
• Password: ${password}

🌿 *What's Next?*
• Please keep your login credentials safe
• You will receive further instructions soon
• Our team will contact you regarding your start date

Thank you for choosing to work with us. We look forward to working together!

Best regards,
Landscape Management Team 🌱`;

    if (!client) {
      // Log the message instead of sending if Twilio is not configured
      console.log("WHATSAPP MESSAGE (Approval) would be sent to:", toWhatsApp);
      console.log("MESSAGE CONTENT:", message);
      return { success: true, messageSid: "simulated-message-id", simulated: true };
    }

    const response = await client.messages.create({
      body: message,
      from: fromWhatsApp,
      to: toWhatsApp,
    });

    console.log("Approval WhatsApp message sent successfully:", response.sid);
    return { success: true, messageSid: response.sid };
  } catch (error) {
    console.error("Error sending approval WhatsApp message:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Send WhatsApp message for rejected employee
 * @param {string} phoneNumber - Employee's phone number (format: +1234567890)
 * @param {string} employeeName - Employee's name
 * @param {string} rejectionReason - Reason for rejection
 * @param {string} employeeType - Type of employee applied for
 */
export const sendRejectionMessage = async (phoneNumber, employeeName, rejectionReason, employeeType) => {
  try {
    const client = getTwilioClient();

    // Format phone number for WhatsApp
    const toWhatsApp = `whatsapp:${phoneNumber.startsWith("+") ? phoneNumber : "+" + phoneNumber}`;

    const message = `Dear ${employeeName},

Thank you for your interest in the *${employeeType}* position with our LeafSphere company.

❌ Unfortunately, we regret to inform you that your application has been *declined* at this time.

📝 *Reason:* ${rejectionReason || "Application did not meet current requirements"}

🌿 *Don't be discouraged!*
• We encourage you to apply again in the future
• Keep developing your skills and experience
• We appreciate your interest in joining our team

Thank you for considering us as your potential employer. We wish you the best in your job search.

Best regards,
Landscape Management Team 🌱`;

    if (!client) {
      // Log the message instead of sending if Twilio is not configured
      console.log("WHATSAPP MESSAGE (Rejection) would be sent to:", toWhatsApp);
      console.log("MESSAGE CONTENT:", message);
      return { success: true, messageSid: "simulated-message-id", simulated: true };
    }

    const response = await client.messages.create({
      body: message,
      from: fromWhatsApp,
      to: toWhatsApp,
    });

    console.log("Rejection WhatsApp message sent successfully:", response.sid);
    return { success: true, messageSid: response.sid };
  } catch (error) {
    console.error("Error sending rejection WhatsApp message:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Format phone number to international format
 * @param {string} phoneNumber - Phone number in any format
 * @returns {string} - Formatted phone number with country code
 */
export const formatPhoneNumber = (phoneNumber) => {
  // Remove all non-numeric characters
  console.log(phoneNumber);
  const cleaned = phoneNumber.replace(/\D/g, "");

  // If it starts with country code, return as is
  if (cleaned.startsWith("94") && cleaned.length >= 10) {
    return "+" + cleaned;
  }

  // If it's a local Sri Lankan number, add country code
  if (cleaned.length === 9 || cleaned.length === 10) {
    return "+94" + cleaned.substring(cleaned.length === 10 ? 1 : 0);
  }

  // Default: assume it needs +94 prefix
  return "+94" + cleaned;
};

// export const openWhatsAppApproval = (phoneNumber, employeeName, employeeType) => {
//   const message = `Congratulations ${employeeName}! Your application for ${employeeType} has been approved. Welcome to LeafSphere!`;
//   const encodedMessage = encodeURIComponent(message);
//   const url = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
//   return url;
// };

// // Call this at the end of approveEmployee
// // Example usage inside approveEmployee:
// const waUrl = openWhatsAppApproval(
//   formatPhoneNumber(employee.Employee_Contact_Num || employee.phone),
//   employee.Employee_Name || employee.name,
//   employeeType
// );
// // You can log or return this URL in your response:
// console.log("Open WhatsApp approval URL:", waUrl);
// // Optionally, include it in your API response:
// res.status(200).json({
//   message: "Employee approved successfully.",
//   employee: {
//     _id: employee._id,
//     Employee_Name: employee.Employee_Name,
//     Employee_Status: employee.Employee_Status,
//     Approve_By: employee.Approve_By,
//     Approve_Dtm: employee.Approve_Dtm,
//     whatsappUrl: waUrl,
//   },
// });
