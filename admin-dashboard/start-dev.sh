#!/bin/bash

# Start the Netlify Functions server in the background
echo "Starting Netlify Functions server..."
npx netlify-cli functions:serve --port 8888 &
NETLIFY_PID=$!

# Wait a moment for the Netlify server to start
sleep 3

# Start the React development server
echo "Starting React development server..."
npm start

# When the React server is stopped, also stop the Netlify server
kill $NETLIFY_PID
