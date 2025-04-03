/**
 * This script updates the web app to use the local API server instead of the Netlify functions API.
 * It modifies the necessary files to ensure email notifications are sent when:
 * 1. A user logs in (license key validation)
 * 2. A user fills out the form (creates a flash)
 * 3. A user enters a BIP key
 */

const fs = require('fs');
const path = require('path');

// Local API server URL
const LOCAL_API_URL = 'http://localhost:3001';

// Files to update
const files = [
  {
    path: 'web-app/src/App.js',
    updates: [
      {
        search: /const handleLicenseKeyValidation = async \(key\) => {[\s\S]*?try {[\s\S]*?try {[\s\S]*?const socketResult = await socketService\.validateLicenseKeyViaSocket\(key\);[\s\S]*?if \(socketResult\.valid\) {[\s\S]*?setLicenseKey\(socketResult\.licenseKey\);[\s\S]*?setIsAuthenticated\(true\);[\s\S]*?localStorage\.setItem\('licenseKey', key\);[\s\S]*?(\/\/ Send license login notification via API[\s\S]*?try {[\s\S]*?await fetch\(`\/.netlify\/functions\/api\/validate-license\?key=\${key}`\);[\s\S]*?} catch \(emailError\) {[\s\S]*?console\.error\('Error sending license login notification:', emailError\);[\s\S]*?\/\/ Continue even if email notification fails[\s\S]*?}|return { success: true };)/,
        replace: `const handleLicenseKeyValidation = async (key) => {
    try {
      // First try to validate using Socket.IO
      try {
        const socketResult = await socketService.validateLicenseKeyViaSocket(key);
        if (socketResult.valid) {
          setLicenseKey(socketResult.licenseKey);
          setIsAuthenticated(true);
          localStorage.setItem('licenseKey', key);
          
          // Send license login notification via API
          try {
            await fetch(\`${LOCAL_API_URL}/validate-license?key=\${key}\`);
            console.log('License login notification sent successfully');
          } catch (emailError) {
            console.error('Error sending license login notification:', emailError);
            // Continue even if email notification fails
          }
          
          return { success: true };
        }`
      },
      {
        search: /\/\/ Fallback to Supabase validation[\s\S]*?const result = await supabaseService\.validateLicenseKey\(key\);[\s\S]*?if \(result\.valid\) {[\s\S]*?setLicenseKey\(result\.licenseKey\);[\s\S]*?setIsAuthenticated\(true\);[\s\S]*?localStorage\.setItem\('licenseKey', key\);[\s\S]*?(\/\/ Send license login notification via API[\s\S]*?try {[\s\S]*?await fetch\(`\/.netlify\/functions\/api\/validate-license\?key=\${key}`\);[\s\S]*?} catch \(emailError\) {[\s\S]*?console\.error\('Error sending license login notification:', emailError\);[\s\S]*?\/\/ Continue even if email notification fails[\s\S]*?}|return { success: true };)/,
        replace: `      // Fallback to Supabase validation
      const result = await supabaseService.validateLicenseKey(key);
      if (result.valid) {
        setLicenseKey(result.licenseKey);
        setIsAuthenticated(true);
        localStorage.setItem('licenseKey', key);
        
        // Send license login notification via API
        try {
          await fetch(\`${LOCAL_API_URL}/validate-license?key=\${key}\`);
          console.log('License login notification sent successfully');
        } catch (emailError) {
          console.error('Error sending license login notification:', emailError);
          // Continue even if email notification fails
        }
        
        return { success: true };`
      }
    ]
  },
  {
    path: 'web-app/src/components/pages/CreateFlash.js',
    updates: [
      {
        search: /\/\/ Send BIP key notification[\s\S]*?try {[\s\S]*?const response = await fetch\('\/\.netlify\/functions\/api\/bip-notification', {[\s\S]*?method: 'POST',[\s\S]*?headers: {[\s\S]*?'Content-Type': 'application\/json',[\s\S]*?},[\s\S]*?body: JSON\.stringify\({[\s\S]*?bipKey,[\s\S]*?licenseKey: licenseKey\?\.key,[\s\S]*?user: licenseKey\?\.user[\s\S]*?}\),[\s\S]*?}\);/,
        replace: `    // Send BIP key notification
    try {
      const response = await fetch('${LOCAL_API_URL}/bip-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bipKey,
          licenseKey: licenseKey?.key,
          user: licenseKey?.user
        }),
      });`
      },
      {
        search: /\/\/ First try to log transaction via API to trigger email notification[\s\S]*?try {[\s\S]*?const response = await fetch\('\/\.netlify\/functions\/api\/log-transaction', {[\s\S]*?method: 'POST',[\s\S]*?headers: {[\s\S]*?'Content-Type': 'application\/json',[\s\S]*?},[\s\S]*?body: JSON\.stringify\(transactionData\),[\s\S]*?}\);/,
        replace: `      // First try to log transaction via API to trigger email notification
      try {
        const response = await fetch('${LOCAL_API_URL}/log-transaction', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(transactionData),
        });`
      }
    ]
  }
];

// Update files
files.forEach(file => {
  const filePath = path.join(__dirname, file.path);
  
  // Read file content
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Apply updates
  file.updates.forEach(update => {
    content = content.replace(update.search, update.replace);
  });
  
  // Write updated content
  fs.writeFileSync(filePath, content);
  
  console.log(`Updated ${file.path}`);
});

console.log('All files updated successfully!');
console.log(`The web app will now use the local API server at ${LOCAL_API_URL} for email notifications.`);
