# USDT FLASHER PRO Admin Dashboard

This is the admin dashboard for USDT FLASHER PRO. It allows administrators to manage license keys, contact information, and application settings.

## Features

- User authentication
- License key management
- Contact information management
- Application settings management
- Flash transaction history

## Technology Stack

- React.js for the frontend
- Netlify Functions for serverless backend
- FaunaDB for database

## Local Development

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

This will start the React development server at http://localhost:3000.

### Netlify Functions Development

To test Netlify Functions locally, you need to install the Netlify CLI:

```bash
npm install -g netlify-cli
```

Then, you can start the Netlify development server:

```bash
netlify dev
```

This will start both the React development server and the Netlify Functions server.

## Deployment to Netlify

### Prerequisites

1. Create a [Netlify](https://www.netlify.com/) account
2. Create a [FaunaDB](https://fauna.com/) account and database

### Environment Variables

The following environment variables need to be set in Netlify:

- `FAUNA_SECRET_KEY`: Your FaunaDB secret key
- `JWT_SECRET`: A secret key for JWT token generation
- `INIT_KEY`: A secret key for initializing the database

### Deployment Steps

1. Log in to Netlify
2. Connect your GitHub repository
3. Configure the build settings:
   - Build command: `npm run build`
   - Publish directory: `build`
4. Set the environment variables
5. Deploy the site

### Database Initialization

After deploying, you need to initialize the database. You can do this by making a POST request to the `/initialize-db` endpoint with the `initKey` parameter set to your `INIT_KEY` value.

Example using curl:

```bash
curl -X POST https://your-netlify-site.netlify.app/.netlify/functions/initialize-db \
  -H "Content-Type: application/json" \
  -d '{"initKey":"your-init-key"}'
```

This will create the necessary collections and indexes in FaunaDB, as well as add default data.

## Project Structure

- `src/`: React application source code
  - `components/`: React components
    - `auth/`: Authentication components
    - `layout/`: Layout components
    - `pages/`: Page components
  - `contexts/`: React contexts
  - `services/`: Service modules
    - `api.js`: API service for communicating with Netlify Functions
    - `database.js`: Database service (re-exports API functions)
- `functions/`: Netlify Functions
  - `auth.js`: Authentication function
  - `license-keys.js`: License key management function
  - `contact-info.js`: Contact information management function
  - `app-settings.js`: Application settings management function
  - `initialize-db.js`: Database initialization function
  - `utils/`: Utility functions
    - `fauna.js`: FaunaDB utility functions

## License

This project is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited.
