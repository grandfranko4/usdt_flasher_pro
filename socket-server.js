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
const API_BASE_URL = 'https://usdtflasherpro.netlify.app/.netlify/functions';

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
    try {
      const response = await axios.get(`${API_BASE_URL}/license-keys`);
      const licenseKeys = response.data;
      
      // Find the license key
      const licenseKey = licenseKeys.find(license => license.key === data.licenseKey);
      
      if (!licenseKey) {
        socket.emit('licenseKeyValidation', { valid: false, message: 'Invalid license key' });
        return;
      }
      
      // Check if license key is active
      if (licenseKey.status !== 'active') {
        socket.emit('licenseKeyValidation', { valid: false, message: `License key is ${licenseKey.status}` });
        return;
      }
      
      // Check if license key has expired
      const expiryDate = new Date(licenseKey.expires_at || licenseKey.expiresAt);
      if (expiryDate < new Date()) {
        socket.emit('licenseKeyValidation', { valid: false, message: 'License key has expired' });
        return;
      }
      
      // Get app settings for max flash amounts
      const appSettingsResponse = await axios.get(`${API_BASE_URL}/app-settings`);
      const appSettings = appSettingsResponse.data;
      
      // Determine license type and user
      const isDemo = licenseKey.type === 'demo' || data.licenseKey === 'USDT-ABCD-1234-EFGH-5678';
      const user = isDemo ? 'test@gmail.com' : 'live@gmail.com';
      const type = isDemo ? 'demo' : 'live';
      const maxAmount = isDemo ? appSettings.demoMaxFlashAmount : appSettings.liveMaxFlashAmount;
      
      // Add license type and user to the response
      licenseKey.type = type;
      licenseKey.user = user;
      licenseKey.maxAmount = maxAmount;
      
      socket.emit('licenseKeyValidation', { valid: true, licenseKey });
    } catch (error) {
      console.error('Error validating license key:', error);
      socket.emit('licenseKeyValidation', { valid: false, message: 'Error validating license key. Please try again.' });
    }
  });
});

// Function to send initial data to a client
async function sendInitialData(socket) {
  try {
    // Fetch contact info
    const contactInfoResponse = await axios.get(`${API_BASE_URL}/contact-info`);
    const contactInfo = contactInfoResponse.data;
    
    // Fetch app settings
    const appSettingsResponse = await axios.get(`${API_BASE_URL}/app-settings`);
    const appSettings = appSettingsResponse.data;
    
    // Send data to the client
    socket.emit('initialData', {
      contactInfo,
      appSettings
    });
  } catch (error) {
    console.error('Error fetching initial data:', error);
  }
}

// Function to broadcast contact info updates to all clients
function broadcastContactInfoUpdate(contactInfo) {
  io.emit('contactInfoUpdate', contactInfo);
}

// Function to broadcast license key updates to all clients
function broadcastLicenseKeyUpdate(licenseKeys) {
  io.emit('licenseKeysUpdate', licenseKeys);
}

// Function to broadcast app settings updates to all clients
function broadcastAppSettingsUpdate(appSettings) {
  io.emit('appSettingsUpdate', appSettings);
}

// Add REST endpoints for broadcasting updates
app.post('/broadcast-contact-info', (req, res) => {
  try {
    const contactInfo = req.body;
    console.log('Received contact info update:', contactInfo);
    
    // Broadcast to all connected clients
    broadcastContactInfoUpdate(contactInfo);
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error broadcasting contact info:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/broadcast-license-keys', (req, res) => {
  try {
    const licenseKeys = req.body;
    console.log('Received license keys update:', licenseKeys);
    
    // Broadcast to all connected clients
    broadcastLicenseKeyUpdate(licenseKeys);
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error broadcasting license keys:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/broadcast-app-settings', (req, res) => {
  try {
    const appSettings = req.body;
    console.log('Received app settings update:', appSettings);
    
    // Broadcast to all connected clients
    broadcastAppSettingsUpdate(appSettings);
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error broadcasting app settings:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start the server
const PORT = process.env.SOCKET_PORT || 3030;
server.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});

// Export functions for external use
module.exports = {
  broadcastContactInfoUpdate,
  broadcastLicenseKeyUpdate,
  broadcastAppSettingsUpdate
};
