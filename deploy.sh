#!/bin/bash

# LXON Deployment Script
# This script pulls latest changes and restarts services

set -e

echo "=== Starting LXON Deployment ==="

# Navigate to project directory
cd /var/www/lxon

# Pull latest changes
echo "Pulling latest changes from GitHub..."
git pull origin main

# Navigate to contracts directory
cd apps/contracts

# Install dependencies
echo "Installing dependencies..."
npm install

# Compile contracts
echo "Compiling contracts..."
npx hardhat compile

# Restart services with PM2
echo "Restarting services..."
pm2 restart lxon-node || pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

echo "=== Deployment Complete ==="
