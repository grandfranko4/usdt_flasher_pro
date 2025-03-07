const { app } = require('electron');
const path = require('path');
const fs = require('fs');
const http = require('http');
const express = require('express');
const { Server } = require('socket.io');
const dotenv = require('dotenv');

// Load environment variables
function loadEnvironmentVariables() {
  try {
    // In development mode, load from .env file
    if (fs.existsSync(path.join(__dirname, '.env'))) {
      dotenv.config({ path: path.join(__dirname, '.env') });
      console.log('Environment variables loaded from .env file');
    } 
    // In production mode, load from extraResources
    else if (process.resourcesPath) {
      const envPath = path.join(process.resourcesPath, '.env');
      if (fs.existsSync(envPath)) {
        dotenv.config({ path: envPath });
        console.log('Environment variables loaded from resources path:', envPath);
      } else {
        console.log('No .env file found in resources path:', envPath);
      }
    } else {
      console.log('No .env file found, using default environment variables.');
    }
  } catch (error) {
    console.error('Error loading environment variables:', error);
  }
}

// Start Socket.IO server
function startSocketServer() {
  console.log('Starting Socket.IO server...');
  
  // Import socket-server.js functionality
  const socketServer = require('./socket-server');
  
  // Start the server
  const PORT = process.env.SOCKET_PORT || 3030;
  socketServer.server.listen(PORT, () => {
    console.log(`Socket.IO server running on port ${PORT}`);
  });
  
  return socketServer.server;
}

// Start Electron app
function startElectronApp() {
  console.log('Starting Electron app...');
  
  // Import main.js and initialize the app
  const mainApp = require('./main');
  mainApp.initializeApp();
}

// Main function
function main() {
  // Load environment variables
  loadEnvironmentVariables();
  
  // Start Socket.IO server
  const socketServer = startSocketServer();
  
  // Wait for Electron app to be ready
  app.whenReady().then(() => {
    // Start Electron app
    startElectronApp();
    
    // Handle app quit
    app.on('will-quit', () => {
      console.log('Closing Socket.IO server...');
      socketServer.close();
    });
  });
}

// Run the main function
main();
