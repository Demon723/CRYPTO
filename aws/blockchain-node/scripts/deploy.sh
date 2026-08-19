#!/bin/bash

set -e

# LXON Blockchain Node - AWS Deployment Script
# Deploy a single LXON blockchain validator node to AWS ECS Fargate

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║       LXON Blockchain Node - AWS ECS Deployment            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Configuration
REGION="${AWS_REGION:-us-east-1}"
ENVIRONMENT="${ENVIRONMENT:-prod}"
PROJECT_NAME="lxon-node"

echo -e "${YELLOW}Configuration:${NC}"
echo "  Region: $REGION"
echo "  Environment: $ENVIRONMENT"
echo "  Project: $PROJECT_NAME"
echo ""

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"
for cmd in aws terraform docker jq; do
  if ! command -v $cmd &> /dev/null; then
    echo -e "${RED}✗ $cmd is not installed${NC}"
    exit 1
  fi
done
echo -e "${GREEN}✓ All prerequisites met${NC}"
echo ""

# Verify AWS credentials
echo -e "${YELLOW}Verifying AWS credentials...${NC}"
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text --region $REGION 2>/dev/null)
if [ -z "$AWS_ACCOUNT_ID" ]; then
  echo -e "${RED}✗ AWS credentials not configured or invalid${NC}"
  exit 1
fi
echo -e "${GREEN}✓ AWS Account: $AWS_ACCOUNT_ID${NC}"
echo ""

ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com"

# Step 1: Create S3 backend for Terraform state
echo -e "${YELLOW}Setting up Terraform backend...${NC}"
STATE_BUCKET="${PROJECT_NAME}-terraform-state-${AWS_ACCOUNT_ID}"
LOCKS_TABLE="${PROJECT_NAME}-terraform-locks"

if ! aws s3 ls "s3://${STATE_BUCKET}" --region $REGION 2>/dev/null; then
  echo -e "${YELLOW}  Creating S3 bucket for state...${NC}"
  aws s3api create-bucket \
    --bucket $STATE_BUCKET \
    --region $REGION \
    $([ "$REGION" != "us-east-1" ] && echo "--create-bucket-configuration LocationConstraint=$REGION") \
    2>/dev/null || true
  
  aws s3api put-bucket-versioning \
    --bucket $STATE_BUCKET \
    --versioning-configuration Status=Enabled \
    --region $REGION
  
  aws s3api put-bucket-encryption \
    --bucket $STATE_BUCKET \
    --server-side-encryption-configuration '{"Rules": [{"ApplyServerSideEncryptionByDefault": {"SSEAlgorithm": "AES256"}}]}' \
    --region $REGION
fi

if ! aws dynamodb describe-table --table-name $LOCKS_TABLE --region $REGION 2>/dev/null; then
  echo -e "${YELLOW}  Creating DynamoDB locks table...${NC}"
  aws dynamodb create-table \
    --table-name $LOCKS_TABLE \
    --attribute-definitions AttributeName=LockID,AttributeType=S \
    --key-schema AttributeName=LockID,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --region $REGION 2>/dev/null || true
fi
echo -e "${GREEN}✓ Terraform backend ready${NC}"
echo ""

# Step 2: Build Docker image
echo -e "${YELLOW}Building Docker image...${NC}"
docker build \
  -f docker/lxon-node.Dockerfile \
  -t $PROJECT_NAME:latest \
  -t $PROJECT_NAME:$(date +%s) \
  . || {
  echo -e "${RED}✗ Docker build failed${NC}"
  exit 1
}
echo -e "${GREEN}✓ Docker image built${NC}"
echo ""

# Step 3: Push to ECR
echo -e "${YELLOW}Pushing image to ECR...${NC}"
aws ecr get-login-password --region $REGION | \
  docker login --username AWS --password-stdin $ECR_REGISTRY

# Create ECR repository if it doesn't exist
aws ecr describe-repositories --repository-names lxon-node --region $REGION 2>/dev/null || \
  aws ecr create-repository --repository-name lxon-node --region $REGION 2>/dev/null || true

docker tag $PROJECT_NAME:latest $ECR_REGISTRY/lxon-node:latest
docker tag $PROJECT_NAME:latest $ECR_REGISTRY/lxon-node:$(date +%s)

docker push $ECR_REGISTRY/lxon-node:latest
docker push $ECR_REGISTRY/lxon-node:$(date +%s)

echo -e "${GREEN}✓ Image pushed to ECR${NC}"
echo ""

# Step 4: Deploy Terraform
echo -e "${YELLOW}Deploying infrastructure with Terraform...${NC}"
cd aws/blockchain-node/terraform

terraform init \
  -backend-config="bucket=$STATE_BUCKET" \
  -backend-config="region=$REGION" \
  -upgrade

# Create tfvars file
cat > terraform.auto.tfvars <<EOF
aws_region         = "$REGION"
environment        = "$ENVIRONMENT"
alert_email        = "${ALERT_EMAIL:-noreply@example.com}"
validator_address   = "${VALIDATOR_ADDRESS}"
validator_key       = "${VALIDATOR_KEY}"
genesis_time        = ${GENESIS_TIME}
EOF

echo -e "${YELLOW}  Planning deployment...${NC}"
terraform plan \
  -var-file="environments/${ENVIRONMENT}.tfvars" \
  -out=tfplan

echo ""
echo -e "${YELLOW}Review the plan above.${NC}"
echo -e "${YELLOW}To proceed, press Enter. To cancel, press Ctrl+C${NC}"
read -r

echo -e "${YELLOW}  Applying deployment...${NC}"
terraform apply tfplan

# Get outputs
NODE_RPC=$(terraform output -raw node_rpc_endpoint 2>/dev/null || echo "")
NODE_WS=$(terraform output -raw node_ws_endpoint 2>/dev/null || echo "")
CLUSTER_NAME=$(terraform output -raw ecs_cluster_name 2>/dev/null || echo "")

cd ../../..

echo -e "${GREEN}✓ Infrastructure deployed${NC}"
echo ""

# Step 5: Summary
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║               🎉 Deployment Complete!                      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}RPC Endpoints:${NC}"
echo "  HTTP: $NODE_RPC"
echo "  WebSocket: $NODE_WS"
echo ""
echo -e "${GREEN}Service:${NC}"
echo "  Cluster: $CLUSTER_NAME"
echo "  Service: $PROJECT_NAME-node"
echo ""
echo -e "${GREEN}ECR Repository:${NC}"
echo "  $ECR_REGISTRY/lxon-node"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "  1. Point your dApps to: $NODE_RPC"
echo "  2. Monitor logs: aws logs tail /ecs/$PROJECT_NAME-$ENVIRONMENT --follow"
echo "  3. Check health: curl $NODE_RPC/health"
echo "  4. View dashboard: aws ecs describe-services --cluster $CLUSTER_NAME --services $PROJECT_NAME-node --region $REGION"
echo ""
