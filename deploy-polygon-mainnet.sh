#!/bin/bash

# Deploy LXON to Polygon Mainnet from Google Cloud Shell
# This script automates the deployment process

set -e

echo "=== LXON Polygon Mainnet Deployment ==="
echo ""

# Check if we're in the right directory
if [ ! -d "apps/contracts" ]; then
    echo "Error: apps/contracts directory not found"
    echo "Please run this script from the project root"
    exit 1
fi

# Navigate to contracts directory
cd apps/contracts

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cat > .env << EOF
# Polygon Mainnet Configuration
POLYGON_RPC_URL=https://polygon-rpc.com
CHAIN_ID=137

# Wallet Configuration - REPLACE WITH YOUR ACTUAL VALUES
PRIVATE_KEY=your_private_key_here
DEPLOYER_ADDRESS=your_deployer_address

# Contract Configuration
TOKEN_NAME=LXON
TOKEN_SYMBOL=LXON
INITIAL_SUPPLY=100000000000000000000000000

# Liquidity Configuration
INITIAL_LIQUIDITY_TOKEN=10000000000000000000000
INITIAL_LIQUIDITY_NATIVE=1000000000000000000

# Token Sale Configuration
SALE_DURATION=2592000
TOKEN_PRICE=100000000000000
SALE_CAP=1000000000000000000000000

# Security
MULTISIG_ADDRESS=your_multisig_address
EMERGENCY_ADDRESS=your_emergency_address
EOF
    echo "⚠️  Please edit .env file with your actual values before continuing"
    echo "Run: nano .env"
    exit 1
fi

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

# Validate critical environment variables
if [ "$PRIVATE_KEY" = "your_private_key_here" ]; then
    echo "❌ Error: Please set your actual PRIVATE_KEY in .env file"
    exit 1
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Compile contracts
echo "Compiling contracts..."
npx hardhat compile

# Deploy to Polygon
echo "Deploying to Polygon mainnet..."
npx hardhat run scripts/deploy-evm-compatible.ts --network polygon

echo ""
echo "=== Deployment Complete ==="
echo "Check deployments/137-evm-ecosystem.json for contract addresses"
