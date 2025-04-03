const { spawn } = require('child_process');
const path = require('path');

// Start the socket server
console.log('Starting Socket.IO server...');
const socketServer = spawn('node', ['socket-server.js'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    API_BASE_URL: 'http://localhost:3001'
  }
});

// Start the local API server
console.log('Starting local API server...');
const apiServer = spawn('node', ['local-api-server.js'], {
  stdio: 'inherit'
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('Shutting down servers...');
  socketServer.kill();
  apiServer.kill();
  process.exit(0);
});

console.log('Services started successfully!');
console.log('Socket.IO server running on port 3030');
console.log('Local API server running on port 3001');
console.log('Press Ctrl+C to stop the servers');
