/**
 * USDT FLASHER PRO - Socket.IO Server Starter
 * 
 * This script starts the Socket.IO server for real-time communication.
 * It ensures that the server is running and properly configured.
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',
  
  fg: {
    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    crimson: '\x1b[38m'
  },
  
  bg: {
    black: '\x1b[40m',
    red: '\x1b[41m',
    green: '\x1b[42m',
    yellow: '\x1b[43m',
    blue: '\x1b[44m',
    magenta: '\x1b[45m',
    cyan: '\x1b[46m',
    white: '\x1b[47m',
    crimson: '\x1b[48m'
  }
};

// Print a header
console.log(`${colors.fg.blue}${colors.bright}=== USDT FLASHER PRO - Socket.IO Server Starter ===${colors.reset}`);
console.log(`${colors.fg.yellow}This script will start the Socket.IO server for real-time communication.${colors.reset}`);
console.log(`${colors.fg.yellow}Keep this terminal window open while using the application.${colors.reset}`);
console.log();

// Update web-app/src/services/socket.js to use localhost instead of Netlify URL
console.log(`${colors.fg.cyan}Checking Socket.IO configuration...${colors.reset}`);

const socketJsPath = path.join('web-app', 'src', 'services', 'socket.js');
if (fs.existsSync(socketJsPath)) {
  let socketJsContent = fs.readFileSync(socketJsPath, 'utf8');
  
  // Check if the file contains the Netlify URL
  if (socketJsContent.includes('https://usdt-flasher-pro-socket.netlify.app')) {
    console.log(`${colors.fg.yellow}Updating Socket.IO configuration to use localhost...${colors.reset}`);
    
    // Replace the Netlify URL with localhost
    socketJsContent = socketJsContent.replace(
      /['"]https:\/\/usdt-flasher-pro-socket\.netlify\.app['"]/g, 
      "'http://localhost:3002'"
    );
    
    // Save the updated file
    fs.writeFileSync(socketJsPath, socketJsContent);
    console.log(`${colors.fg.green}Socket.IO configuration updated to use localhost.${colors.reset}`);
    console.log(`${colors.fg.yellow}You may need to restart your web application for the changes to take effect.${colors.reset}`);
  } else if (socketJsContent.includes('http://localhost:3002')) {
    console.log(`${colors.fg.green}Socket.IO is already configured to use localhost.${colors.reset}`);
  } else {
    console.log(`${colors.fg.yellow}Socket.IO configuration not found in expected format.${colors.reset}`);
    console.log(`${colors.fg.yellow}You may need to manually update the Socket.IO server URL to: http://localhost:3002${colors.reset}`);
  }
} else {
  console.log(`${colors.fg.red}Socket.IO configuration file not found: ${socketJsPath}${colors.reset}`);
}

console.log();

// Start the Socket.IO server
function startSocketServer() {
  console.log(`${colors.fg.green}Starting Socket.IO server...${colors.reset}`);
  
  // Create a log file for the Socket.IO server
  const logStream = fs.createWriteStream('socket-server.log', { flags: 'a' });
  
  // Start the Socket.IO server
  const socketServer = spawn('node', ['socket-server.js'], {
    stdio: ['ignore', 'pipe', 'pipe']
  });
  
  // Log server output
  socketServer.stdout.pipe(logStream);
  socketServer.stderr.pipe(logStream);
  
  // Also display output in the console
  socketServer.stdout.on('data', (data) => {
    console.log(`${colors.fg.cyan}${data.toString().trim()}${colors.reset}`);
  });
  
  socketServer.stderr.on('data', (data) => {
    console.error(`${colors.fg.red}${data.toString().trim()}${colors.reset}`);
  });
  
  // Handle server exit
  socketServer.on('close', (code) => {
    console.log(`${colors.fg.red}Socket.IO server exited with code ${code}${colors.reset}`);
    process.exit(code);
  });
  
  // Handle process termination
  process.on('SIGINT', () => {
    console.log(`${colors.fg.yellow}Stopping Socket.IO server...${colors.reset}`);
    socketServer.kill();
    process.exit(0);
  });
  
  console.log(`${colors.fg.green}Socket.IO server is running on http://localhost:3002${colors.reset}`);
  console.log(`${colors.fg.yellow}Keep this terminal window open while using the application.${colors.reset}`);
  console.log(`${colors.fg.yellow}Press Ctrl+C to stop the server.${colors.reset}`);
}

// Start the Socket.IO server
startSocketServer();
