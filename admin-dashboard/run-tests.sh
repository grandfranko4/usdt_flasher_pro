#!/bin/bash

# Install required dependencies
echo "Installing required dependencies..."
cd "$(dirname "$0")"
npm install --no-save node-fetch chalk

# Make the test script executable
chmod +x test-admin-dashboard.js

# Start the Netlify Functions server in the background
echo "Starting Netlify Functions server..."
npx netlify-cli functions:serve --port 8888 &
NETLIFY_PID=$!

# Wait for the server to start
echo "Waiting for server to start..."
sleep 5

# Run the test script
echo "Running tests..."
node test-admin-dashboard.js

# Kill the Netlify Functions server
echo "Stopping Netlify Functions server..."
kill $NETLIFY_PID

echo "Done!"
