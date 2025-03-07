import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './styles.css';

// Services
import supabaseService from './services/supabase';
import socketService from './services/socket';

// Components
import LicensePage from './components/auth/LicensePage';
import Dashboard from './components/layout/Dashboard';
import CreateFlash from './components/pages/CreateFlash';
import FlashHistory from './components/pages/FlashHistory';
import Support from './components/pages/Support';

// Context
import { AppProvider } from './contexts/AppContext';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [licenseKey, setLicenseKey] = useState(null);
  const [contactInfo, setContactInfo] = useState(null);
  const [appSettings, setAppSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize app
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check if user is already authenticated (license key in localStorage)
        const storedLicenseKey = localStorage.getItem('licenseKey');
        if (storedLicenseKey) {
          // Validate license key
          const result = await supabaseService.validateLicenseKey(storedLicenseKey);
          if (result.valid) {
            setLicenseKey(result.licenseKey);
            setIsAuthenticated(true);
          } else {
            // Clear invalid license key
            localStorage.removeItem('licenseKey');
          }
        }

        // Fetch contact info and app settings
        const [contactInfoData, appSettingsData] = await Promise.all([
          supabaseService.fetchContactInfo(),
          supabaseService.fetchAppSettings()
        ]);

        setContactInfo(contactInfoData);
        setAppSettings(appSettingsData);

        // Connect to Socket.IO server
        socketService.connectToSocketServer({
          onContactInfoUpdate: (data) => setContactInfo(data),
          onAppSettingsUpdate: (data) => setAppSettings(data),
          onLicenseKeysUpdate: () => {
            // Re-validate license key if it exists
            if (licenseKey) {
              supabaseService.validateLicenseKey(licenseKey.key)
                .then(result => {
                  if (result.valid) {
                    setLicenseKey(result.licenseKey);
                  } else {
                    // License key is no longer valid
                    setIsAuthenticated(false);
                    localStorage.removeItem('licenseKey');
                  }
                });
            }
          }
        });
      } catch (error) {
        console.error('Error initializing app:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeApp();

    // Cleanup on unmount
    return () => {
      socketService.disconnectFromSocketServer();
    };
  }, [licenseKey]);

  // Handle license key validation
  const handleLicenseKeyValidation = async (key) => {
    try {
      const result = await supabaseService.validateLicenseKey(key);
      if (result.valid) {
        setLicenseKey(result.licenseKey);
        setIsAuthenticated(true);
        localStorage.setItem('licenseKey', key);
        
        // The email notification is now handled on the server side
        // in the API endpoint that validates the license key
        
        return { success: true };
      } else {
        return { success: false, message: result.message };
      }
    } catch (error) {
      console.error('Error validating license key:', error);
      return { success: false, message: 'Error validating license key. Please try again.' };
    }
  };

  // Handle logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    setLicenseKey(null);
    localStorage.removeItem('licenseKey');
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <AppProvider value={{ licenseKey, contactInfo, appSettings, onLogout: handleLogout }}>
      <Router>
        <Routes>
          <Route 
            path="/" 
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" />
              ) : (
                <LicensePage 
                  onValidateLicenseKey={handleLicenseKeyValidation} 
                  contactInfo={contactInfo}
                />
              )
            } 
          />
          <Route 
            path="/dashboard/*" 
            element={
              isAuthenticated ? (
                <Dashboard>
                  <Routes>
                    <Route path="/" element={<CreateFlash />} />
                    <Route path="/history" element={<FlashHistory />} />
                    <Route path="/support" element={<Support />} />
                  </Routes>
                </Dashboard>
              ) : (
                <Navigate to="/" />
              )
            } 
          />
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;
