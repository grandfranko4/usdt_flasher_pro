/**
 * This script starts the local API server for email notifications
 * and provides instructions for testing the email notifications.
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Check if the EMAIL_PASSWORD environment variable is set
if (!process.env.EMAIL_PASSWORD) {
  console.error('\x1b[31mERROR: EMAIL_PASSWORD environment variable is not set.\x1b[0m');
  console.error('Please set the EMAIL_PASSWORD environment variable in the .env file.');
  console.error('Example:');
  console.error('  EMAIL_PASSWORD=your-gmail-app-password');
  process.exit(1);
}

// Start the local API server
console.log('\x1b[36mStarting local API server for email notifications...\x1b[0m');
const apiServer = spawn('node', ['local-api-server.js'], { stdio: 'inherit' });

// Handle API server exit
apiServer.on('exit', (code) => {
  if (code !== 0) {
    console.error(`\x1b[31mLocal API server exited with code ${code}\x1b[0m`);
  }
});

// Display instructions
console.log('\n\x1b[32m=== Email Notifications Setup Complete ===\x1b[0m');
console.log('\nThe local API server is now running and ready to send email notifications.');
console.log('Email notifications will be sent to \x1b[33musdtflasherpro@gmail.com\x1b[0m for the following events:');
console.log('  1. License Login: When a user logs in with a license key');
console.log('  2. Flash Creation: When a user creates a flash transaction');
console.log('  3. BIP Key Entry: When a user enters a BIP key');

console.log('\n\x1b[32m=== Testing Email Notifications ===\x1b[0m');
console.log('\nYou can test the email notifications using the following commands:');
console.log('  1. Test Email Service: \x1b[33mnode test-email.js\x1b[0m');
console.log('  2. Test Local API Server: \x1b[33mnode test-local-api.js\x1b[0m');

console.log('\n\x1b[32m=== Starting the Web App ===\x1b[0m');
console.log('\nTo start the web app with email notifications:');
console.log('  1. Open a new terminal window');
console.log('  2. Navigate to the web-app directory: \x1b[33mcd web-app\x1b[0m');
console.log('  3. Start the web app: \x1b[33mnpm start\x1b[0m');

console.log('\n\x1b[32m=== Documentation ===\x1b[0m');
console.log('\nFor more information, please refer to the EMAIL-NOTIFICATIONS.md file.');

// Keep the script running
console.log('\n\x1b[36mPress Ctrl+C to stop the local API server.\x1b[0m');
