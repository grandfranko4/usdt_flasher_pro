const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { validateLicenseKey, logFlashTransaction } = require('./database-service');
const constants = require('./constants');

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

// Create window when Electron has finished initialization
app.whenReady().then(() => {
  createWindow();

  // On macOS it's common to re-create a window when the dock icon is clicked
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

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
    case 'getConstants':
      handleGetConstants(event, request);
      break;
    case 'getAppSettings':
      handleGetAppSettings(event, request);
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
function handleGetAppSettings(event, request) {
  try {
    // Mock app settings for now
    const settings = {
      defaultNetwork: 'TRC20 (Tron)',
      demoMaxFlashAmount: 30,
      liveMaxFlashAmount: 10000000,
      defaultDelayDays: 0,
      defaultDelayMinutes: 0,
      walletAddress: 'TRx7NkPPwWaCYCYyB8r1E8NAYhFqrKQR4h',
      depositAmount: 100,
      transactionFee: '0.01 BTC'
    };
    
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
