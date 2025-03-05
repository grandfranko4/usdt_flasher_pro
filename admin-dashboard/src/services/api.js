// API service using browser's fetch API

// Base URL for API requests
const baseURL = process.env.NODE_ENV === 'production' 
  ? '/.netlify/functions'
  : 'http://localhost:8888/.netlify/functions';

// Helper function to handle API requests
const apiRequest = async (endpoint, options = {}) => {
  // Add auth token to headers if available
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  if (user && token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  const config = {
    ...options,
    headers
  };
  
  try {
    const response = await fetch(`${baseURL}${endpoint}`, config);
    
    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'API request failed');
      }
      
      return data;
    } else {
      if (!response.ok) {
        throw new Error('API request failed');
      }
      
      return await response.text();
    }
  } catch (error) {
    console.error(`API request error: ${endpoint}`, error);
    throw error;
  }
};

// Authentication
export const login = async (email, password) => {
  try {
    const data = await apiRequest('/auth', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    
    if (data.success) {
      // Store token in localStorage
      localStorage.setItem('token', data.token);
    }
    
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// License Keys
export const fetchLicenseKeys = async () => {
  try {
    return await apiRequest('/license-keys');
  } catch (error) {
    console.error('Error fetching license keys:', error);
    throw error;
  }
};

export const fetchLicenseKey = async (id) => {
  try {
    return await apiRequest(`/license-keys/${id}`);
  } catch (error) {
    console.error('Error fetching license key:', error);
    throw error;
  }
};

export const addLicenseKey = async (licenseData) => {
  try {
    return await apiRequest('/license-keys', {
      method: 'POST',
      body: JSON.stringify(licenseData)
    });
  } catch (error) {
    console.error('Error adding license key:', error);
    throw error;
  }
};

export const editLicenseKey = async (id, licenseData) => {
  try {
    return await apiRequest(`/license-keys/${id}`, {
      method: 'PUT',
      body: JSON.stringify(licenseData)
    });
  } catch (error) {
    console.error('Error updating license key:', error);
    throw error;
  }
};

export const removeLicenseKey = async (id) => {
  try {
    await apiRequest(`/license-keys/${id}`, {
      method: 'DELETE'
    });
    return id;
  } catch (error) {
    console.error('Error deleting license key:', error);
    throw error;
  }
};

// Contact Information
export const fetchContactInfo = async () => {
  try {
    return await apiRequest('/contact-info');
  } catch (error) {
    console.error('Error fetching contact info:', error);
    throw error;
  }
};

export const saveContactInfo = async (contactData) => {
  try {
    return await apiRequest('/contact-info', {
      method: 'POST',
      body: JSON.stringify(contactData)
    });
  } catch (error) {
    console.error('Error saving contact info:', error);
    throw error;
  }
};

export const fetchContactHistory = async () => {
  try {
    return await apiRequest('/contact-info/history');
  } catch (error) {
    console.error('Error fetching contact history:', error);
    throw error;
  }
};

// App Settings
export const fetchAppSettings = async () => {
  try {
    return await apiRequest('/app-settings');
  } catch (error) {
    console.error('Error fetching app settings:', error);
    throw error;
  }
};

export const saveAppSettings = async (settingsData) => {
  try {
    return await apiRequest('/app-settings', {
      method: 'POST',
      body: JSON.stringify(settingsData)
    });
  } catch (error) {
    console.error('Error saving app settings:', error);
    throw error;
  }
};

// Flash Transactions
export const fetchFlashHistory = async (licenseKeyId) => {
  try {
    return await apiRequest(`/flash-history/${licenseKeyId}`);
  } catch (error) {
    console.error('Error fetching flash history:', error);
    return [];
  }
};

// Generate a random license key
export const generateLicenseKey = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  
  // Format: XXXX-XXXX-XXXX-XXXX
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    if (i < 3) result += '-';
  }
  
  return result;
};

// Initialize database
export const initializeDatabase = async (initKey) => {
  try {
    return await apiRequest('/initialize-db', {
      method: 'POST',
      body: JSON.stringify({ initKey })
    });
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

// Create API object before exporting as default
const apiService = {
  login,
  fetchLicenseKeys,
  fetchLicenseKey,
  addLicenseKey,
  editLicenseKey,
  removeLicenseKey,
  fetchContactInfo,
  saveContactInfo,
  fetchContactHistory,
  fetchAppSettings,
  saveAppSettings,
  fetchFlashHistory,
  generateLicenseKey,
  initializeDatabase
};

// Export the apiService object as default
export default apiService;
