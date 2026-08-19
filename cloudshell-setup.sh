#!/bin/bash

# Quick setup for Google Cloud Shell
# This will clone the repository and prepare for deployment

echo "=== LXON Google Cloud Setup ==="

# Install git if not installed
if ! command -v git &> /dev/null; then
    echo "Installing git..."
    sudo apt-get update && sudo apt-get install -y git
fi

# Clone the repository
echo "Cloning LXON repository..."
git clone https://github.com/Demon723/CRYPTO.git
cd CRYPTO

# Navigate to the scripts directory
cd scripts

# Make the deployment script executable
echo "Making deployment script executable..."
chmod +x deploy-google-cloud.sh
chmod +x validator-setup.sh
chmod +x rpc-setup.sh

echo ""
echo "=== Setup Complete ==="
echo "Now run: ./deploy-google-cloud.sh"