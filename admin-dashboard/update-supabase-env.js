#!/usr/bin/env node

/**
 * This script updates the Supabase environment variables in Netlify.
 */

const { execSync } = require('child_process');

// The Supabase environment variables
const SUPABASE_URL = 'https://gtjeaazmelddcjwpsxvp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0amVhYXptZWxkZGNqd3BzeHZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExODIwNjYsImV4cCI6MjA1Njc1ODA2Nn0.sOHQMmnNDzX-YnWmtpg81eVyYBdHKGA9GlT9KH1qch8';

try {
  console.log('Updating Supabase environment variables in Netlify...');
  
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
  
  // Set the environment variables
  console.log('Setting SUPABASE_URL environment variable...');
  execSync(`netlify env:set SUPABASE_URL "${SUPABASE_URL}"`, { stdio: 'inherit' });
  
  console.log('Setting SUPABASE_ANON_KEY environment variable...');
  execSync(`netlify env:set SUPABASE_ANON_KEY "${SUPABASE_ANON_KEY}"`, { stdio: 'inherit' });
  
  console.log('Environment variables updated successfully!');
  console.log('Please trigger a new deployment in Netlify to apply the changes.');
  
} catch (error) {
  console.error('Error updating environment variables:', error);
  process.exit(1);
}
