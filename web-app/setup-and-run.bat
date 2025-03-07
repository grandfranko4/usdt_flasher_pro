@echo off
echo === USDT FLASHER PRO Web Application Setup ===

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Node.js is not installed. Please install Node.js (v14 or higher) and try again.
    exit /b 1
)

REM Display Node.js version
echo Node.js version: 
node -v

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo npm is not installed. Please install npm and try again.
    exit /b 1
)

echo npm version: 
npm -v

REM Install dependencies
echo Installing dependencies...
call npm install
if %ERRORLEVEL% neq 0 (
    echo Failed to install dependencies. Please check the error messages above.
    exit /b 1
)

echo Dependencies installed successfully.

REM Copy assets
echo Setting up assets...
node copy-assets.js

REM Check if .env file exists
if not exist .env (
    echo Creating .env file from .env.example...
    copy .env.example .env
    echo Please update the .env file with your actual values.
)

REM Start the application
echo Starting the application...
echo The application will be available at http://localhost:3000
call npm start

exit /b 0
