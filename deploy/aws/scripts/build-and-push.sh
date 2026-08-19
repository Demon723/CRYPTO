#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo "🔨 LXON Docker Build and Push Script"
echo "====================================="

# Get AWS account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
if [ -z "$AWS_ACCOUNT_ID" ]; then
  echo "❌ Failed to get AWS account ID. Check your AWS credentials."
  exit 1
fi

# Get ECR login
echo "🔐 Logging into ECR..."
aws ecr get-login-password | docker login --username AWS --password-stdin "$AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com"

cd "$PROJECT_ROOT"

# Build and push all services
echo "🐳 Building and pushing lixon-node..."
docker build -t lixon-node:latest .
docker tag lixon-node:latest "$AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/lixon-node:latest"
docker push "$AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/lixon-node:latest"

echo "🐳 Building and pushing lixon-backend..."
docker build -t lixon-backend:latest -f apps/backend/Dockerfile .
docker tag lixon-backend:latest "$AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/lixon-backend:latest"
docker push "$AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/lixon-backend:latest"

echo "✅ All images built and pushed!"
