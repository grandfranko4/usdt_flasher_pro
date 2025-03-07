#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

// Helper function to log with colors
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper function to ask a question and get user input
function askQuestion(question) {
  return new Promise(resolve => {
    rl.question(`${colors.cyan}${question}${colors.reset} `, answer => {
      resolve(answer);
    });
  });
}

// Main function to update environment variables
async function updateEnvVars() {
  log('\n=== USDT FLASHER PRO Web App - Update Netlify Environment Variables ===\n', colors.bright + colors.green);
  
  // Check if Netlify CLI is installed
  try {
    execSync('netlify --version', { stdio: 'ignore' });
  } catch (error) {
    log('Netlify CLI is not installed. Please install it using: npm install -g netlify-cli', colors.red);
    rl.close();
    process.exit(1);
  }
  
  // Path to the Netlify environment file
  const netlifyEnvPath = path.join(__dirname, 'netlify.env');
  
  // Check if the Netlify environment file exists
  if (!fs.existsSync(netlifyEnvPath)) {
    log(`Netlify environment file not found at: ${netlifyEnvPath}`, colors.red);
    rl.close();
    process.exit(1);
  }
  
  // Read the Netlify environment file
  const envContent = fs.readFileSync(netlifyEnvPath, 'utf8');
  
  // Parse the environment variables
  const envVars = {};
  envContent.split('\n').forEach(line => {
    // Skip empty lines and comments
    if (!line || line.startsWith('#')) return;
    
    // Split the line into key and value
    const [key, ...valueParts] = line.split('=');
    const value = valueParts.join('=');
    
    if (key && value) {
      envVars[key.trim()] = value.trim();
    }
  });
  
  // Check if there are any environment variables to update
  if (Object.keys(envVars).length === 0) {
    log('No environment variables found in netlify.env file.', colors.yellow);
    rl.close();
    process.exit(0);
  }
  
  // Check if the site is linked to Netlify
  try {
    execSync('netlify status', { stdio: 'ignore' });
  } catch (error) {
    log('You are not logged in to Netlify. Please run: netlify login', colors.red);
    rl.close();
    process.exit(1);
  }
  
  // Confirm with the user
  log('The following environment variables will be updated on Netlify:', colors.yellow);
  Object.keys(envVars).forEach(key => {
    const value = envVars[key];
    const maskedValue = value.length > 8 ? 
      `${value.substring(0, 4)}...${value.substring(value.length - 4)}` : 
      '********';
    log(`  ${key}: ${maskedValue}`, colors.cyan);
  });
  
  const confirm = await askQuestion('\nDo you want to continue? (y/n): ');
  if (confirm.toLowerCase() !== 'y' && confirm.toLowerCase() !== 'yes') {
    log('Operation cancelled by user.', colors.yellow);
    rl.close();
    process.exit(0);
  }
  
  // Update each environment variable
  log('\nUpdating Netlify environment variables...', colors.green);
  
  for (const [key, value] of Object.entries(envVars)) {
    try {
      log(`Setting ${key}...`, colors.yellow);
      execSync(`netlify env:set ${key} "${value}"`, { stdio: 'inherit' });
    } catch (error) {
      log(`Failed to set ${key}`, colors.red);
    }
  }
  
  log('\nEnvironment variables updated successfully!', colors.bright + colors.green);
  rl.close();
}

// Run the update function
updateEnvVars().catch(error => {
  log(`\nUnexpected error: ${error.message}`, colors.red);
  rl.close();
  process.exit(1);
});
