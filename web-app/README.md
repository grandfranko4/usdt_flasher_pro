# USDT FLASHER PRO - Web Application

This is the web application version of the USDT FLASHER PRO software. It provides the same functionality as the desktop application but runs in a web browser.

## Features

- License key validation
- USDT flash transactions
- Transaction history
- Support information
- Real-time updates via Socket.IO
- Integration with Supabase database

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository
2. Navigate to the web-app directory
3. Install dependencies:

```bash
cd web-app
npm install
```

### Running the Application

To start the development server:

```bash
npm start
```

This will run the app in development mode. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### Building for Production

To build the app for production:

```bash
npm run build
```

This builds the app for production to the `build` folder. It correctly bundles React in production mode and optimizes the build for the best performance.

## Deploying to Netlify

### Option 1: Direct Deployment with Netlify CLI

#### Prerequisites

- Netlify CLI installed globally: `npm install -g netlify-cli`
- Netlify account

#### Deployment Steps

1. Install the Netlify CLI:

```bash
npm install -g netlify-cli
```

2. Log in to Netlify:

```bash
netlify login
```

3. Deploy to Netlify:

```bash
cd web-app
npm run deploy
```

The deployment script will:
- Install dependencies
- Build the application
- Deploy to Netlify

During your first deployment, you'll be prompted to:
1. Create a new site or use an existing one
2. Confirm the build directory (`build`)
3. Confirm the deployment

### Option 2: Deployment from GitHub

#### Prerequisites

- GitHub account
- Git installed
- Netlify account

#### Deployment Steps

1. Push the web app to GitHub:

**On macOS/Linux:**
```bash
cd web-app
./push-to-github.sh
```

**On Windows:**
```
cd web-app
push-to-github.bat
```

This script will:
- Create a temporary Git repository
- Add all web app files
- Push to the GitHub repository at https://github.com/grandfranko4/USDT-Flasher-Pro-Web.git
- Provide instructions for deploying to Netlify

2. Follow the instructions provided by the script to deploy from GitHub:
   - Go to https://app.netlify.com/
   - Click 'Add new site' > 'Import an existing project'
   - Select GitHub and authorize Netlify
   - Select the repository 'grandfranko4/USDT-Flasher-Pro-Web'
   - Configure the build settings:
     - Build command: `npm run build`
     - Publish directory: `build`
   - Click 'Deploy site'

3. After deployment, set up environment variables in Netlify:
   - Go to Site settings > Environment variables
   - Add the variables from your netlify.env file

### Environment Variables

Environment variables are stored in `netlify.env`. To update them on Netlify:

```bash
npm run update-env
```

This interactive script will:
- Display all environment variables that will be updated
- Ask for confirmation before proceeding
- Update the variables on your Netlify site

### Local Netlify Development

To run the application with Netlify functions locally:

```bash
npm run netlify-dev
```

This will start a local development server that includes your Netlify functions, allowing you to test the complete application locally.

## Project Structure

- `public/` - Static files
- `src/` - Source code
  - `components/` - React components
    - `auth/` - Authentication components
    - `layout/` - Layout components
    - `pages/` - Page components
  - `contexts/` - React contexts
  - `services/` - Service modules
  - `App.js` - Main application component
  - `constants.js` - Application constants
  - `index.js` - Application entry point
  - `styles.css` - Global styles

## Integration with Supabase

The web application integrates with Supabase for database functionality. It uses the same database as the desktop application and admin dashboard.

## Socket.IO Integration

The web application uses Socket.IO for real-time updates. It connects to the same Socket.IO server as the desktop application.

## License

This software is proprietary and confidential. Unauthorized copying, transferring, or reproduction of the contents of this software, via any medium, is strictly prohibited.
