#!/bin/bash

# Deployment script for SimpleSwap AMM contract on GCE instance
# This script should be run on the Google Cloud instance where the LXON blockchain is running

set -e

echo "=== SimpleSwap AMM Deployment Script for GCE ==="
echo "This script deploys the SimpleSwap AMM contract to your LXON blockchain"
echo ""

# Check if we're in the right directory
if [ ! -d "apps/contracts" ]; then
    echo "Error: Please run this script from the LXON project root directory"
    exit 1
fi

cd apps/contracts

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "Creating .env file with deployment credentials..."
    cat > .env << EOF
PRIVATE_KEY=0xb61156c1ec13e33b775e5f7bfb1054ed640cbe71472f6dcf0060e778db4824f8
MAINNET_RPC_URL=http://localhost:8545
ETHERSCAN_API_KEY=
EOF
    echo ".env file created"
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    pnpm install
fi

# Compile contracts
echo "Compiling contracts..."
npx hardhat compile

# Deploy SimpleSwap contract
echo "Deploying SimpleSwap AMM contract..."
npx hardhat run scripts/deploy-swap-production.ts --network localhost

echo ""
echo "=== Deployment Complete ==="
echo "Check the deployments/ directory for deployment details"
echo "The AMM contract is now ready for liquidity provision"
