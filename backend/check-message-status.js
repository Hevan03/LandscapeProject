import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Check the status of the last sent message
async function checkMessageStatus() {
    try {
        console.log('📋 Checking recent WhatsApp messages...\n');
        
        const messages = await client.messages.list({
            limit: 5,
            from: process.env.TWILIO_WHATSAPP_NUMBER
        });

        messages.forEach((message, index) => {
            console.log(`📨 Message ${index + 1}:`);
            console.log(`   SID: ${message.sid}`);
            console.log(`   Status: ${message.status}`);
            console.log(`   To: ${message.to}`);
            console.log(`   Error Code: ${message.errorCode || 'None'}`);
            console.log(`   Error Message: ${message.errorMessage || 'None'}`);
            console.log(`   Date Sent: ${message.dateSent}`);
            console.log('   ─────────────────────────────────');
        });

        if (messages.length === 0) {
            console.log('📭 No messages found');
        }

    } catch (error) {
        console.error('❌ Error checking messages:', error.message);
    }
}

checkMessageStatus();