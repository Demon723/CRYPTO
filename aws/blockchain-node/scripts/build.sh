#!/bin/bash

# LXON Node - Build locally and prepare for AWS push

set -e

echo "🐳 Building LXON Blockchain Node Docker image..."
echo ""

# Build production image
docker build \
  -f docker/lxon-node.Dockerfile \
  -t lxon-node:latest \
  -t lxon-node:$(date +%s) \
  --compress \
  .

echo ""
echo "✓ Docker image built successfully"
echo ""
echo "Image details:"
docker images | grep lxon-node | head -2
echo ""
echo "To push to AWS ECR:"
echo "  export AWS_REGION=us-east-1"
echo "  export VALIDATOR_ADDRESS=0x..."
echo "  export VALIDATOR_KEY=0x..."
echo "  export GENESIS_TIME=$(date +%s)"
echo "  export ALERT_EMAIL=ops@example.com"
echo "  bash aws/blockchain-node/scripts/deploy.sh"
echo ""
