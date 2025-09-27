// Simple test script to verify Twilio WhatsApp setup
import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;

console.log('🧪 Testing Twilio WhatsApp Setup...');
console.log('📋 Account SID:', accountSid ? accountSid.substring(0, 10) + '...' : 'NOT SET');
console.log('🔑 Auth Token:', authToken ? '***' + authToken.substring(authToken.length - 4) : 'NOT SET');
console.log('📱 From Number:', fromNumber);

if (!accountSid || !authToken) {
  console.log('❌ Missing Twilio credentials in .env file');
  process.exit(1);
}

const client = twilio(accountSid, authToken);

// Test message
const testMessage = `🧪 **Twilio WhatsApp Test**

This is a test message from your Landscape Management System.

If you received this, your WhatsApp integration is working correctly! 🎉

Time: ${new Date().toLocaleString()}`;

// Test phone number (change this to your actual number)
const testPhoneNumber = 'whatsapp:+94760075820';

async function testWhatsApp() {
  try {
    console.log('📤 Sending test message...');
    
    const message = await client.messages.create({
      body: testMessage,
      from: fromNumber,
      to: testPhoneNumber
    });

    console.log('✅ Test message sent successfully!');
    console.log('📨 Message SID:', message.sid);
    console.log('📱 Status:', message.status);
    console.log('💡 Check your WhatsApp for the test message!');
    
  } catch (error) {
    console.log('❌ Error sending test message:');
    console.log('🔍 Error details:', error.message);
    
    if (error.code === 20003) {
      console.log('💡 Solution: Make sure your phone number (+94760075820) is verified in Twilio Console');
    } else if (error.code === 63016) {
      console.log('💡 Solution: Join the Twilio Sandbox by sending "join [keyword]" to +1 415 523 8886');
    } else if (error.message.includes('sandbox')) {
      console.log('💡 Solution: Make sure you joined the WhatsApp sandbox and your number is verified');
    }
  }
}

testWhatsApp();