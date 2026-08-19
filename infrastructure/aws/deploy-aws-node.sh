#!/usr/bin/env bash

# LXON Blockchain Node AWS Automated Deployment Script
set -e

REGION="${AWS_REGION:-us-east-1}"
ENV="${ENVIRONMENT:-mainnet}"

echo "================================================================"
echo "  LXON BLOCKCHAIN NODE - AWS DEPLOYMENT AUTOMATION"
echo "  Region: $REGION | Environment: $ENV"
echo "================================================================"

# 1. Verify required tools
command -v aws >/dev/null 2>&1 || { echo "❌ AWS CLI is required but not installed. Aborting."; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "❌ Docker is required but not installed. Aborting."; exit 1; }
command -v terraform >/dev/null 2>&1 || { echo "❌ Terraform is required but not installed. Aborting."; exit 1; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE_ROOT="$(cd "$SCRIPT_DIR/../../" && pwd)"

echo "[1/5] Initializing Terraform infrastructure..."
cd "$SCRIPT_DIR/terraform"
terraform init

echo "[2/5] Planning Terraform infrastructure..."
terraform plan -out=tfplan

echo "[3/5] Applying Terraform infrastructure..."
terraform apply -auto-approve tfplan

ECR_URL=$(terraform output -raw ecr_repository_url)
ALB_DNS=$(terraform output -raw alb_dns_name)

echo "[4/5] Building & Pushing LXON Node Docker container..."
cd "$WORKSPACE_ROOT/apps/lxon-blockchain"

aws ecr get-login-password --region "$REGION" | docker login --username AWS --password-stdin "$ECR_URL"

docker build -t lxon-blockchain-node .
docker tag lxon-blockchain-node:latest "$ECR_URL:latest"
docker push "$ECR_URL:latest"

echo "[5/5] Restarting ECS task with latest node container..."
CLUSTER_NAME=$(cd "$SCRIPT_DIR/terraform" && terraform output -raw ecs_cluster_name)
aws ecs update-service --cluster "$CLUSTER_NAME" --service lxon-node-service --force-new-deployment --region "$REGION" > /dev/null

echo "================================================================"
echo "  LXON BLOCKCHAIN NODE DEPLOYED SUCCESSFULLY TO AWS!"
echo "  RPC Endpoint: http://$ALB_DNS:8545"
echo "  Health Check: http://$ALB_DNS:8545/health"
echo "  Metrics:      http://$ALB_DNS:8545/metrics"
echo "================================================================"
