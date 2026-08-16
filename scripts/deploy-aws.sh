#!/bin/bash

set -e

# AWS Deployment Script for LXON
# This script sets up the complete AWS infrastructure and deploys LXON

REGION="${AWS_REGION:-us-east-1}"
ENVIRONMENT="${ENVIRONMENT:-prod}"
PROJECT_NAME="lxon"

echo "🚀 LXON AWS Deployment Script"
echo "================================"
echo "Region: $REGION"
echo "Environment: $ENVIRONMENT"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo -e "${YELLOW}📋 Checking prerequisites...${NC}"
command -v aws >/dev/null 2>&1 || { echo -e "${RED}AWS CLI is required but not installed.${NC}"; exit 1; }
command -v terraform >/dev/null 2>&1 || { echo -e "${RED}Terraform is required but not installed.${NC}"; exit 1; }
command -v docker >/dev/null 2>&1 || { echo -e "${RED}Docker is required but not installed.${NC}"; exit 1; }

# Verify AWS credentials
echo -e "${YELLOW}🔐 Verifying AWS credentials...${NC}"
aws sts get-caller-identity --region $REGION > /dev/null 2>&1 || { echo -e "${RED}AWS credentials not configured or invalid.${NC}"; exit 1; }
echo -e "${GREEN}✓ AWS credentials verified${NC}"

# Create S3 bucket for Terraform state
echo -e "${YELLOW}📦 Setting up Terraform state backend...${NC}"
STATE_BUCKET="${PROJECT_NAME}-terraform-state-${REGION}"
if ! aws s3 ls "s3://${STATE_BUCKET}" 2>/dev/null; then
    echo -e "${YELLOW}Creating S3 bucket for Terraform state...${NC}"
    aws s3api create-bucket \
        --bucket $STATE_BUCKET \
        --region $REGION \
        $([ "$REGION" != "us-east-1" ] && echo "--create-bucket-configuration LocationConstraint=$REGION") \
        2>/dev/null || true
    
    # Enable versioning
    aws s3api put-bucket-versioning \
        --bucket $STATE_BUCKET \
        --versioning-configuration Status=Enabled \
        --region $REGION
    
    # Enable encryption
    aws s3api put-bucket-encryption \
        --bucket $STATE_BUCKET \
        --server-side-encryption-configuration '{"Rules": [{"ApplyServerSideEncryptionByDefault": {"SSEAlgorithm": "AES256"}}]}' \
        --region $REGION
    
    echo -e "${GREEN}✓ S3 bucket created: $STATE_BUCKET${NC}"
fi

# Create DynamoDB table for Terraform locks
LOCKS_TABLE="${PROJECT_NAME}-terraform-locks"
if ! aws dynamodb describe-table --table-name $LOCKS_TABLE --region $REGION 2>/dev/null; then
    echo -e "${YELLOW}Creating DynamoDB table for Terraform locks...${NC}"
    aws dynamodb create-table \
        --table-name $LOCKS_TABLE \
        --attribute-definitions AttributeName=LockID,AttributeType=S \
        --key-schema AttributeName=LockID,KeyType=HASH \
        --billing-mode PAY_PER_REQUEST \
        --region $REGION
    
    echo -e "${GREEN}✓ DynamoDB table created: $LOCKS_TABLE${NC}"
fi

# Initialize Terraform
cd aws/terraform

echo -e "${YELLOW}🏗️ Initializing Terraform...${NC}"
terraform init \
    -backend-config="bucket=$STATE_BUCKET" \
    -backend-config="region=$REGION" \
    -upgrade

echo -e "${GREEN}✓ Terraform initialized${NC}"

# Plan Terraform deployment
echo -e "${YELLOW}📊 Planning infrastructure...${NC}"
terraform plan \
    -var-file="environments/${ENVIRONMENT}.tfvars" \
    -out=tfplan

echo -e "${YELLOW}❓ Review the plan above. Do you want to apply? (yes/no)${NC}"
read -r APPLY_CONFIRM

if [ "$APPLY_CONFIRM" != "yes" ]; then
    echo -e "${RED}❌ Deployment cancelled${NC}"
    exit 0
fi

# Apply Terraform deployment
echo -e "${YELLOW}🚀 Applying infrastructure...${NC}"
terraform apply tfplan

# Get outputs
echo -e "${YELLOW}📤 Retrieving outputs...${NC}"
ALB_DNS=$(terraform output -raw alb_dns_name)
ECR_REPOS=$(terraform output -json ecr_repositories)
RDS_ENDPOINT=$(terraform output -raw rds_endpoint)
REDIS_ENDPOINT=$(terraform output -raw redis_endpoint)

echo -e "${GREEN}✓ Infrastructure created successfully${NC}"

cd ../..

# Build and push Docker images
echo -e "${YELLOW}🐳 Building and pushing Docker images...${NC}"

ECR_REGISTRY="${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com"

# Get AWS Account ID
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# Login to ECR
echo -e "${YELLOW}Logging in to ECR...${NC}"
aws ecr get-login-password --region $REGION | \
    docker login --username AWS --password-stdin $ECR_REGISTRY

# Build and push each service
SERVICES=("lxon-node" "lxon-backend" "lxon-explorer")
DOCKERFILES=("docker/lxon-node.Dockerfile" "docker/lxon-backend.Dockerfile" "docker/lxon-explorer.Dockerfile")

for i in "${!SERVICES[@]}"; do
    SERVICE=${SERVICES[$i]}
    DOCKERFILE=${DOCKERFILES[$i]}
    
    echo -e "${YELLOW}Building $SERVICE...${NC}"
    docker build \
        -f $DOCKERFILE \
        -t $ECR_REGISTRY/$SERVICE:latest \
        -t $ECR_REGISTRY/$SERVICE:$(date +%s) \
        .
    
    echo -e "${YELLOW}Pushing $SERVICE to ECR...${NC}"
    docker push $ECR_REGISTRY/$SERVICE:latest
    docker push $ECR_REGISTRY/$SERVICE:$(date +%s)
done

echo -e "${GREEN}✓ Docker images pushed to ECR${NC}"

# Output deployment information
echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo -e "${YELLOW}Access Information:${NC}"
echo "  ALB DNS: $ALB_DNS"
echo "  RDS Endpoint: $RDS_ENDPOINT"
echo "  Redis Endpoint: $REDIS_ENDPOINT"
echo ""
echo -e "${YELLOW}Services:${NC}"
echo "  Block Explorer: http://$ALB_DNS"
echo "  Backend API: http://$ALB_DNS/api/v1"
echo "  Blockchain Node: http://$ALB_DNS:8545"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "  1. Update your DNS records to point to the ALB"
echo "  2. Configure SSL/TLS certificate (recommended: AWS Certificate Manager)"
echo "  3. Set up CloudWatch alarms and monitoring"
echo "  4. Configure auto-scaling policies"
echo ""
