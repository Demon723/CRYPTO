#!/bin/bash

# LXON Validator Node Setup Script for Google Cloud
# This script sets up a validator node for the LXON blockchain

set -e

echo "=== LXON Validator Node Setup ==="

# Update system
echo "Updating system packages..."
apt-get update && apt-get upgrade -y

# Install dependencies
echo "Installing dependencies..."
apt-get install -y docker.io docker-compose git curl wget nodejs npm build-essential

# Start Docker
echo "Starting Docker service..."
systemctl start docker
systemctl enable docker

# Create LXON directory
echo "Creating LXON directory..."
mkdir -p /lxon
cd /lxon

# Clone LXON repository
echo "Cloning LXON repository..."
git clone https://github.com/Demon723/CRYPTO.git
cd CRYPTO

# Install Node.js dependencies
echo "Installing Node.js dependencies..."
cd apps/contracts
npm install --silent

# Create validator configuration
echo "Creating validator configuration..."
mkdir -p /lxon/config
cat > /lxon/config/validator.json << 'EOF'
{
  "chainId": 723,
  "networkId": 723,
  "genesisBlock": {
    "timestamp": 1690000000,
    "difficulty": "0x20000",
    "gasLimit": "0x47b760",
    "coinbase": "0x0000000000000000000000000000000000000000",
    "alloc": {
      "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266": {
        "balance": "1000000000000000000000000000"
      }
    }
  },
  "consensus": {
    "type": "pos",
    "validators": [],
    "blockTime": 5,
    "epochLength": 1000
  },
  "p2p": {
    "port": 30303,
    "discovery": true,
    "bootnodes": []
  },
  "rpc": {
    "enabled": true,
    "port": 8545,
    "cors": "*",
    "apis": ["eth", "net", "web3", "lxon"]
  }
}
EOF

# Create systemd service
echo "Creating systemd service..."
cat > /etc/systemd/system/lxon-validator.service << 'SERVICE'
[Unit]
Description=LXON Validator Node
After=network.target docker.service

[Service]
Type=simple
User=root
WorkingDirectory=/lxon/CRYPTO
ExecStart=/usr/bin/npm run start:validator
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
SERVICE

# Reload systemd
systemctl daemon-reload

# Enable and start service
echo "Enabling and starting LXON validator service..."
systemctl enable lxon-validator
systemctl start lxon-validator

# Wait for service to start
sleep 5

# Check service status
echo "Checking service status..."
systemctl status lxon-validator

echo ""
echo "=== LXON Validator Node Setup Complete ==="
echo "Validator node is now running and configured."
echo "Check logs with: journalctl -u lxon-validator -f"
echo "Check status with: systemctl status lxon-validator"