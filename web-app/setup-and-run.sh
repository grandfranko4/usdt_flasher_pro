#!/bin/bash

# USDT FLASHER PRO Web Application Setup and Run Script

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== USDT FLASHER PRO Web Application Setup ===${NC}"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js is not installed. Please install Node.js (v14 or higher) and try again.${NC}"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 14 ]; then
    echo -e "${RED}Node.js version is too old. Please upgrade to v14 or higher.${NC}"
    exit 1
fi

echo -e "${GREEN}Node.js version: $(node -v) ✓${NC}"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}npm is not installed. Please install npm and try again.${NC}"
    exit 1
fi

echo -e "${GREEN}npm version: $(npm -v) ✓${NC}"

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
npm install

if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to install dependencies. Please check the error messages above.${NC}"
    exit 1
fi

echo -e "${GREEN}Dependencies installed successfully ✓${NC}"

# Copy assets
echo -e "${YELLOW}Setting up assets...${NC}"
node copy-assets.js

if [ $? -ne 0 ]; then
    echo -e "${YELLOW}Warning: There might be issues with assets setup. The application may still work.${NC}"
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}Creating .env file from .env.example...${NC}"
    cp .env.example .env
    echo -e "${YELLOW}Please update the .env file with your actual values.${NC}"
fi

# Check if EMAIL_PASSWORD is set in .env
if grep -q "EMAIL_PASSWORD=" .env; then
    echo -e "${GREEN}EMAIL_PASSWORD is set in .env ✓${NC}"
else
    echo -e "${RED}EMAIL_PASSWORD is not set in .env. Email notifications will not work.${NC}"
    echo -e "${YELLOW}Please add EMAIL_PASSWORD=your_app_password to the .env file.${NC}"
fi

# Start the local API server for email notifications
echo -e "${GREEN}Starting local API server for email notifications...${NC}"
echo -e "${YELLOW}This will run in the background. Check the terminal for any errors.${NC}"

# Navigate to the root directory and start the local API server
cd ..
node local-api-server.js > api-server.log 2>&1 &
API_SERVER_PID=$!

# Wait for the API server to start
sleep 2

# Check if the API server is running
if ps -p $API_SERVER_PID > /dev/null; then
    echo -e "${GREEN}Local API server started successfully (PID: $API_SERVER_PID) ✓${NC}"
else
    echo -e "${RED}Failed to start local API server. Email notifications will not work.${NC}"
    echo -e "${YELLOW}Check api-server.log for details.${NC}"
fi

# Navigate back to the web-app directory
cd web-app

# Start the application
echo -e "${GREEN}Starting the application...${NC}"
echo -e "${YELLOW}The application will be available at http://localhost:3000${NC}"

# Trap SIGINT to kill the API server when the script is terminated
trap 'echo -e "${YELLOW}Stopping local API server...${NC}"; kill $API_SERVER_PID 2>/dev/null; exit 0' SIGINT

npm start

# Kill the API server when npm start exits
echo -e "${YELLOW}Stopping local API server...${NC}"
kill $API_SERVER_PID 2>/dev/null

exit 0
