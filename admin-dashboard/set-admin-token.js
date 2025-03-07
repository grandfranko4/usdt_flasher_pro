#!/usr/bin/env node

/**
 * This script sets the admin token directly in localStorage for testing purposes.
 * It creates a simple HTML file that will set the token and user data in localStorage.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Generate a new token
const generateJwtOutput = execSync('node generate-jwt.js', { encoding: 'utf8' });
const tokenMatch = generateJwtOutput.match(/eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/);

if (!tokenMatch) {
  console.error('Failed to extract token from generate-jwt.js output');
  process.exit(1);
}

const token = tokenMatch[0];

// Create a simple HTML file that will set the token in localStorage
const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Set Admin Token</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      background-color: #1a1a1a;
      color: #f5f6fa;
    }
    .container {
      background-color: #222222;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }
    h1 {
      color: #00e6b8;
    }
    pre {
      background-color: #333;
      padding: 10px;
      border-radius: 4px;
      overflow-x: auto;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    button {
      background-color: #00e6b8;
      color: #fff;
      border: none;
      padding: 10px 15px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
      margin-top: 20px;
    }
    button:hover {
      background-color: #00c9a0;
    }
    .success {
      background-color: rgba(0, 230, 184, 0.1);
      border-left: 4px solid #00e6b8;
      padding: 10px;
      margin-top: 20px;
      display: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Set Admin Token</h1>
    <p>This page will set the admin token and user data in localStorage for testing purposes.</p>
    
    <h2>Token:</h2>
    <pre id="token">${token}</pre>
    
    <h2>User Data:</h2>
    <pre id="userData">{
  "id": "admin-user-id",
  "email": "mikebtcretriever@gmail.com",
  "displayName": "Admin User",
  "role": "admin"
}</pre>
    
    <button id="setTokenBtn">Set Token in localStorage</button>
    <div id="success" class="success">
      Token and user data have been set in localStorage. You can now close this page and go to the admin dashboard.
    </div>
    
    <script>
      document.getElementById('setTokenBtn').addEventListener('click', function() {
        // Set token in localStorage
        localStorage.setItem('token', document.getElementById('token').textContent.trim());
        
        // Set user data in localStorage
        const userData = {
          id: "admin-user-id",
          email: "mikebtcretriever@gmail.com",
          displayName: "Admin User",
          role: "admin"
        };
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Show success message
        document.getElementById('success').style.display = 'block';
        
        // Log to console for verification
        console.log('Token set in localStorage:', localStorage.getItem('token'));
        console.log('User data set in localStorage:', localStorage.getItem('user'));
      });
    </script>
  </div>
</body>
</html>
`;

// Write the HTML file
const htmlFilePath = path.join(__dirname, 'set-admin-token.html');
fs.writeFileSync(htmlFilePath, htmlContent);

console.log(`HTML file created at: ${htmlFilePath}`);
console.log('Open this file in a browser to set the admin token in localStorage.');
console.log(`You can open it with: open ${htmlFilePath}`);

// Try to open the file automatically
try {
  if (process.platform === 'darwin') {  // macOS
    execSync(`open ${htmlFilePath}`);
  } else if (process.platform === 'win32') {  // Windows
    execSync(`start ${htmlFilePath}`);
  } else if (process.platform === 'linux') {  // Linux
    execSync(`xdg-open ${htmlFilePath}`);
  }
  console.log('Browser should open automatically with the HTML file.');
} catch (error) {
  console.log('Could not open the browser automatically. Please open the HTML file manually.');
}
