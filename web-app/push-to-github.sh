#!/bin/bash

# ANSI color codes for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Push USDT FLASHER PRO Web App to GitHub ===${NC}"

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo -e "${RED}Git is not installed. Please install Git and try again.${NC}"
    exit 1
fi

# Repository URL
REPO_URL="https://github.com/grandfranko4/USDT-Flasher-Pro-Web.git"

# Current directory
CURRENT_DIR=$(pwd)

echo -e "${YELLOW}This script will push the web-app directory to ${REPO_URL}${NC}"
echo -e "${YELLOW}Current directory: ${CURRENT_DIR}${NC}"

# Ask for confirmation
read -p "Do you want to continue? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Operation cancelled.${NC}"
    exit 0
fi

# Create a temporary directory
TEMP_DIR=$(mktemp -d)
echo -e "${CYAN}Created temporary directory: ${TEMP_DIR}${NC}"

# Copy web-app files to the temporary directory
echo -e "${CYAN}Copying web-app files...${NC}"
cp -R ./* "${TEMP_DIR}/"

# Initialize git repository in the temporary directory
echo -e "${CYAN}Initializing git repository...${NC}"
cd "${TEMP_DIR}"
git init

# Create .gitignore file if it doesn't exist
if [ ! -f .gitignore ]; then
    echo -e "${CYAN}Creating .gitignore file...${NC}"
    cat > .gitignore << EOL
# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# production
/build

# misc
.DS_Store
.env.local
.env.development.local
.env.test.local
.env.production.local
.env

npm-debug.log*
yarn-debug.log*
yarn-error.log*
EOL
fi

# Add all files
echo -e "${CYAN}Adding files to git...${NC}"
git add .

# Commit
echo -e "${CYAN}Committing files...${NC}"
git commit -m "Initial commit of USDT FLASHER PRO Web App"

# Add remote
echo -e "${CYAN}Adding remote repository...${NC}"
git remote add origin "${REPO_URL}"

# Push to GitHub
echo -e "${CYAN}Pushing to GitHub...${NC}"
echo -e "${YELLOW}You may be prompted to enter your GitHub credentials.${NC}"
echo -e "${YELLOW}Using --force to overwrite any existing content in the repository.${NC}"
git push -u origin master --force

# Check if push was successful
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Successfully pushed to GitHub!${NC}"
    echo -e "${GREEN}Repository URL: ${REPO_URL}${NC}"
    
    # Provide instructions for Netlify deployment
    echo -e "\n${YELLOW}To deploy to Netlify from GitHub:${NC}"
    echo -e "1. Go to https://app.netlify.com/"
    echo -e "2. Click 'Add new site' > 'Import an existing project'"
    echo -e "3. Select GitHub and authorize Netlify"
    echo -e "4. Select the repository 'grandfranko4/USDT-Flasher-Pro-Web'"
    echo -e "5. Configure the build settings:"
    echo -e "   - Build command: ${CYAN}npm run build${NC}"
    echo -e "   - Publish directory: ${CYAN}build${NC}"
    echo -e "6. Click 'Deploy site'"
    echo -e "\n${YELLOW}After deployment, you'll need to set up environment variables in Netlify:${NC}"
    echo -e "1. Go to Site settings > Environment variables"
    echo -e "2. Add the variables from your netlify.env file"
else
    echo -e "${RED}Failed to push to GitHub. Please check the error messages above.${NC}"
fi

# Clean up
echo -e "${CYAN}Cleaning up temporary directory...${NC}"
rm -rf "${TEMP_DIR}"

# Return to original directory
cd "${CURRENT_DIR}"

echo -e "${GREEN}Done!${NC}"
