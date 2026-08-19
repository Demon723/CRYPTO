#!/bin/bash

# Make scripts executable
chmod +x scripts/deploy-aws.sh

# Build production Docker images
docker build \
  -f docker/lxon-node.Dockerfile \
  -t lxon-node:latest \
  .

docker build \
  -f docker/lxon-backend.Dockerfile \
  -t lxon-backend:latest \
  .

docker build \
  -f docker/lxon-explorer.Dockerfile \
  -t lxon-explorer:latest \
  .

echo "✓ Docker images built successfully"
echo ""
echo "To push to ECR:"
echo "  AWS_REGION=us-east-1 bash scripts/deploy-aws.sh"
