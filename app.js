// This file serves as the entry point for DigitalOcean App Platform
// It simply requires and runs the socket-server.js file

console.log('Starting USDT FLASHER PRO Socket.IO server...');
console.log('Current directory:', process.cwd());
console.log('Files in current directory:', require('fs').readdirSync('.'));

try {
  // Try to require the socket-server.js file
  require('./socket-server.js');
  console.log('Successfully loaded socket-server.js');
} catch (error) {
  console.error('Error loading socket-server.js:', error);
  
  // If the file is not found, try to find it in the current directory
  console.log('Searching for socket-server.js in the current directory...');
  const files = require('fs').readdirSync('.');
  const socketServerFile = files.find(file => file.includes('socket-server'));
  
  if (socketServerFile) {
    console.log('Found socket server file:', socketServerFile);
    try {
      require(`./${socketServerFile}`);
      console.log('Successfully loaded', socketServerFile);
    } catch (innerError) {
      console.error(`Error loading ${socketServerFile}:`, innerError);
      process.exit(1);
    }
  } else {
    console.error('Could not find socket-server.js or any similar file in the current directory');
    process.exit(1);
  }
}
