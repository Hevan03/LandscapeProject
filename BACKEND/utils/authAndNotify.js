// utils/authAndNotify.js
import bcrypt from "bcryptjs";
import crypto from "crypto";
import twilio from "twilio";

// generate random password
export const generateTempPassword = () => {
  return crypto.randomBytes(12).toString("base64").replace(/[^a-zA-Z0-9]/g, "").slice(0, 10);
};

// hash password
export const hashPassword = async (plain) => {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(plain, salt);
};

// send WhatsApp message via Twilio
export const sendWhatsAppApproval = async ({ to, name, username, password, loginUrl }) => {
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

  const body =
`Hi ${name},

✅ Your application has been approved.

Login: ${loginUrl || "https://your-app.example.com/login"}
Username: ${username}
Password: ${password}

Please log in and change your password.`;

  return client.messages.create({
    from: process.env.TWILIO_WHATSAPP_FROM,  // e.g. 'whatsapp:+14155238886'
    to: `whatsapp:${to}`,                   // e.g. 'whatsapp:+9477XXXXXXX'
    body,
  });
};
