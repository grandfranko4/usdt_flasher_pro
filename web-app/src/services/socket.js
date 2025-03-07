import { io } from 'socket.io-client';

// Socket.IO client
let socket = null;
const SOCKET_SERVER_URL = process.env.REACT_APP_SOCKET_SERVER_URL || 'http://localhost:3030';

// Connect to Socket.IO server
export const connectToSocketServer = (callbacks = {}) => {
  try {
    console.log(`Connecting to Socket.IO server at ${SOCKET_SERVER_URL}`);
    socket = io(SOCKET_SERVER_URL);
    
    // Handle connection events
    socket.on('connect', () => {
      console.log('Connected to Socket.IO server');
      if (callbacks.onConnect) {
        callbacks.onConnect();
      }
    });
    
    socket.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server');
      if (callbacks.onDisconnect) {
        callbacks.onDisconnect();
      }
      
      // Try to reconnect after a delay
      setTimeout(() => {
        if (socket && socket.disconnected) {
          console.log('Attempting to reconnect to Socket.IO server');
          socket.connect();
        }
      }, 5000);
    });
    
    socket.on('error', (error) => {
      console.error('Socket.IO error:', error);
      if (callbacks.onError) {
        callbacks.onError(error);
      }
    });
    
    // Handle data updates
    socket.on('contactInfoUpdate', (contactInfo) => {
      console.log('Received contact info update from Socket.IO server:', contactInfo);
      if (callbacks.onContactInfoUpdate) {
        callbacks.onContactInfoUpdate(contactInfo);
      }
    });
    
    socket.on('licenseKeysUpdate', (licenseKeys) => {
      console.log('Received license keys update from Socket.IO server');
      if (callbacks.onLicenseKeysUpdate) {
        callbacks.onLicenseKeysUpdate(licenseKeys);
      }
    });
    
    socket.on('appSettingsUpdate', (appSettings) => {
      console.log('Received app settings update from Socket.IO server');
      if (callbacks.onAppSettingsUpdate) {
        callbacks.onAppSettingsUpdate(appSettings);
      }
    });
    
    socket.on('initialData', (data) => {
      console.log('Received initial data from Socket.IO server');
      if (callbacks.onInitialData) {
        callbacks.onInitialData(data);
      }
    });
    
    return socket;
  } catch (error) {
    console.error('Error connecting to Socket.IO server:', error);
    if (callbacks.onError) {
      callbacks.onError(error);
    }
    return null;
  }
};

// Disconnect from Socket.IO server
export const disconnectFromSocketServer = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('Disconnected from Socket.IO server');
  }
};

// Send a message to the Socket.IO server
export const sendMessage = (event, data) => {
  if (socket && socket.connected) {
    socket.emit(event, data);
    return true;
  } else {
    console.error('Socket not connected, cannot send message');
    return false;
  }
};

// Validate license key using Socket.IO
export const validateLicenseKeyViaSocket = (licenseKey) => {
  return new Promise((resolve, reject) => {
    if (!socket || !socket.connected) {
      reject(new Error('Socket not connected'));
      return;
    }
    
    // Set up a one-time listener for the validation response
    socket.once('licenseKeyValidation', (result) => {
      console.log('Received license key validation response from socket:', result);
      resolve(result);
    });
    
    // Send validation request
    socket.emit('validateLicenseKey', { licenseKey });
    console.log('Sent license key validation request to socket');
    
    // Set a timeout in case the server doesn't respond
    setTimeout(() => {
      // Remove the listener to avoid memory leaks
      socket.off('licenseKeyValidation');
      reject(new Error('Socket timeout, server did not respond'));
    }, 10000);
  });
};

// Create Socket.IO service object
const socketService = {
  connectToSocketServer,
  disconnectFromSocketServer,
  sendMessage,
  validateLicenseKeyViaSocket
};

// Export the socketService object as default
export default socketService;
