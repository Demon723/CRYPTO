#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
TERRAFORM_DIR="$PROJECT_ROOT/deploy/aws/terraform"

echo "🚀 LXON AWS Deployment Script"
echo "=============================="

# Check prerequisites
command -v terraform >/dev/null 2>&1 || { echo "❌ Terraform is required but not installed."; exit 1; }
command -v aws >/dev/null 2>&1 || { echo "❌ AWS CLI is required but not installed."; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "❌ Docker is required but not installed."; exit 1; }

# Get AWS account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
if [ -z "$AWS_ACCOUNT_ID" ]; then
  echo "❌ Failed to get AWS account ID. Check your AWS credentials."
  exit 1
fi
echo "✅ AWS Account ID: $AWS_ACCOUNT_ID"

# Check terraform.tfvars exists
if [ ! -f "$TERRAFORM_DIR/terraform.tfvars" ]; then
  echo "⚠️  terraform.tfvars not found. Creating from example..."
  cp "$TERRAFORM_DIR/terraform.tfvars.example" "$TERRAFORM_DIR/terraform.tfvars"
  echo "📝 Please edit $TERRAFORM_DIR/terraform.tfvars with your values and re-run."
  exit 1
fi

# Initialize Terraform
echo "🔧 Initializing Terraform..."
cd "$TERRAFORM_DIR"
terraform init -upgrade

# Plan
echo "📋 Planning deployment..."
terraform plan -out=tfplan

# Apply
echo "🏗️  Applying infrastructure changes..."
terraform apply tfplan

# Get outputs
echo "📤 Getting deployment outputs..."
ALB_DNS=$(terraform output -raw alb_dns_name)
ALB_URL=$(terraform output -raw alb_url)
ECS_CLUSTER=$(terraform output -raw ecs_cluster_name)
ECS_SERVICE=$(terraform output -raw ecs_service_name)
RDS_ENDPOINT=$(terraform output -raw rds_endpoint)

echo ""
echo "✅ Deployment Complete!"
echo "======================"
echo "🌐 Application URL: $ALB_URL"
echo "📊 CloudWatch Dashboard: $(terraform output -raw cloudwatch_dashboard_url)"
echo "🗄️  RDS Endpoint: $RDS_ENDPOINT"
echo ""
echo "Next steps:"
echo "1. Update your DNS to point to $ALB_DNS"
echo "2. Configure your application with the RDS endpoint"
echo "3. Monitor health at $ALB_URL/health"
