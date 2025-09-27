import twilio from 'twilio';

// Initialize Twilio client only when needed
const getTwilioClient = () => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  
  if (!accountSid || !authToken || accountSid === 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' || authToken === 'your_twilio_auth_token_here') {
    console.log('Twilio credentials not configured. WhatsApp messages will be logged instead of sent.');
    return null;
  }
  
  return twilio(accountSid, authToken);
};

// WhatsApp sandbox number (for development) or your approved WhatsApp business number
const fromWhatsApp = process.env.TWILIO_WHATSAPP_NUMBER || process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';

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
    const toWhatsApp = `whatsapp:${phoneNumber.startsWith('+') ? phoneNumber : '+' + phoneNumber}`;
    
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
      console.log('WHATSAPP MESSAGE (Approval) would be sent to:', toWhatsApp);
      console.log('MESSAGE CONTENT:', message);
      return { success: true, messageSid: 'simulated-message-id', simulated: true };
    }

    const response = await client.messages.create({
      body: message,
      from: fromWhatsApp,
      to: toWhatsApp
    });

    console.log('Approval WhatsApp message sent successfully:', response.sid);
    return { success: true, messageSid: response.sid };
  } catch (error) {
    console.error('Error sending approval WhatsApp message:', error);
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
    const toWhatsApp = `whatsapp:${phoneNumber.startsWith('+') ? phoneNumber : '+' + phoneNumber}`;
    
    const message = `Dear ${employeeName},

Thank you for your interest in the *${employeeType}* position with our LeafSphere company.

❌ Unfortunately, we regret to inform you that your application has been *declined* at this time.

📝 *Reason:* ${rejectionReason || 'Application did not meet current requirements'}

🌿 *Don't be discouraged!*
• We encourage you to apply again in the future
• Keep developing your skills and experience
• We appreciate your interest in joining our team

Thank you for considering us as your potential employer. We wish you the best in your job search.

Best regards,
Landscape Management Team 🌱`;

    if (!client) {
      // Log the message instead of sending if Twilio is not configured
      console.log('WHATSAPP MESSAGE (Rejection) would be sent to:', toWhatsApp);
      console.log('MESSAGE CONTENT:', message);
      return { success: true, messageSid: 'simulated-message-id', simulated: true };
    }

    const response = await client.messages.create({
      body: message,
      from: fromWhatsApp,
      to: toWhatsApp
    });

    console.log('Rejection WhatsApp message sent successfully:', response.sid);
    return { success: true, messageSid: response.sid };
  } catch (error) {
    console.error('Error sending rejection WhatsApp message:', error);
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
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // If it starts with country code, return as is
  if (cleaned.startsWith('94') && cleaned.length >= 10) {
    return '+' + cleaned;
  }
  
  // If it's a local Sri Lankan number, add country code
  if (cleaned.length === 9 || cleaned.length === 10) {
    return '+94' + cleaned.substring(cleaned.length === 10 ? 1 : 0);
  }
  
  // Default: assume it needs +94 prefix
  return '+94' + cleaned;
};