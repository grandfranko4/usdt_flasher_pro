// Script to generate a valid JWT token for admin access
const jwt = require('jsonwebtoken');
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

// Create the payload for the admin user
const payload = {
  id: 'admin-user-id',
  email: 'mikebtcretriever@gmail.com',
  role: 'admin',
  exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
};

// Generate the JWT token
const token = jwt.sign(payload, JWT_SECRET);

console.log('Generated JWT token for admin access:');
console.log(token);
