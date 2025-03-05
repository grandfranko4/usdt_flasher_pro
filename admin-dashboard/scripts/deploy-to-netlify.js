#!/usr/bin/env node

/**
 * This script helps deploy the USDT FLASHER PRO Admin Dashboard to Netlify.
 * It guides the user through the process of setting up a FaunaDB database and
 * deploying the admin dashboard to Netlify.
 */

const readline = require('readline');
const { execSync } = require('child_process');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper function to ask questions
const question = (query) => new Promise((resolve) => rl.question(query, resolve));

// Helper function to generate random string
const generateRandomString = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

// Helper function to check if a command exists
const commandExists = (command) => {
  try {
    execSync(`which ${command}`, { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
};

// Main function
async function main() {
  console.log('\n=== USDT FLASHER PRO Admin Dashboard Deployment ===\n');
  
  // Check if Netlify CLI is installed
  if (!commandExists('netlify')) {
    console.log('Netlify CLI is not installed. Installing...');
    try {
      execSync('npm install -g netlify-cli', { stdio: 'inherit' });
      console.log('Netlify CLI installed successfully.');
    } catch (error) {
      console.error('Failed to install Netlify CLI. Please install it manually with: npm install -g netlify-cli');
      process.exit(1);
    }
  }
  
  // Check if user is logged in to Netlify
  try {
    execSync('netlify status', { stdio: 'ignore' });
  } catch (error) {
    console.log('You need to log in to Netlify first.');
    execSync('netlify login', { stdio: 'inherit' });
  }
  
  // Generate environment variables
  const jwtSecret = generateRandomString();
  const initKey = generateRandomString();
  
  console.log('\n=== FaunaDB Setup ===\n');
  console.log('You need to create a FaunaDB database and get a secret key.');
  console.log('1. Go to https://dashboard.fauna.com/');
  console.log('2. Sign up or log in');
  console.log('3. Create a new database');
  console.log('4. Go to Security > Keys');
  console.log('5. Create a new server key');
  console.log('6. Copy the secret key');
  
  const faunaSecretKey = await question('\nEnter your FaunaDB secret key: ');
  
  if (!faunaSecretKey) {
    console.error('FaunaDB secret key is required.');
    process.exit(1);
  }
  
  // Create .env file
  const envContent = `FAUNA_SECRET_KEY=${faunaSecretKey}
JWT_SECRET=${jwtSecret}
INIT_KEY=${initKey}`;
  
  fs.writeFileSync(path.join(process.cwd(), '.env'), envContent);
  console.log('\n.env file created successfully.');
  
  // Create netlify.env file for environment variables
  const netlifyEnvContent = `[build.environment]
  FAUNA_SECRET_KEY = "${faunaSecretKey}"
  JWT_SECRET = "${jwtSecret}"
  INIT_KEY = "${initKey}"`;
  
  fs.writeFileSync(path.join(process.cwd(), 'netlify.env'), netlifyEnvContent);
  console.log('netlify.env file created successfully.');
  
  // Initialize Netlify site
  console.log('\n=== Netlify Site Setup ===\n');
  console.log('Initializing Netlify site...');
  
  try {
    execSync('netlify sites:create --name usdt-flasher-pro-admin', { stdio: 'inherit' });
  } catch (error) {
    console.log('Site creation failed. You might already have a site or need to choose a different name.');
    const createSite = await question('Do you want to try with a different name? (y/n): ');
    
    if (createSite.toLowerCase() === 'y') {
      const siteName = await question('Enter a new site name: ');
      execSync(`netlify sites:create --name ${siteName}`, { stdio: 'inherit' });
    } else {
      console.log('Using existing site...');
    }
  }
  
  // Link to Netlify site
  console.log('\nLinking to Netlify site...');
  execSync('netlify link', { stdio: 'inherit' });
  
  // Set environment variables
  console.log('\nSetting environment variables...');
  execSync(`netlify env:import netlify.env`, { stdio: 'inherit' });
  
  // Build and deploy
  console.log('\n=== Build and Deploy ===\n');
  const deployNow = await question('Do you want to build and deploy now? (y/n): ');
  
  if (deployNow.toLowerCase() === 'y') {
    console.log('\nBuilding and deploying...');
    execSync('npm run build', { stdio: 'inherit' });
    execSync('netlify deploy --prod', { stdio: 'inherit' });
    
    console.log('\n=== Database Initialization ===\n');
    console.log('After deployment, you need to initialize the database.');
    console.log(`Use the following command to initialize the database:`);
    console.log(`\ncurl -X POST https://YOUR-NETLIFY-SITE.netlify.app/.netlify/functions/initialize-db \\
  -H "Content-Type: application/json" \\
  -d '{"initKey":"${initKey}"}'`);
    
    console.log('\nReplace YOUR-NETLIFY-SITE with your actual Netlify site name.');
  } else {
    console.log('\nYou can deploy later with the following commands:');
    console.log('npm run build');
    console.log('netlify deploy --prod');
    
    console.log('\nAfter deployment, initialize the database with:');
    console.log(`curl -X POST https://YOUR-NETLIFY-SITE.netlify.app/.netlify/functions/initialize-db \\
  -H "Content-Type: application/json" \\
  -d '{"initKey":"${initKey}"}'`);
  }
  
  console.log('\n=== Deployment Information ===\n');
  console.log('Your environment variables:');
  console.log(`FAUNA_SECRET_KEY: ${faunaSecretKey}`);
  console.log(`JWT_SECRET: ${jwtSecret}`);
  console.log(`INIT_KEY: ${initKey}`);
  console.log('\nKeep these values secure! They are required for your application to function correctly.');
  console.log('\nDeployment complete! Your admin dashboard is now available on Netlify.');
  
  rl.close();
}

// Run the main function
main().catch(error => {
  console.error('An error occurred:', error);
  rl.close();
  process.exit(1);
});
