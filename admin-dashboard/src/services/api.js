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
    // First try the local API server
    let apiUrl = `${baseURL}${endpoint}`;
    console.log(`Making API request to: ${apiUrl}`);
    
    try {
      // Make the API request
      const response = await fetch(apiUrl, config);
      
      console.log(`API response status: ${response.status}`);
      
      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        
        console.log(`API response data:`, data);
        
        if (!response.ok) {
          // If the server returned a JSON error response, use that message
          const errorMessage = data.error || data.message || 'API request failed';
          throw new Error(errorMessage);
        }
        
        return data;
      } else {
        if (!response.ok) {
          // For non-JSON error responses, include the status code
          throw new Error(`API request failed with status ${response.status}`);
        }
        
        const textResponse = await response.text();
        console.log(`API text response:`, textResponse);
        
        // Try to parse the text as JSON if it looks like JSON
        if (textResponse.trim().startsWith('{') || textResponse.trim().startsWith('[')) {
          try {
            return JSON.parse(textResponse);
          } catch (e) {
            console.warn('Failed to parse text response as JSON:', e);
            // Fall back to returning the text if parsing fails
          }
        }
        
        // If we're in development and got an HTML response, it might be because the local API server
        // is not running. Try the Netlify functions as a fallback.
        if (process.env.NODE_ENV !== 'production' && textResponse.includes('<!doctype html>')) {
          throw new Error('Local API server returned HTML, trying Netlify functions');
        }
        
        return textResponse;
      }
    } catch (error) {
      // If we're in development and the local API server failed, try the Netlify functions
      if (process.env.NODE_ENV !== 'production') {
        console.log('Local API server failed, trying Netlify functions');
        
        // Try the Netlify functions
        apiUrl = `http://localhost:8888/.netlify/functions${endpoint}`;
        console.log(`Making API request to: ${apiUrl}`);
        
        const response = await fetch(apiUrl, config);
        
        console.log(`API response status: ${response.status}`);
        
        // Handle non-JSON responses
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          
          console.log(`API response data:`, data);
          
          if (!response.ok) {
            // If the server returned a JSON error response, use that message
            const errorMessage = data.error || data.message || 'API request failed';
            throw new Error(errorMessage);
          }
          
          return data;
        } else {
          if (!response.ok) {
            // For non-JSON error responses, include the status code
            throw new Error(`API request failed with status ${response.status}`);
          }
          
          const textResponse = await response.text();
          console.log(`API text response:`, textResponse);
          
          // Try to parse the text as JSON if it looks like JSON
          if (textResponse.trim().startsWith('{') || textResponse.trim().startsWith('[')) {
            try {
              return JSON.parse(textResponse);
            } catch (e) {
              console.warn('Failed to parse text response as JSON:', e);
              // Fall back to returning the text if parsing fails
            }
          }
          
          return textResponse;
        }
      } else {
        // In production, just rethrow the error
        throw error;
      }
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
