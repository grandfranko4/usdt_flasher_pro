/**
 * USDT FLASHER PRO - Local API Server Starter
 * 
 * This script starts the local API server for email notifications.
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
console.log(`${colors.fg.green}${colors.bright}=== USDT FLASHER PRO - Local API Server Starter ===${colors.reset}`);
console.log(`${colors.fg.yellow}This script will start the local API server for email notifications.${colors.reset}`);
console.log(`${colors.fg.yellow}Keep this terminal window open while using the application.${colors.reset}`);
console.log();

// Check if .env file exists
if (!fs.existsSync('.env')) {
  console.log(`${colors.fg.red}Error: .env file not found.${colors.reset}`);
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
    process.exit(1);
  }
}

// Read .env file
let envContent = fs.readFileSync('.env', 'utf8');
let emailPassword = '';

// Extract EMAIL_PASSWORD from .env
const emailPasswordMatch = envContent.match(/EMAIL_PASSWORD=(.+)/);
if (emailPasswordMatch) {
  emailPassword = emailPasswordMatch[1].trim();
}

// Check if EMAIL_PASSWORD is set
if (!emailPassword || emailPassword === 'your_app_password_here') {
  console.log(`${colors.fg.red}Warning: EMAIL_PASSWORD is not set in .env file.${colors.reset}`);
  console.log(`${colors.fg.yellow}Email notifications will not work without a valid EMAIL_PASSWORD.${colors.reset}`);
  console.log(`${colors.fg.yellow}You need to set up an app password for your Gmail account.${colors.reset}`);
  console.log(`${colors.fg.yellow}See https://support.google.com/accounts/answer/185833 for instructions.${colors.reset}`);
  console.log();
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  rl.question(`${colors.fg.cyan}Do you want to enter your EMAIL_PASSWORD now? (y/n) ${colors.reset}`, (answer) => {
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      rl.question(`${colors.fg.cyan}Enter your Gmail app password: ${colors.reset}`, (password) => {
        // Update .env file
        envContent = envContent.replace(/EMAIL_PASSWORD=(.*)/, `EMAIL_PASSWORD=${password.trim()}`);
        fs.writeFileSync('.env', envContent);
        console.log(`${colors.fg.green}EMAIL_PASSWORD updated in .env file.${colors.reset}`);
        rl.close();
        startApiServer();
      });
    } else {
      console.log(`${colors.fg.yellow}Continuing without EMAIL_PASSWORD. Email notifications will not work.${colors.reset}`);
      rl.close();
      startApiServer();
    }
  });
} else {
  console.log(`${colors.fg.green}EMAIL_PASSWORD is set in .env file.${colors.reset}`);
  startApiServer();
}

// Start the local API server
function startApiServer() {
  console.log(`${colors.fg.green}Starting local API server...${colors.reset}`);
  
  // Create a log file for the API server
  const logStream = fs.createWriteStream('api-server.log', { flags: 'a' });
  
  // Start the API server
  const apiServer = spawn('node', ['local-api-server.js'], {
    stdio: ['ignore', 'pipe', 'pipe']
  });
  
  // Log server output
  apiServer.stdout.pipe(logStream);
  apiServer.stderr.pipe(logStream);
  
  // Also display output in the console
  apiServer.stdout.on('data', (data) => {
    console.log(`${colors.fg.cyan}${data.toString().trim()}${colors.reset}`);
  });
  
  apiServer.stderr.on('data', (data) => {
    console.error(`${colors.fg.red}${data.toString().trim()}${colors.reset}`);
  });
  
  // Handle server exit
  apiServer.on('close', (code) => {
    console.log(`${colors.fg.red}API server exited with code ${code}${colors.reset}`);
    process.exit(code);
  });
  
  // Handle process termination
  process.on('SIGINT', () => {
    console.log(`${colors.fg.yellow}Stopping API server...${colors.reset}`);
    apiServer.kill();
    process.exit(0);
  });
  
  console.log(`${colors.fg.green}Local API server is running.${colors.reset}`);
  console.log(`${colors.fg.yellow}Keep this terminal window open while using the application.${colors.reset}`);
  console.log(`${colors.fg.yellow}Press Ctrl+C to stop the server.${colors.reset}`);
  
  // Send a test email
  setTimeout(() => {
    console.log(`${colors.fg.yellow}Sending a test email to verify the configuration...${colors.reset}`);
    const testEmail = spawn('node', ['test-email.js'], {
      stdio: ['ignore', 'pipe', 'pipe']
    });
    
    testEmail.stdout.on('data', (data) => {
      console.log(`${colors.fg.green}${data.toString().trim()}${colors.reset}`);
    });
    
    testEmail.stderr.on('data', (data) => {
      console.error(`${colors.fg.red}${data.toString().trim()}${colors.reset}`);
    });
  }, 2000);
}
