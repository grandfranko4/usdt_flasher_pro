// This file has been refactored to remove socket dependencies
// and use direct API calls instead
import supabaseService from './supabase';

// Cached data (used when API is unavailable)
let cachedContactInfo = null;
let cachedAppSettings = null;

// Connect to API server and fetch initial data
export const connectToAPIServer = async (callbacks = {}) => {
  console.log('Fetching data from API server');
  
  try {
    // Fetch contact info and app settings in parallel
    const [contactInfo, appSettings] = await Promise.all([
      supabaseService.fetchContactInfo(),
      supabaseService.fetchAppSettings()
    ]);
    
    // Cache the data
    cachedContactInfo = contactInfo;
    cachedAppSettings = appSettings;
    
    // Send data to the client
    if (callbacks.onContactInfoUpdate) {
      callbacks.onContactInfoUpdate(contactInfo);
    }
    if (callbacks.onAppSettingsUpdate) {
      callbacks.onAppSettingsUpdate(appSettings);
    }
    if (callbacks.onInitialData) {
      callbacks.onInitialData({
        contactInfo,
        appSettings
      });
    }
    
    console.log('Successfully fetched data from API server');
    return true;
  } catch (error) {
    console.error('Error fetching data from API server:', error);
    
    // Use cached data if available
    if (cachedContactInfo && callbacks.onContactInfoUpdate) {
      callbacks.onContactInfoUpdate(cachedContactInfo);
    }
    if (cachedAppSettings && callbacks.onAppSettingsUpdate) {
      callbacks.onAppSettingsUpdate(cachedAppSettings);
    }
    if (callbacks.onInitialData) {
      callbacks.onInitialData({
        contactInfo: cachedContactInfo,
        appSettings: cachedAppSettings
      });
    }
    
    if (callbacks.onError) {
      callbacks.onError(error);
    }
    return false;
  }
};

// Disconnect function (kept for API compatibility)
export const disconnectFromSocketServer = () => {
  console.log('No active socket connection to disconnect');
  return true;
};

// Send message function (kept for API compatibility)
export const sendMessage = (event, data) => {
  console.log('Socket messaging disabled, using direct API calls instead');
  return false;
};

// Validate license key directly via API
export const validateLicenseKeyViaAPI = async (licenseKey) => {
  console.log('Validating license key via API:', licenseKey);
  
  try {
      // First try to validate via local API server to trigger email notification
      try {
        // Use local API server URL
        const apiUrl = `http://localhost:3001/validate-license?key=${encodeURIComponent(licenseKey)}`;
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add timeout to prevent hanging if server is not responding
        signal: AbortSignal.timeout(5000)
      });
      
      if (response.ok) {
        const apiResult = await response.json();
        console.log('License validated via Netlify function:', apiResult);
        return apiResult;
      }
    } catch (fetchError) {
      console.error('Failed to connect to Netlify API server:', fetchError);
      // Fall back to Supabase if API fails
    }
    
    // Fallback: Use Supabase service to validate the license key
    const result = await supabaseService.validateLicenseKey(licenseKey);
    
    // If validation is successful, send license login notification
    if (result.valid) {
      try {
        const licenseData = {
          key: licenseKey,
          user: result.licenseKey.user || 'Unknown',
          type: result.licenseKey.type || 'Unknown',
          timestamp: new Date().toISOString()
        };
        
        // Log the license data to console
        console.log('LICENSE LOGIN NOTIFICATION:', licenseData);
        
        // Try to send license login notification via API
        try {
          const apiUrl = '/.netlify/functions/api/license-login-notification';
          
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(licenseData),
            // Add timeout to prevent hanging if server is not responding
            signal: AbortSignal.timeout(5000)
          });
          
          if (response.ok) {
            console.log('License login notification sent successfully');
          } else {
            console.error('Error sending license login notification:', await response.text());
          }
        } catch (fetchError) {
          console.error('Failed to connect to API server for license notification:', fetchError);
        }
      } catch (emailError) {
        console.error('Error handling license login notification:', emailError);
        // Continue even if notification handling fails
      }
    }
    
    return result;
  } catch (error) {
    console.error('Error validating license key:', error);
    
    // For demo purposes, accept any license key that follows a valid format
    if (licenseKey.match(/^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/)) {
      const isDemo = licenseKey.includes('DEMO') || licenseKey.includes('TEST');
      const newKey = {
        id: Date.now(),
        key: licenseKey,
        status: 'active',
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        user: isDemo ? 'test@gmail.com' : 'live@gmail.com',
        type: isDemo ? 'demo' : 'live',
        maxAmount: isDemo ? 30 : 10000000
      };
      
      console.log('Created new license key for fallback validation:', newKey);
      return { valid: true, licenseKey: newKey };
    } else {
      console.log('Invalid license key format:', licenseKey);
      return { valid: false, message: 'Invalid license key' };
    }
  }
};

// Create API service object
const apiService = {
  connectToAPIServer,
  disconnectFromSocketServer, // Kept for API compatibility
  sendMessage, // Kept for API compatibility
  validateLicenseKeyViaAPI
};

// Export the apiService object as default
export default apiService;
