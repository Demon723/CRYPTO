#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo "🛠️  LXON AWS Setup Script"
echo "========================="

# Check prerequisites
command -v aws >/dev/null 2>&1 || { echo "❌ AWS CLI is required but not installed."; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "❌ Docker is required but not installed."; exit 1; }

# Get AWS account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
if [ -z "$AWS_ACCOUNT_ID" ]; then
  echo "❌ Failed to get AWS account ID. Check your AWS credentials."
  exit 1
fi
echo "✅ AWS Account ID: $AWS_ACCOUNT_ID"

# Create ECR repositories
echo "📦 Creating ECR repositories..."
SERVICES=("lixon-node" "lixon-backend" "lixon-explorer")
for service in "${SERVICES[@]}"; do
  if ! aws ecr describe-repositories --repository-names "$service" >/dev/null 2>&1; then
    aws ecr create-repository --repository-name "$service"
    echo "  ✅ Created repository: $service"
  else
    echo "  ⏭️  Repository exists: $service"
  fi
done

# Login to ECR
echo "🔐 Logging into ECR..."
aws ecr get-login-password | docker login --username AWS --password-stdin "$AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com"

# Build and push Docker images
echo "🐳 Building and pushing Docker images..."
cd "$PROJECT_ROOT"

# Build lixon-node
echo "  Building lixon-node..."
docker build -t lixon-node:latest .
docker tag lixon-node:latest "$AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/lixon-node:latest"
docker push "$AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/lixon-node:latest"

# Build lixon-backend
echo "  Building lixon-backend..."
docker build -t lixon-backend:latest -f apps/backend/Dockerfile .
docker tag lixon-backend:latest "$AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/lixon-backend:latest"
docker push "$AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/lixon-backend:latest"

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Run ./deploy/aws/scripts/deploy.sh to deploy infrastructure"
echo "2. Configure terraform.tfvars with your settings"
