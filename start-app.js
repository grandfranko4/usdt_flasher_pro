const { spawn } = require('child_process');
const path = require('path');

// Start the Socket.IO server
console.log('Starting Socket.IO server...');
const socketServer = spawn('node', ['socket-server.js'], {
  stdio: 'inherit',
  shell: true
});

// Wait for the Socket.IO server to start
setTimeout(() => {
  // Start the Electron app
  console.log('Starting Electron app...');
  const electronApp = spawn('electron', ['.'], {
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      SOCKET_SERVER_URL: 'http://localhost:3030'
    }
  });

  // Handle Electron app exit
  electronApp.on('close', (code) => {
    console.log(`Electron app exited with code ${code}`);
    // Kill the Socket.IO server when the Electron app exits
    socketServer.kill();
    process.exit(code);
  });
}, 2000); // Wait 2 seconds for the Socket.IO server to start

// Handle process termination
process.on('SIGINT', () => {
  console.log('Terminating processes...');
  socketServer.kill();
  process.exit(0);
});
