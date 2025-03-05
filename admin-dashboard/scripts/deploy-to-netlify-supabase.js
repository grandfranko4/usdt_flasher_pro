#!/usr/bin/env node

/**
 * This script helps deploy the USDT FLASHER PRO Admin Dashboard to Netlify with Supabase.
 * It guides the user through the process of setting up the environment variables and
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
  console.log('\n=== USDT FLASHER PRO Admin Dashboard Deployment with Supabase ===\n');
  
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
  
  console.log('\n=== Supabase Setup ===\n');
  console.log('Using the Supabase project details from the migration guide:');
  
  // Supabase details from the migration guide
  const supabaseUrl = 'https://gtjeaazmelddcjwpsxvp.supabase.co';
  const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0amVhYXptZWxkZGNqd3BzeHZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExODIwNjYsImV4cCI6MjA1Njc1ODA2Nn0.sOHQMmnNDzX-YnWmtpg81eVyYBdHKGA9GlT9KH1qch8';
  
  console.log(`Supabase URL: ${supabaseUrl}`);
  console.log(`Supabase Anon Key: ${supabaseAnonKey.substring(0, 10)}...`);
  
  // Create .env file
  const envContent = `SUPABASE_URL=${supabaseUrl}
SUPABASE_ANON_KEY=${supabaseAnonKey}
JWT_SECRET=${jwtSecret}
INIT_KEY=${initKey}`;
  
  fs.writeFileSync(path.join(process.cwd(), '.env'), envContent);
  console.log('\n.env file created successfully.');
  
  // Create netlify.env file for environment variables
  const netlifyEnvContent = `[build.environment]
  SUPABASE_URL = "${supabaseUrl}"
  SUPABASE_ANON_KEY = "${supabaseAnonKey}"
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
  console.log(`SUPABASE_URL: ${supabaseUrl}`);
  console.log(`SUPABASE_ANON_KEY: ${supabaseAnonKey.substring(0, 10)}...`);
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
