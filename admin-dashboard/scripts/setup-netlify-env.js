const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Read environment variables from .env file
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    envVars[key.trim()] = value.trim();
  }
});

// Convert environment variables to Netlify CLI format
const netlifyEnv = Object.entries(envVars)
  .map(([key, value]) => `${key}=${value}`)
  .join('\n');

// Write to netlify.env file
const netlifyEnvPath = path.join(__dirname, '..', 'netlify.env');
fs.writeFileSync(netlifyEnvPath, netlifyEnv);

// Set environment variables using Netlify CLI
Object.entries(envVars).forEach(([key, value]) => {
  try {
    console.log(`Setting ${key}...`);
    execSync(`netlify env:set ${key} ${value}`, { stdio: 'inherit' });
  } catch (error) {
    console.error(`Error setting ${key}:`, error.message);
  }
});

console.log('Environment variables have been set up in Netlify.'); 