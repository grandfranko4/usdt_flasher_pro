import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Auth Context
import { AuthProvider } from './contexts/AuthContext';

// Layout
import Dashboard from './components/layout/Dashboard';

// Pages
import DashboardHome from './components/pages/DashboardHome';
import LicenseKeys from './components/pages/LicenseKeys';
import ContactInfo from './components/pages/ContactInfo';
import Settings from './components/pages/Settings';

// Auth Components
import Login from './components/auth/Login';
import ForgotPassword from './components/auth/ForgotPassword';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Create a dark theme
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00e6b8',
    },
    secondary: {
      main: '#7f8fa6',
    },
    background: {
      default: '#1a1a1a',
      paper: '#222222',
    },
    text: {
      primary: '#f5f6fa',
      secondary: '#dcdde1',
    },
  },
  typography: {
    fontFamily: '"Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarColor: "#353b48 #222222",
          "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
            backgroundColor: "#222222",
            width: 8,
          },
          "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
            borderRadius: 8,
            backgroundColor: "#353b48",
            minHeight: 24,
          },
          "&::-webkit-scrollbar-thumb:focus, & *::-webkit-scrollbar-thumb:focus": {
            backgroundColor: "#00e6b8",
          },
          "&::-webkit-scrollbar-thumb:active, & *::-webkit-scrollbar-thumb:active": {
            backgroundColor: "#00e6b8",
          },
          "&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover": {
            backgroundColor: "#00e6b8",
          },
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            
            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Dashboard />}>
                <Route index element={<DashboardHome />} />
                <Route path="license-keys" element={<LicenseKeys />} />
                <Route path="contact-info" element={<ContactInfo />} />
                <Route path="settings" element={<Settings />} />
              </Route>
            </Route>
            
            {/* Catch All Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
