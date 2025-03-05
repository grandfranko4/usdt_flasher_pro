#!/usr/bin/env node

/**
 * This script updates the Fauna DB secret key in Netlify environment variables.
 */

const { execSync } = require('child_process');

// The new Fauna DB secret key
const FAUNA_SECRET_KEY = 'fnAF5HLcMsAAQkqqX6yAJzPlbXsy753velbBs0Y0';

try {
  console.log('Updating Fauna DB secret key in Netlify...');
  
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
  console.log('Setting FAUNA_SECRET_KEY environment variable...');
  execSync(`netlify env:set FAUNA_SECRET_KEY ${FAUNA_SECRET_KEY}`, { stdio: 'inherit' });
  
  console.log('Environment variable updated successfully!');
  console.log('Please trigger a new deployment in Netlify to apply the changes.');
  
} catch (error) {
  console.error('Error updating environment variable:', error);
  process.exit(1);
}
