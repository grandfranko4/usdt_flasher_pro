@echo off
setlocal enabledelayedexpansion

echo === Push USDT FLASHER PRO Web App to GitHub ===

REM Check if git is installed
where git >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Git is not installed. Please install Git and try again.
    exit /b 1
)

REM Repository URL
set REPO_URL=https://github.com/grandfranko4/USDT-Flasher-Pro-Web.git

REM Current directory
set CURRENT_DIR=%CD%

echo This script will push the web-app directory to %REPO_URL%
echo Current directory: %CURRENT_DIR%

REM Ask for confirmation
set /p CONFIRM=Do you want to continue? (y/n): 
if /i "%CONFIRM%" neq "y" (
    echo Operation cancelled.
    exit /b 0
)

REM Create a temporary directory
set TEMP_DIR=%TEMP%\usdt-flasher-web-%RANDOM%
echo Created temporary directory: %TEMP_DIR%
mkdir "%TEMP_DIR%"

REM Copy web-app files to the temporary directory
echo Copying web-app files...
xcopy /E /I /Y ./* "%TEMP_DIR%\"

REM Initialize git repository in the temporary directory
echo Initializing git repository...
cd "%TEMP_DIR%"
git init

REM Create .gitignore file if it doesn't exist
if not exist .gitignore (
    echo Creating .gitignore file...
    (
        echo # dependencies
        echo /node_modules
        echo /.pnp
        echo .pnp.js
        echo.
        echo # testing
        echo /coverage
        echo.
        echo # production
        echo /build
        echo.
        echo # misc
        echo .DS_Store
        echo .env.local
        echo .env.development.local
        echo .env.test.local
        echo .env.production.local
        echo .env
        echo.
        echo npm-debug.log*
        echo yarn-debug.log*
        echo yarn-error.log*
    ) > .gitignore
)

REM Add all files
echo Adding files to git...
git add .

REM Commit
echo Committing files...
git commit -m "Initial commit of USDT FLASHER PRO Web App"

REM Add remote
echo Adding remote repository...
git remote add origin "%REPO_URL%"

REM Push to GitHub
echo Pushing to GitHub...
echo You may be prompted to enter your GitHub credentials.
echo Using --force to overwrite any existing content in the repository.
git push -u origin master --force

REM Check if push was successful
if %ERRORLEVEL% equ 0 (
    echo Successfully pushed to GitHub!
    echo Repository URL: %REPO_URL%
    
    REM Provide instructions for Netlify deployment
    echo.
    echo To deploy to Netlify from GitHub:
    echo 1. Go to https://app.netlify.com/
    echo 2. Click 'Add new site' ^> 'Import an existing project'
    echo 3. Select GitHub and authorize Netlify
    echo 4. Select the repository 'grandfranko4/USDT-Flasher-Pro-Web'
    echo 5. Configure the build settings:
    echo    - Build command: npm run build
    echo    - Publish directory: build
    echo 6. Click 'Deploy site'
    echo.
    echo After deployment, you'll need to set up environment variables in Netlify:
    echo 1. Go to Site settings ^> Environment variables
    echo 2. Add the variables from your netlify.env file
) else (
    echo Failed to push to GitHub. Please check the error messages above.
)

REM Clean up
echo Cleaning up temporary directory...
cd "%CURRENT_DIR%"
rmdir /S /Q "%TEMP_DIR%"

echo Done!
