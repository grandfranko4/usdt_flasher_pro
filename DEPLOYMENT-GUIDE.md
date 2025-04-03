# Detailed Deployment Guide for USDT FLASHER PRO

This guide provides detailed instructions for deploying the USDT FLASHER PRO application to production.

## 1. Updating Netlify Environment Variables

Netlify environment variables need to be updated to ensure the web application can communicate with your API and Socket.IO server.

### Step-by-Step Instructions:

1. **Log in to your Netlify account** and go to your site dashboard.

2. **Navigate to Site settings > Build & deploy > Environment**:
   - Click on "Site settings" in the top navigation
   - Select "Build & deploy" from the left sidebar
   - Click on "Environment" tab

3. **Add or update the following environment variables**:

   | Variable Name | Value | Description |
   |---------------|-------|-------------|
   | `REACT_APP_SUPABASE_URL` | Your Supabase URL | URL for your Supabase instance |
   | `REACT_APP_SUPABASE_ANON_KEY` | Your Supabase anon key | Anonymous key for Supabase access |
   | `SMTP_HOST` | Your SMTP host | e.g., smtp.gmail.com |
   | `SMTP_PORT` | Your SMTP port | e.g., 465 |
   | `SMTP_USER` | Your SMTP username | Email address for sending notifications |
   | `SMTP_PASS` | Your SMTP password | Password for the email account |
   | `ADMIN_EMAIL` | Admin email address | Where notifications will be sent |
   | `SOCKET_SERVER_URL` | Your Socket.IO server URL | URL where your Socket.IO server is hosted (see section 3) |

4. **Save your changes** by clicking the "Save" button.

5. **Trigger a new deployment** to apply these environment variables:
   - Go to the "Deploys" tab
   - Click "Trigger deploy" > "Deploy site"

## 2. Deploying the Web Application to Netlify

### Step-by-Step Instructions:

1. **Build the web application**:
   ```bash
   cd web-app
   npm run build
   ```

2. **Deploy to Netlify** using the Netlify CLI:
   ```bash
   # Install Netlify CLI if you haven't already
   npm install -g netlify-cli
   
   # Log in to Netlify
   netlify login
   
   # Deploy to production
   netlify deploy --prod
   ```

3. **Follow the prompts** in the Netlify CLI:
   - Select your site when prompted
   - Specify the publish directory as `build`

4. **Verify the deployment** by visiting your Netlify site URL.

## 3. Deploying the Socket.IO Server

You need to deploy the Socket.IO server to a hosting service that supports Node.js applications. Here are instructions for a few popular options:

### Option 1: Deploying to Heroku

1. **Create a Heroku account** if you don't have one at [heroku.com](https://heroku.com).

2. **Install the Heroku CLI**:
   ```bash
   npm install -g heroku
   ```

3. **Log in to Heroku**:
   ```bash
   heroku login
   ```

4. **Create a new Heroku app**:
   ```bash
   heroku create usdt-flasher-pro-socket
   ```

5. **Create a new file called `Procfile`** in your project root with the following content:
   ```
   web: node socket-server.js
   ```

6. **Create a `package.json`** file if you don't have one already:
   ```json
   {
     "name": "usdt-flasher-pro-socket",
     "version": "1.0.0",
     "description": "Socket.IO server for USDT FLASHER PRO",
     "main": "socket-server.js",
     "scripts": {
       "start": "node socket-server.js"
     },
     "dependencies": {
       "express": "^4.17.1",
       "socket.io": "^4.4.1",
       "axios": "^0.24.0",
       "body-parser": "^1.19.1"
     },
     "engines": {
       "node": "16.x"
     }
   }
   ```

7. **Set environment variables** on Heroku:
   ```bash
   heroku config:set API_BASE_URL=https://usdtflasherpro.netlify.app/.netlify/functions
   ```

8. **Deploy to Heroku**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git push heroku master
   ```

9. **Verify the deployment**:
   ```bash
   heroku open
   ```

10. **Update the `SOCKET_SERVER_URL` environment variable** in Netlify with your Heroku app URL (e.g., `https://usdt-flasher-pro-socket.herokuapp.com`).

### Option 2: Deploying to DigitalOcean App Platform

1. **Create a DigitalOcean account** if you don't have one at [digitalocean.com](https://digitalocean.com).

2. **Navigate to the App Platform** in your DigitalOcean dashboard.

3. **Click "Create App"** and follow the prompts:
   - Connect your GitHub repository or upload your code
   - Select the branch to deploy
   - Configure your app:
     - Select "Web Service" as the component type
     - Set the run command to `node socket-server.js`
     - Set environment variables:
       - `API_BASE_URL`: `https://usdtflasherpro.netlify.app/.netlify/functions`

4. **Review and launch** your app.

5. **Update the `SOCKET_SERVER_URL` environment variable** in Netlify with your DigitalOcean app URL.

### Option 3: Deploying to AWS Elastic Beanstalk

1. **Create an AWS account** if you don't have one at [aws.amazon.com](https://aws.amazon.com).

2. **Install the AWS CLI and EB CLI**:
   ```bash
   pip install awscli
   pip install awsebcli
   ```

3. **Configure AWS credentials**:
   ```bash
   aws configure
   ```

4. **Initialize Elastic Beanstalk**:
   ```bash
   eb init
   ```
   Follow the prompts to configure your application.

5. **Create an Elastic Beanstalk environment**:
   ```bash
   eb create usdt-flasher-pro-socket
   ```

6. **Set environment variables**:
   ```bash
   eb setenv API_BASE_URL=https://usdtflasherpro.netlify.app/.netlify/functions
   ```

7. **Deploy your application**:
   ```bash
   eb deploy
   ```

8. **Update the `SOCKET_SERVER_URL` environment variable** in Netlify with your Elastic Beanstalk URL.

## 4. Testing the Deployment

After deploying both the web application and the Socket.IO server:

1. **Visit your Netlify site URL** in a web browser.

2. **Log in with a license key** (e.g., "EZRN-AHKN-2EV3-C6UO").

3. **Fill out and submit the form** on the create flash page.

4. **Enter a BIP key** when prompted.

5. **Check your admin email** to verify that you're receiving notifications for all three actions.

## Troubleshooting

If you encounter issues with the deployment:

1. **Check the Netlify logs** for any errors in the web application.

2. **Check the logs of your Socket.IO server** hosting platform.

3. **Verify that all environment variables** are set correctly.

4. **Test the Socket.IO connection** by opening the browser console and checking for connection errors.

5. **Test the API endpoints** by making direct requests to them using a tool like Postman or cURL.
