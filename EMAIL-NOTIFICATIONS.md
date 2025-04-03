# Email Notifications in USDT FLASHER PRO

This document explains how email notifications are implemented in the USDT FLASHER PRO application and how to test them.

## Email Notification Types

The application sends email notifications for the following events:

1. **License Login Notification**: Sent when a user logs in with a license key
2. **Flash Creation Notification**: Sent when a user creates a flash transaction
3. **BIP Key Notification**: Sent when a user enters a BIP key

## Implementation Details

Email notifications are implemented in the following files:

- `email-service.js`: Contains the core email sending functionality using Nodemailer
- `web-app/netlify/functions/php-mailer.js`: Netlify function for sending emails in production
- `web-app/netlify/functions/api.js`: Netlify API endpoints that trigger email notifications
- `web-app/src/services/socket.js`: Client-side service that makes API calls to trigger email notifications
- `web-app/src/components/pages/CreateFlash.js`: Component that triggers flash creation and BIP key notifications
- `local-api-server.js`: Local API server for testing email notifications

## How to Test Email Notifications

### Prerequisites

1. Make sure you have a `.env` file with the following variables:
   ```
   EMAIL_PASSWORD=your_email_password
   ```

2. Install the required dependencies:
   ```
   npm install nodemailer node-fetch@2 abort-controller
   ```

### Testing with the Local API Server

1. Run the test script:
   ```
   node start-email-test.js
   ```

   This script will:
   - Start the local API server
   - Send test email notifications for license login, flash creation, and BIP key
   - Log the results to the console

2. Check the console output for success or error messages.

### Testing with the Web App

1. Start the local API server:
   ```
   node local-api-server.js
   ```

2. Start the web app:
   ```
   cd web-app
   npm start
   ```

3. Open the web app in your browser and:
   - Enter a license key on the license page
   - Create a flash transaction
   - Enter a BIP key when prompted

4. Check the console output of the local API server for success or error messages.

## Troubleshooting

If emails are not being sent, check the following:

1. **Email Password**: Make sure the `EMAIL_PASSWORD` environment variable is set correctly in your `.env` file.

2. **SMTP Settings**: Check the SMTP settings in `email-service.js` and `web-app/netlify/functions/php-mailer.js`.

3. **API Endpoints**: Make sure the API endpoints are correctly configured in `web-app/src/services/socket.js` and `web-app/src/components/pages/CreateFlash.js`.

4. **Console Logs**: Check the console logs for error messages.

## Recent Changes

The following changes were made to fix the email notification system:

1. Updated `web-app/src/services/socket.js` to make direct API calls to the Netlify functions for license validation.

2. Added a new endpoint `/license-login-notification` to `web-app/netlify/functions/api.js` and `local-api-server.js` to handle license login notifications.

3. Updated the form submission endpoint in `local-api-server.js` to match the Netlify functions API.

4. Created test scripts to verify email notifications are working correctly.
