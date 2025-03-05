#!/usr/bin/env node

/**
 * Test script for the admin dashboard
 * This script tests the authentication, license keys, and contact info functionality
 */

const fetch = require('node-fetch');
const chalk = require('chalk');

// Configuration
const BASE_URL = 'http://localhost:8888/.netlify/functions';
const ADMIN_EMAIL = 'mikebtcretriever@gmail.com';
const ADMIN_PASSWORD = 'Gateway@523';

// Helper function to log messages
const log = {
  info: (message) => console.log(chalk.blue(`[INFO] ${message}`)),
  success: (message) => console.log(chalk.green(`[SUCCESS] ${message}`)),
  error: (message) => console.log(chalk.red(`[ERROR] ${message}`)),
  warning: (message) => console.log(chalk.yellow(`[WARNING] ${message}`)),
  json: (data) => console.log(chalk.cyan(JSON.stringify(data, null, 2)))
};

// Helper function to make API requests
async function apiRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  log.info(`Making request to ${url}`);
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    log.info(`Response status: ${response.status}`);
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      return { status: response.status, data };
    } else {
      const text = await response.text();
      return { status: response.status, text };
    }
  } catch (error) {
    log.error(`Request failed: ${error.message}`);
    throw error;
  }
}

// Test authentication
async function testAuthentication() {
  log.info('Testing authentication...');
  
  try {
    const response = await apiRequest('/auth', {
      method: 'POST',
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD
      })
    });
    
    if (response.status === 200 && response.data.success) {
      log.success('Authentication successful');
      log.json(response.data);
      return response.data.token;
    } else {
      log.error('Authentication failed');
      log.json(response.data);
      return null;
    }
  } catch (error) {
    log.error(`Authentication test failed: ${error.message}`);
    return null;
  }
}

// Test fetching license keys
async function testFetchLicenseKeys(token) {
  log.info('Testing fetch license keys...');
  
  try {
    const response = await apiRequest('/license-keys', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    if (response.status === 200) {
      log.success('Fetch license keys successful');
      log.json(response.data);
      return response.data;
    } else {
      log.error('Fetch license keys failed');
      log.json(response.data);
      return null;
    }
  } catch (error) {
    log.error(`Fetch license keys test failed: ${error.message}`);
    return null;
  }
}

// Test creating a license key
async function testCreateLicenseKey(token) {
  log.info('Testing create license key...');
  
  const licenseData = {
    key: `TEST-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
    status: 'active',
    expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    user: 'test@example.com'
  };
  
  try {
    const response = await apiRequest('/license-keys', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(licenseData)
    });
    
    if (response.status === 201) {
      log.success('Create license key successful');
      log.json(response.data);
      return response.data;
    } else {
      log.error('Create license key failed');
      log.json(response.data);
      return null;
    }
  } catch (error) {
    log.error(`Create license key test failed: ${error.message}`);
    return null;
  }
}

// Test fetching contact info
async function testFetchContactInfo(token) {
  log.info('Testing fetch contact info...');
  
  try {
    const response = await apiRequest('/contact-info', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    if (response.status === 200) {
      log.success('Fetch contact info successful');
      log.json(response.data);
      return response.data;
    } else if (response.status === 404) {
      log.warning('No contact info found');
      return null;
    } else {
      log.error('Fetch contact info failed');
      log.json(response.data);
      return null;
    }
  } catch (error) {
    log.error(`Fetch contact info test failed: ${error.message}`);
    return null;
  }
}

// Test saving contact info
async function testSaveContactInfo(token) {
  log.info('Testing save contact info...');
  
  const contactData = {
    primary_phone: '+1234567890',
    secondary_phone: '+0987654321',
    tertiary_phone: '+1122334455',
    email: 'contact@example.com',
    website: 'https://example.com',
    telegram_username: 'example_telegram',
    discord_server: 'example_discord'
  };
  
  try {
    const response = await apiRequest('/contact-info', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(contactData)
    });
    
    if (response.status === 200) {
      log.success('Save contact info successful');
      log.json(response.data);
      return response.data;
    } else {
      log.error('Save contact info failed');
      log.json(response.data);
      return null;
    }
  } catch (error) {
    log.error(`Save contact info test failed: ${error.message}`);
    return null;
  }
}

// Run all tests
async function runTests() {
  try {
    // Test authentication
    const token = await testAuthentication();
    if (!token) {
      log.error('Authentication failed, cannot proceed with other tests');
      return;
    }
    
    // Test license keys
    const licenseKeys = await testFetchLicenseKeys(token);
    if (licenseKeys && licenseKeys.length === 0) {
      log.info('No license keys found, creating a test license key');
      await testCreateLicenseKey(token);
    }
    
    // Test contact info
    const contactInfo = await testFetchContactInfo(token);
    if (!contactInfo) {
      log.info('No contact info found, creating test contact info');
      await testSaveContactInfo(token);
    }
    
    log.success('All tests completed');
  } catch (error) {
    log.error(`Tests failed: ${error.message}`);
  }
}

// Run the tests
runTests();
