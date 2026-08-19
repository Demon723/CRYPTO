#!/bin/bash

# Build and Deploy LXON Blockchain Node to Google Cloud
# This script builds the blockchain node and deploys it to the RPC instance

set -e

echo "=== Building LXON Blockchain Node ==="

# Navigate to blockchain directory
cd apps/lxon-blockchain

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the project
echo "Building TypeScript..."
npm run build

echo "Build complete!"

echo "=== Preparing for Deployment ==="

# Create deployment package
mkdir -p dist-package
cp -r dist/* dist-package/
cp package.json dist-package/
cp -r node_modules dist-package/

echo "Deployment package ready in dist-package/"

echo "=== Deployment Instructions ==="
echo "1. Copy dist-package/ to the Google Cloud RPC instance:"
echo "   gcloud compute scp --recurse dist-package/ lxon-rpc-1:/lxon/ --zone=us-central1-a"
echo ""
echo "2. SSH into the RPC instance:"
echo "   gcloud compute ssh lxon-rpc-1 --zone=us-central1-a"
echo ""
echo "3. Navigate to the deployment directory:"
echo "   cd /lxon/dist-package"
echo ""
echo "4. Start the blockchain node:"
echo "   NODE_ID=lxon-validator-1 PORT=8545 CHAIN_ID=723 BLOCK_TIME_MS=5000 npm start"
echo ""
echo "5. Stop the old simple RPC server:"
echo "   sudo killall node"
echo ""
echo "6. Configure Nginx to proxy to port 8545 (already configured)"
echo ""
echo "7. Test the blockchain node:"
echo "   curl -X POST http://localhost:8545 -H 'Content-Type: application/json' -d '{\"jsonrpc\":\"2.0\",\"method\":\"eth_blockNumber\",\"params\":[],\"id\":1}'"