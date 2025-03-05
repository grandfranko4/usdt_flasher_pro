import React, { createContext, useContext, useState, useEffect } from 'react';
import { authenticateUser } from '../services/database';

// Create the authentication context
const AuthContext = createContext();

// Custom hook to use the auth context
export function useAuth() {
  return useContext(AuthContext);
}

// Provider component that wraps the app and makes auth object available to any child component that calls useAuth()
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Register a new user
  async function register(email, password, displayName) {
    // In a real app, this would create a new user in the database
    // For now, just simulate a successful registration
    const newUser = {
      id: Date.now(),
      email,
      displayName,
      role: 'user'
    };
    
    // Store user in local storage
    localStorage.setItem('user', JSON.stringify(newUser));
    // Create a mock token for compatibility
    localStorage.setItem('token', 'mock-token-for-development');
    
    setCurrentUser(newUser);
    setUserRole(newUser.role);
    
    return Promise.resolve(newUser);
  }

  // Login a user
  async function login(email, password) {
    try {
      console.log('AuthContext: Attempting login with email:', email);
      const result = await authenticateUser(email, password);
      console.log('AuthContext: Authentication result:', result);
      
      if (result.success) {
        console.log('AuthContext: Login successful, storing user data');
        // Store user in local storage
        localStorage.setItem('user', JSON.stringify(result.user));
        // Store the actual token from the response
        localStorage.setItem('token', result.token);
        setCurrentUser(result.user);
        setUserRole(result.user.role);
        return result.user;
      } else {
        console.error('AuthContext: Login failed:', result.message);
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      throw error;
    }
  }

  // Logout a user
  function logout() {
    localStorage.removeItem('user');
    setCurrentUser(null);
    setUserRole(null);
    return Promise.resolve();
  }

  // Reset password
  function resetPassword(email) {
    // In a real app, this would send a password reset email
    // For now, just log it
    console.log(`Password reset requested for ${email}`);
    return Promise.resolve();
  }

  // Effect for handling auth state changes
  useEffect(() => {
    // Check if user is stored in local storage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setCurrentUser(user);
      setUserRole(user.role);
    }
    
    setLoading(false);
  }, []);

  // Context value
  const value = {
    currentUser,
    userRole,
    login,
    logout,
    resetPassword,
    register
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
