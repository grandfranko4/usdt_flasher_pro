const fs = require('fs');
const path = require('path');

// Source and destination paths
const sourceLogoPath = path.join(__dirname, '..', 'assets', 'USDT_FLASHER Logo.png');
const destLogoPath = path.join(__dirname, 'public', 'assets', 'USDT_FLASHER Logo.png');
const destDirPath = path.join(__dirname, 'public', 'assets');

// Create the destination directory if it doesn't exist
if (!fs.existsSync(destDirPath)) {
  fs.mkdirSync(destDirPath, { recursive: true });
  console.log(`Created directory: ${destDirPath}`);
}

// Copy the logo file if it exists, otherwise create a placeholder
try {
  if (fs.existsSync(sourceLogoPath)) {
    fs.copyFileSync(sourceLogoPath, destLogoPath);
    console.log(`Successfully copied logo from ${sourceLogoPath} to ${destLogoPath}`);
  } else {
    // Create a simple placeholder image (1x1 transparent pixel)
    const placeholderImageData = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
    fs.writeFileSync(destLogoPath, placeholderImageData);
    console.log(`Created placeholder logo at ${destLogoPath} (source file not found)`);
  }
} catch (err) {
  console.error(`Error handling logo: ${err.message}`);
  // Don't fail the build, just continue
  console.log('Continuing with build process...');
}

// Create favicon.ico (placeholder)
const faviconPath = path.join(__dirname, 'public', 'favicon.ico');
if (!fs.existsSync(faviconPath)) {
  try {
    // Create an empty file as a placeholder
    fs.writeFileSync(faviconPath, '');
    console.log(`Created placeholder favicon.ico at ${faviconPath}`);
  } catch (err) {
    console.error(`Error creating favicon: ${err.message}`);
    // Don't fail the build
  }
}

// Create placeholder logo files for PWA
const logo192Path = path.join(__dirname, 'public', 'logo192.png');
const logo512Path = path.join(__dirname, 'public', 'logo512.png');

if (!fs.existsSync(logo192Path)) {
  try {
    // Create a simple placeholder image (1x1 transparent pixel)
    const placeholderImageData = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
    fs.writeFileSync(logo192Path, placeholderImageData);
    console.log(`Created placeholder logo192.png`);
  } catch (err) {
    console.error(`Error creating logo192.png: ${err.message}`);
  }
}

if (!fs.existsSync(logo512Path)) {
  try {
    // Create a simple placeholder image (1x1 transparent pixel)
    const placeholderImageData = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
    fs.writeFileSync(logo512Path, placeholderImageData);
    console.log(`Created placeholder logo512.png`);
  } catch (err) {
    console.error(`Error creating logo512.png: ${err.message}`);
  }
}

console.log('Asset setup completed.');
