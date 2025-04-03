// Script to start the local API server and test email notifications
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Check if node-fetch is installed
try {
  require.resolve('node-fetch');
} catch (e) {
  console.log('Installing node-fetch...');
  require('child_process').execSync('npm install node-fetch@2 abort-controller');
  console.log('node-fetch installed successfully.');
}

// Function to start the local API server
function startLocalApiServer() {
  console.log('Starting local API server...');
  
  // Check if .env file exists
  if (!fs.existsSync('.env')) {
    console.error('Error: .env file not found. Please create a .env file with EMAIL_PASSWORD set.');
    process.exit(1);
  }
  
  // Start the local API server
  const apiServer = spawn('node', ['local-api-server.js'], {
    stdio: 'inherit',
    env: { ...process.env }
  });
  
  // Handle server exit
  apiServer.on('exit', (code) => {
    console.log(`API server exited with code ${code}`);
  });
  
  return apiServer;
}

// Function to run the email tests
function runEmailTests() {
  console.log('Waiting for API server to start...');
  
  // Wait for the server to start
  setTimeout(() => {
    console.log('Running email tests...');
    
    // Run the email tests
    const emailTests = spawn('node', ['test-email-notifications.js'], {
      stdio: 'inherit',
      env: { ...process.env }
    });
    
    // Handle tests exit
    emailTests.on('exit', (code) => {
      console.log(`Email tests exited with code ${code}`);
      
      // Exit the process
      process.exit(0);
    });
  }, 3000); // Wait 3 seconds for the server to start
}

// Main function
function main() {
  console.log('Starting email notification test...');
  
  // Start the local API server
  const apiServer = startLocalApiServer();
  
  // Run the email tests
  runEmailTests();
  
  // Handle process exit
  process.on('exit', () => {
    console.log('Exiting...');
    
    // Kill the API server
    if (apiServer && !apiServer.killed) {
      apiServer.kill();
    }
  });
  
  // Handle Ctrl+C
  process.on('SIGINT', () => {
    console.log('Received SIGINT. Exiting...');
    
    // Kill the API server
    if (apiServer && !apiServer.killed) {
      apiServer.kill();
    }
    
    process.exit(0);
  });
}

// Run the main function
main();
