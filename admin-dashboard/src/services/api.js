// API service using browser's fetch API

// Base URL for API requests
// First try the local API server, then fall back to Netlify functions
const getBaseURL = () => {
  if (process.env.NODE_ENV === 'production') {
    // In production, use the Netlify functions
    return '/.netlify/functions';
  } else {
    // In development, try the local API server first
    return 'http://localhost:3001';
  }
};

const baseURL = getBaseURL();

// Helper function to handle API requests
const apiRequest = async (endpoint, options = {}) => {
  // Get the session from localStorage
  const session = JSON.parse(localStorage.getItem('supabaseSession') || 'null');
  const token = session?.access_token;
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  const config = {
    ...options,
    headers,
    credentials: 'include'
  };
  
  try {
    const apiUrl = `${baseURL}${endpoint}`;
    console.log(`Making API request to: ${apiUrl}`);
    
    const response = await fetch(apiUrl, config);
    console.log(`API response status: ${response.status}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.error || `API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    return data;
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
      return data;
    } else {
      // If the server returned a failure response with a message
      const errorMessage = data.message || 'Authentication failed';
      console.error('Login failed:', errorMessage);
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error('Login error:', error);
    // Rethrow the error with a more descriptive message if needed
    if (!error.message || error.message === 'Failed to fetch') {
      throw new Error('Network error: Unable to connect to authentication server');
    }
    throw error;
  }
};

// License Keys
export const fetchLicenseKeys = async () => {
  try {
    const response = await apiRequest('/license-keys');
    
    // Ensure we always return an array
    if (Array.isArray(response)) {
      return response;
    } else if (response && typeof response === 'object') {
      // If it's a single object, wrap it in an array
      return [response];
    } else {
      console.warn('License keys response is not valid:', response);
      return [];
    }
  } catch (error) {
    console.error('Error fetching license keys:', error);
    // Return empty array instead of throwing to prevent UI errors
    return [];
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
    const response = await apiRequest('/contact-info');
    return response || {};
  } catch (error) {
    console.error('Error fetching contact info:', error);
    return {};
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
    const response = await apiRequest('/contact-info/history');
    // Ensure we always return an array
    if (Array.isArray(response)) {
      return response;
    } else if (response && typeof response === 'object') {
      // If it's a single object, wrap it in an array
      return [response];
    } else {
      console.warn('Contact history response is not valid:', response);
      return [];
    }
  } catch (error) {
    console.error('Error fetching contact history:', error);
    return [];
  }
};

// App Settings
export const fetchAppSettings = async () => {
  try {
    const response = await apiRequest('/app-settings');
    return response || {};
  } catch (error) {
    console.error('Error fetching app settings:', error);
    return {};
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
    const response = await apiRequest(`/flash-history/${licenseKeyId}`);
    // Ensure we always return an array
    if (Array.isArray(response)) {
      return response;
    } else if (response && typeof response === 'object') {
      // If it's a single object, wrap it in an array
      return [response];
    } else {
      console.warn('Flash history response is not valid:', response);
      return [];
    }
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
