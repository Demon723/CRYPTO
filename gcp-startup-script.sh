#!/bin/bash

# Google Cloud Startup Script for LXON VM
# This script runs automatically when the VM is created

# Update system
apt update && apt upgrade -y

# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install Python and build tools
apt install -y python3 python3-pip build-essential git

# Install PM2 for process management
npm install -g pm2

# Install Hardhat
npm install -g hardhat

# Install Nginx for reverse proxy
apt install -y nginx certbot python3-certbot-nginx

# Create deployment directory
mkdir -p /var/www/lxon

# Set permissions
chown -R $USER:$USER /var/www/lxon

echo "Startup script completed successfully"
