/**
 * USDT FLASHER PRO - Email Test Script
 * 
 * This script sends a test email to verify that the email configuration is working properly.
 */

require('dotenv').config();
const emailService = require('./email-service');

// Send a test email
async function sendTestEmail() {
  console.log('Sending test email to verify configuration...');
  
  // Check if EMAIL_PASSWORD is set
  const emailPassword = process.env.EMAIL_PASSWORD;
  if (!emailPassword) {
    console.error('ERROR: EMAIL_PASSWORD is not set in .env file.');
    console.error('Email notifications will not work without a valid EMAIL_PASSWORD.');
    console.error('Please set EMAIL_PASSWORD in your .env file.');
    process.exit(1);
  }
  
  try {
    // Prepare test data
    const testData = {
      subject: '🧪 [TEST] USDT FLASHER PRO Email Configuration Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px; background-color: #f9f9f9;">
          <h2 style="color: #5cb85c; border-bottom: 2px solid #5cb85c; padding-bottom: 10px; text-transform: uppercase;">✅ Email Configuration Test</h2>
          <p style="font-size: 16px; font-weight: bold;">This is a test email to verify that your USDT FLASHER PRO email configuration is working properly.</p>
          
          <div style="background-color: #5cb85c; color: white; padding: 10px; text-align: center; font-size: 18px; font-weight: bold; margin: 20px 0; border-radius: 5px;">
            CONFIGURATION DETAILS
          </div>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; background-color: white;">
            <tr style="background-color: #f5f5f5;">
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Email Service</td>
              <td style="padding: 10px; border: 1px solid #ddd;">Gmail SMTP</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">From</td>
              <td style="padding: 10px; border: 1px solid #ddd;">usdtflasherpro@gmail.com</td>
            </tr>
            <tr style="background-color: #f5f5f5;">
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">To</td>
              <td style="padding: 10px; border: 1px solid #ddd;">usdtflasherpro@gmail.com</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Timestamp</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${new Date().toLocaleString()}</td>
            </tr>
          </table>
          
          <p style="color: #5cb85c; font-size: 16px; font-weight: bold; text-align: center;">
            If you received this email, your email configuration is working properly!
          </p>
          
          <p style="color: #666; font-size: 12px; text-align: center; margin-top: 30px; border-top: 1px solid #e0e0e0; padding-top: 10px;">
            This is an automated test email from USDT FLASHER PRO.
          </p>
        </div>
      `,
      text: 'This is a test email to verify that your USDT FLASHER PRO email configuration is working properly.'
    };
    
    // Send the test email
    const result = await emailService.sendEmail(testData);
    
    if (result.success) {
      console.log('Test email sent successfully!');
      console.log('If you received the test email, your email configuration is working properly.');
      
      if (result.previewUrl) {
        console.log('Preview URL (for Ethereal Email):', result.previewUrl);
      }
      
      process.exit(0);
    } else {
      console.error('Failed to send test email:', result.error);
      process.exit(1);
    }
  } catch (error) {
    console.error('Error sending test email:', error);
    process.exit(1);
  }
}

// Run the test
sendTestEmail();
