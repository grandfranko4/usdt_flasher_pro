# USDT FLASHER PRO

A professional application for USDT flash transactions with an admin dashboard for management.

## Project Structure

The project consists of two main parts:
1. **Desktop Application**: An Electron-based application for end users
2. **Admin Dashboard**: A React-based web application for administrators

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Database Setup

The application uses SQLite for data storage. The database file is automatically created in the `data` directory when the application is first run.

### Admin Dashboard Setup

1. Navigate to the admin dashboard directory:
   ```
   cd admin-dashboard
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

4. Build for production:
   ```
   npm run build
   ```

5. Login with the default admin credentials:
   - Email: mikebtcretriever@gmail.com
   - Password: Gateway@523

### Desktop Application Setup

1. From the project root directory, install dependencies:
   ```
   npm install
   ```

2. Start the development version:
   ```
   npm start
   ```

3. Build for production:
   ```
   npm run build
   ```

## Features

### Desktop Application

- License key validation
- USDT flash transactions
- Transaction history
- Support information

### Admin Dashboard

- License key management (create, view, delete)
- Contact information management
- Application settings configuration
- User authentication

## Database Structure

- **license_keys**: Stores license keys with status, expiration, and user information
- **users**: Stores admin user accounts for the dashboard
- **app_settings**: Contains application settings and contact information
- **flash_transactions**: Logs all flash transactions
- **contact_info**: Stores contact information
- **contact_info_history**: Tracks changes to contact information
- **settings_history**: Tracks changes to application settings

## Security

- Local SQLite database for secure storage
- Protected routes in the admin dashboard
- License key validation for the desktop application

## License

This project is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited.
