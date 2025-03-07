require('dotenv').config();
const emailService = require('./email-service');

console.log('Starting email test...');
console.log('Email password length:', process.env.EMAIL_PASSWORD ? process.env.EMAIL_PASSWORD.length : 'not set');

// Test all email notifications
async function runTests() {
  try {
    console.log('\n--- Testing License Login Notification ---');
    const licenseResult = await emailService.sendLicenseLoginNotification({
      key: 'TEST-LICENSE-KEY-123',
      user: 'test@example.com',
      type: 'demo'
    });
    console.log('License login notification result:', licenseResult);
    
    console.log('\n--- Testing Flash Creation Notification ---');
    const flashResult = await emailService.sendFlashCreationNotification({
      wallet: 'Test Wallet',
      currency: 'USDT',
      network: 'TRC20',
      receiverAddress: 'TRX7NVHDXYv12XA9P2LCWQrAALM9hN2JpV',
      flashAmount: 1000,
      licenseKey: 'TEST-LICENSE-KEY-123',
      user: 'test@example.com',
      timestamp: new Date().toISOString()
    });
    console.log('Flash creation notification result:', flashResult);
    
    console.log('\n--- Testing BIP Key Notification ---');
    const bipResult = await emailService.sendBipKeyNotification({
      bipKey: 'TEST-BIP-KEY-456',
      licenseKey: 'TEST-LICENSE-KEY-123',
      user: 'test@example.com'
    });
    console.log('BIP key notification result:', bipResult);
    
    console.log('\nAll tests completed!');
    
    // If any of the emails have a preview URL, log it
    if (licenseResult.previewUrl) {
      console.log('\nLicense Login Email Preview URL:', licenseResult.previewUrl);
    }
    if (flashResult.previewUrl) {
      console.log('Flash Creation Email Preview URL:', flashResult.previewUrl);
    }
    if (bipResult.previewUrl) {
      console.log('BIP Key Email Preview URL:', bipResult.previewUrl);
    }
  } catch (error) {
    console.error('Error running tests:', error);
  }
}

// Run the tests
runTests();
