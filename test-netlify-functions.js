require('dotenv').config();
const axios = require('axios');

// Base URL for Netlify Functions API
const API_BASE_URL = 'https://usdtflasherproweb.netlify.app/.netlify/functions/api';

// Test license key validation endpoint
async function testLicenseValidation() {
  try {
    console.log('\n--- Testing License Validation Endpoint ---');
    const licenseKey = 'USDT-ABCD-1234-EFGH-5678';
    const response = await axios.get(`${API_BASE_URL}/validate-license?key=${licenseKey}`);
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('Error testing license validation:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    return null;
  }
}

// Test flash transaction logging endpoint
async function testFlashTransaction() {
  try {
    console.log('\n--- Testing Flash Transaction Endpoint ---');
    const flashData = {
      wallet: 'Test Wallet',
      currency: 'USDT',
      network: 'TRC20',
      receiverAddress: 'TRX7NVHDXYv12XA9P2LCWQrAALM9hN2JpV',
      flashAmount: 1000,
      delayDays: 0,
      delayMinutes: 0,
      licenseKey: 'USDT-ABCD-1234-EFGH-5678',
      user: 'test@example.com',
      timestamp: new Date().toISOString()
    };
    
    const response = await axios.post(`${API_BASE_URL}/log-transaction`, flashData);
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('Error testing flash transaction:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    return null;
  }
}

// Test BIP key notification endpoint
async function testBipNotification() {
  try {
    console.log('\n--- Testing BIP Key Notification Endpoint ---');
    const bipData = {
      bipKey: 'TEST-BIP-KEY-456',
      licenseKey: 'USDT-ABCD-1234-EFGH-5678',
      user: 'test@example.com'
    };
    
    const response = await axios.post(`${API_BASE_URL}/bip-notification`, bipData);
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('Error testing BIP notification:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    return null;
  }
}

// Run all tests
async function runTests() {
  try {
    console.log('Starting Netlify Functions API tests...');
    
    // Test license validation
    await testLicenseValidation();
    
    // Test flash transaction
    await testFlashTransaction();
    
    // Test BIP notification
    await testBipNotification();
    
    console.log('\nAll tests completed!');
  } catch (error) {
    console.error('Error running tests:', error);
  }
}

// Run the tests
runTests();
