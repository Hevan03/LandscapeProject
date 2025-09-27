import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Test with Twilio's test number first
async function testWithTestNumber() {
    try {
        console.log('📤 Testing with Twilio test number...\n');
        
        const message = await client.messages.create({
            body: '🧪 Testing WhatsApp from Landscape Management System!',
            from: process.env.TWILIO_WHATSAPP_NUMBER,
            to: 'whatsapp:+15005550006'  // Twilio's test number
        });

        console.log('✅ Test message sent to Twilio test number!');
        console.log('📨 Message SID:', message.sid);
        console.log('📋 Status:', message.status);
        
        // Wait a moment and check status
        setTimeout(async () => {
            const updatedMessage = await client.messages(message.sid).fetch();
            console.log('📋 Updated Status:', updatedMessage.status);
            console.log('❌ Error Code:', updatedMessage.errorCode || 'None');
        }, 3000);
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testWithTestNumber();