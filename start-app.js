const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Load environment variables from .env file
if (fs.existsSync('.env')) {
  console.log('Loading environment variables from .env file...');
  dotenv.config();
} else {
  console.log('No .env file found, using default environment variables.');
}

// Check if the EMAIL_PASSWORD environment variable is set
if (!process.env.EMAIL_PASSWORD) {
  console.warn('\x1b[33mWARNING: EMAIL_PASSWORD environment variable is not set. Email notifications will not work.\x1b[0m');
  console.warn('Please set the EMAIL_PASSWORD environment variable in the .env file.');
}

// Start the Socket.IO server
console.log('Starting Socket.IO server...');
const socketServer = spawn('node', ['socket-server.js'], {
  stdio: 'inherit',
  shell: true
});

// Start the local API server for email notifications
console.log('Starting local API server for email notifications...');
const apiServer = spawn('node', ['local-api-server.js'], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD
  }
});

// Wait for the servers to start
setTimeout(() => {
  // Start the Electron app
  console.log('Starting Electron app...');
  const electronApp = spawn('electron', ['.'], {
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      SOCKET_SERVER_URL: process.env.SOCKET_SERVER_URL || 'http://localhost:3030',
      API_BASE_URL: process.env.API_BASE_URL || 'https://usdtflasherpro.netlify.app/.netlify/functions',
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
      EMAIL_PASSWORD: process.env.EMAIL_PASSWORD
    }
  });

  // Handle Electron app exit
  electronApp.on('close', (code) => {
    console.log(`Electron app exited with code ${code}`);
    // Kill the servers when the Electron app exits
    console.log('Terminating servers...');
    socketServer.kill();
    apiServer.kill();
    process.exit(code);
  });
}, 2000); // Wait 2 seconds for the servers to start

// Handle process termination
process.on('SIGINT', () => {
  console.log('Terminating processes...');
  socketServer.kill();
  apiServer.kill();
  process.exit(0);
});
