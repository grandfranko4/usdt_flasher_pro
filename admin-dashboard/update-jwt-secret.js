#!/usr/bin/env node

/**
 * This script updates the JWT_SECRET in Netlify environment variables.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Read the JWT_SECRET from the .env file
const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const jwtSecretMatch = envContent.match(/JWT_SECRET=(.+)/);

if (!jwtSecretMatch) {
  console.error('JWT_SECRET not found in .env file');
  process.exit(1);
}

const JWT_SECRET = jwtSecretMatch[1].trim();

try {
  console.log('Updating JWT_SECRET in Netlify...');
  
  // Check if Netlify CLI is installed
  try {
    execSync('netlify --version', { stdio: 'ignore' });
  } catch (error) {
    console.error('Netlify CLI is not installed. Please install it with: npm install -g netlify-cli');
    process.exit(1);
  }
  
  // Check if user is logged in to Netlify
  try {
    execSync('netlify status', { stdio: 'ignore' });
  } catch (error) {
    console.log('You need to log in to Netlify first.');
    execSync('netlify login', { stdio: 'inherit' });
  }
  
  // Link to Netlify site if not already linked
  try {
    execSync('netlify status', { stdio: 'ignore' });
  } catch (error) {
    console.log('Linking to Netlify site...');
    execSync('netlify link', { stdio: 'inherit' });
  }
  
  // Set the environment variable
  console.log('Setting JWT_SECRET environment variable...');
  execSync(`netlify env:set JWT_SECRET "${JWT_SECRET}"`, { stdio: 'inherit' });
  
  console.log('Environment variable updated successfully!');
  console.log('Please trigger a new deployment in Netlify to apply the changes.');
  
} catch (error) {
  console.error('Error updating environment variable:', error);
  process.exit(1);
}
