#!/usr/bin/env node
const { execSync } = require('child_process');

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

// Helper function to execute commands
function runCommand(command) {
  log(`\n${colors.bright}${colors.cyan}Running: ${command}${colors.reset}\n`);
  try {
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    log(`\n${colors.red}Command failed: ${command}${colors.reset}\n`, colors.red);
    return false;
  }
}

// Main deployment function
async function deploy() {
  log('\n=== USDT FLASHER PRO Web App Deployment ===\n', colors.bright + colors.green);
  
  // Step 1: Install dependencies
  log('Step 1: Installing dependencies...', colors.yellow);
  if (!runCommand('npm install')) {
    log('Failed to install dependencies. Aborting deployment.', colors.red);
    process.exit(1);
  }
  
  // Step 2: Build the project
  log('Step 2: Building the project...', colors.yellow);
  if (!runCommand('npm run build')) {
    log('Failed to build the project. Aborting deployment.', colors.red);
    process.exit(1);
  }
  
  // Step 3: Deploy to Netlify
  log('Step 3: Deploying to Netlify...', colors.yellow);
  log('Note: If this is your first deployment, you will be prompted to create or link to a site.', colors.cyan);
  
  if (!runCommand('netlify deploy --prod')) {
    log('Deployment failed. Please check the error messages above.', colors.red);
    process.exit(1);
  }
  
  log('\n=== Deployment completed successfully! ===\n', colors.bright + colors.green);
  log('Your USDT FLASHER PRO Web App is now live on Netlify.', colors.green);
  log('\nTo update environment variables on Netlify, run:', colors.cyan);
  log('npm run update-env', colors.yellow);
}

// Run the deployment
deploy().catch(error => {
  log(`\nUnexpected error: ${error.message}`, colors.red);
  process.exit(1);
});
