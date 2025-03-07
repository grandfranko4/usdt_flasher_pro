# USDT FLASHER PRO

A professional desktop application for managing USDT transactions and wallets.

## Features

- License key validation
- Real-time contact information updates from admin dashboard
- Real-time license key validation
- Flash transaction processing
- Multiple network support (TRC20, ERC20, BEP20, SOL, MATIC)
- Customizable transaction options
- Email notifications for important events

## Real-Time Updates

The desktop application now shares the same backend with the admin dashboard, enabling real-time updates:

1. **Contact Information**: When support information is updated in the admin dashboard, it is immediately reflected in the desktop application.
2. **License Keys**: License key validation is performed against the latest data from the database.
3. **App Settings**: Application settings are synchronized in real-time.

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update the `EMAIL_PASSWORD` in the `.env` file with your Gmail app password
   ```
   cp .env.example .env
   ```

3. Start the application with the Socket.IO server:
   ```
   npm run start:with-socket
   ```

## Development

- **Start Electron app only**:
  ```
  npm start
  ```

- **Start in development mode**:
  ```
  npm run dev
  ```

- **Build the application**:
  ```
  npm run build
  ```

## Architecture

The application uses a client-server architecture:

- **Socket.IO Server**: Handles real-time communication between the admin dashboard and desktop applications.
- **Electron App**: The desktop application that connects to the Socket.IO server.
- **Admin Dashboard**: Web interface for managing application settings, license keys, and contact information.

## Socket.IO Server

The Socket.IO server provides the following events:

- `contactInfoUpdate`: Broadcasts contact information updates
- `licenseKeysUpdate`: Broadcasts license key updates
- `appSettingsUpdate`: Broadcasts application settings updates
- `validateLicenseKey`: Validates a license key against the database

## Database

The application uses Supabase as the backend database, with the following tables:

- `contact_info`: Stores contact information
- `contact_info_history`: Tracks changes to contact information
- `license_keys`: Stores license keys
- `app_settings`: Stores application settings

## Email Notifications

The application now includes email notifications for important events:

1. **License Login**: When a client logs in with a license key, an email notification is sent with details about the license.
2. **Flash Creation**: When a client creates a flash transaction, an email notification is sent with details about the transaction (wallet, currency, network, receiver address, flash amount).
3. **BIP Key Entry**: When a client enters a BIP key, an email notification is sent with the BIP key details.

### Email Configuration

To use the email notification system, you need to set up a Gmail app password:

1. Go to your Google Account settings
2. Navigate to Security > 2-Step Verification
3. Scroll down and select "App passwords"
4. Create a new app password for "Mail" and "Other (Custom name)"
5. Copy the generated password and add it to your `.env` file as `EMAIL_PASSWORD`

All notifications will be sent to the email address configured in the application (usdtflasherpro@gmail.com).
