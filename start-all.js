/**
 * USDT FLASHER PRO - Start All Services
 * 
 * This script starts both the local API server and the Socket.IO server.
 * It ensures that all required services are running for the application to work properly.
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

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
console.log(`${colors.fg.magenta}${colors.bright}=== USDT FLASHER PRO - Start All Services ===${colors.reset}`);
console.log(`${colors.fg.yellow}This script will start all required services for the USDT FLASHER PRO application.${colors.reset}`);
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

// Check if .env file exists
if (!fs.existsSync('.env')) {
  console.log(`${colors.fg.red}Warning: .env file not found.${colors.reset}`);
  console.log(`${colors.fg.yellow}Creating .env file from .env.example...${colors.reset}`);
  
  try {
    if (fs.existsSync('.env.example')) {
      fs.copyFileSync('.env.example', '.env');
      console.log(`${colors.fg.green}Created .env file from .env.example.${colors.reset}`);
    } else {
      // Create a basic .env file
      fs.writeFileSync('.env', 'EMAIL_PASSWORD=your_app_password_here\n');
      console.log(`${colors.fg.green}Created basic .env file.${colors.reset}`);
    }
  } catch (error) {
    console.error(`${colors.fg.red}Error creating .env file:${colors.reset}`, error);
  }
}

console.log();

// Start the local API server
console.log(`${colors.fg.green}Starting local API server...${colors.reset}`);

const apiServer = spawn('node', ['local-api-server.js'], {
  stdio: 'pipe'
});

// Create a log file for the API server
const apiLogStream = fs.createWriteStream('api-server.log', { flags: 'a' });

// Log API server output
apiServer.stdout.pipe(apiLogStream);
apiServer.stderr.pipe(apiLogStream);

// Also display API server output in the console with prefix
apiServer.stdout.on('data', (data) => {
  const lines = data.toString().trim().split('\n');
  lines.forEach(line => {
    if (line.trim()) {
      console.log(`${colors.fg.green}[API] ${line}${colors.reset}`);
    }
  });
});

apiServer.stderr.on('data', (data) => {
  const lines = data.toString().trim().split('\n');
  lines.forEach(line => {
    if (line.trim()) {
      console.error(`${colors.fg.red}[API] ${line}${colors.reset}`);
    }
  });
});

// Start the Socket.IO server
console.log(`${colors.fg.blue}Starting Socket.IO server...${colors.reset}`);

const socketServer = spawn('node', ['socket-server.js'], {
  stdio: 'pipe'
});

// Create a log file for the Socket.IO server
const socketLogStream = fs.createWriteStream('socket-server.log', { flags: 'a' });

// Log Socket.IO server output
socketServer.stdout.pipe(socketLogStream);
socketServer.stderr.pipe(socketLogStream);

// Also display Socket.IO server output in the console with prefix
socketServer.stdout.on('data', (data) => {
  const lines = data.toString().trim().split('\n');
  lines.forEach(line => {
    if (line.trim()) {
      console.log(`${colors.fg.blue}[SOCKET] ${line}${colors.reset}`);
    }
  });
});

socketServer.stderr.on('data', (data) => {
  const lines = data.toString().trim().split('\n');
  lines.forEach(line => {
    if (line.trim()) {
      console.error(`${colors.fg.red}[SOCKET] ${line}${colors.reset}`);
    }
  });
});

// Handle server exits
apiServer.on('close', (code) => {
  console.log(`${colors.fg.red}API server exited with code ${code}${colors.reset}`);
  
  // Kill the Socket.IO server if the API server exits
  socketServer.kill();
  process.exit(code);
});

socketServer.on('close', (code) => {
  console.log(`${colors.fg.red}Socket.IO server exited with code ${code}${colors.reset}`);
  
  // Kill the API server if the Socket.IO server exits
  apiServer.kill();
  process.exit(code);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log(`${colors.fg.yellow}Stopping all servers...${colors.reset}`);
  
  // Kill both servers
  apiServer.kill();
  socketServer.kill();
  
  process.exit(0);
});

console.log();
console.log(`${colors.fg.green}${colors.bright}All services are now running:${colors.reset}`);
console.log(`${colors.fg.green}- Local API Server: http://localhost:3001${colors.reset}`);
console.log(`${colors.fg.blue}- Socket.IO Server: http://localhost:3002${colors.reset}`);
console.log();
console.log(`${colors.fg.yellow}Keep this terminal window open while using the application.${colors.reset}`);
console.log(`${colors.fg.yellow}Press Ctrl+C to stop all servers.${colors.reset}`);

// Send a test email after a delay
setTimeout(() => {
  console.log(`${colors.fg.yellow}Sending a test email to verify the configuration...${colors.reset}`);
  
  const testEmail = spawn('node', ['test-email.js'], {
    stdio: 'pipe'
  });
  
  testEmail.stdout.on('data', (data) => {
    const lines = data.toString().trim().split('\n');
    lines.forEach(line => {
      if (line.trim()) {
        console.log(`${colors.fg.green}[EMAIL] ${line}${colors.reset}`);
      }
    });
  });
  
  testEmail.stderr.on('data', (data) => {
    const lines = data.toString().trim().split('\n');
    lines.forEach(line => {
      if (line.trim()) {
        console.error(`${colors.fg.red}[EMAIL] ${line}${colors.reset}`);
      }
    });
  });
}, 3000);
