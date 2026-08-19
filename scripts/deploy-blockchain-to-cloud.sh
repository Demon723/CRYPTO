#!/bin/bash

# Deploy LXON Blockchain Node to Google Cloud RPC Instance
# Run this from Cloud Shell

set -e

echo "=== Deploying LXON Blockchain Node ==="

# From Cloud Shell, copy the built blockchain to the RPC instance
echo "Copying blockchain code to RPC instance..."
gcloud compute scp --recurse apps/lxon-blockchain/dist lxon-rpc-1:/lxon/blockchain --zone=us-central1-a

echo "=== SSH into RPC Instance to Start Blockchain Node ==="
echo "Run these commands:"
echo ""
echo "gcloud compute ssh lxon-rpc-1 --zone=us-central1-a"
echo ""
echo "# Inside the RPC instance:"
echo "cd /lxon/blockchain"
echo ""
echo "# Stop the old simple RPC server"
echo "sudo killall node"
echo ""
echo "# Start the LXON blockchain node"
echo "NODE_ID=lxon-validator-1 PORT=8545 CHAIN_ID=723 BLOCK_TIME_MS=5000 VALIDATORS=validator-1,validator-2,validator-3 node dist/node.js &"
echo ""
echo "# Test the blockchain node"
echo "curl -X POST http://localhost:8545 -H 'Content-Type: application/json' -d '{\"jsonrpc\":\"2.0\",\"method\":\"eth_blockNumber\",\"params\":[],\"id\":1}'"
echo ""
echo "# Use nohup to keep it running"
echo "nohup node dist/node.js > /lxon/blockchain.log 2>&1 &"
echo ""
echo "# Exit and test from Cloud Shell"
echo "exit"
echo ""
echo "# From Cloud Shell, test external access"
echo "curl -X POST http://34.9.210.192 -H 'Content-Type: application/json' -d '{\"jsonrpc\":\"2.0\",\"method\":\"eth_blockNumber\",\"params\":[],\"id\":1}'"