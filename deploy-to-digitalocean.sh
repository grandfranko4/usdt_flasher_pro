#!/bin/bash

# ANSI color codes for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Deploy USDT FLASHER PRO to DigitalOcean ===${NC}"

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo -e "${RED}Git is not installed. Please install Git and try again.${NC}"
    exit 1
fi

# Current directory
CURRENT_DIR=$(pwd)
echo -e "${YELLOW}Current directory: ${CURRENT_DIR}${NC}"

# Ask for confirmation
read -p "Do you want to push your changes to GitHub and trigger a DigitalOcean deployment? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Operation cancelled.${NC}"
    exit 0
fi

# Check if there are any changes to commit
echo -e "${CYAN}Checking for uncommitted changes...${NC}"
if [[ -z $(git status -s) ]]; then
    echo -e "${YELLOW}No changes to commit.${NC}"
else
    # Ask if user wants to commit changes
    echo -e "${YELLOW}There are uncommitted changes:${NC}"
    git status -s
    
    read -p "Do you want to commit these changes? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Ask for commit message
        echo -e "${CYAN}Enter a commit message:${NC}"
        read -r commit_message
        
        # Add and commit changes
        echo -e "${CYAN}Adding and committing changes...${NC}"
        git add .
        git commit -m "$commit_message"
    else
        echo -e "${YELLOW}Skipping commit.${NC}"
    fi
fi

# Push to GitHub
echo -e "${CYAN}Pushing to GitHub...${NC}"
echo -e "${YELLOW}You may be prompted to enter your GitHub credentials.${NC}"
git push origin master

# Check if push was successful
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Successfully pushed to GitHub!${NC}"
    echo -e "${GREEN}DigitalOcean should automatically deploy the new version if auto-deploy is enabled.${NC}"
    
    # Provide instructions for manual deployment
    echo -e "\n${YELLOW}If auto-deploy is not enabled, follow these steps:${NC}"
    echo -e "1. Go to your DigitalOcean App Platform dashboard"
    echo -e "2. Select your app"
    echo -e "3. Click on the 'Deploy' button"
    echo -e "4. Select the latest commit"
    echo -e "5. Click 'Deploy'"
else
    echo -e "${RED}Failed to push to GitHub. Please check the error messages above.${NC}"
fi

echo -e "${GREEN}Done!${NC}"
