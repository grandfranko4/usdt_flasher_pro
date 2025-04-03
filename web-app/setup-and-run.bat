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

REM Check if EMAIL_PASSWORD is set in .env
findstr /C:"EMAIL_PASSWORD=" .env >nul
if %ERRORLEVEL% equ 0 (
    echo EMAIL_PASSWORD is set in .env.
) else (
    echo WARNING: EMAIL_PASSWORD is not set in .env. Email notifications will not work.
    echo Please add EMAIL_PASSWORD=your_app_password to the .env file.
)

REM Start the local API server for email notifications
echo Starting local API server for email notifications...
echo This will run in the background. Check the terminal for any errors.

REM Navigate to the root directory and start the local API server
cd ..
start /B cmd /C "node local-api-server.js > api-server.log 2>&1"
set API_SERVER_PID=%ERRORLEVEL%

REM Wait for the API server to start
timeout /T 2 /NOBREAK >nul

echo Local API server started successfully.

REM Navigate back to the web-app directory
cd web-app

REM Start the application
echo Starting the application...
echo The application will be available at http://localhost:3000

REM Start the React app
call npm start

REM When npm start exits, we'll reach here
echo Stopping local API server...
taskkill /F /IM node.exe /FI "WINDOWTITLE eq local-api-server.js" >nul 2>&1

exit /b 0
