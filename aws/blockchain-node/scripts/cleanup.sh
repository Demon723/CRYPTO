#!/bin/bash

# LXON Node - AWS Cleanup Script
# Destroy all AWS infrastructure

set -e

REGION="${AWS_REGION:-us-east-1}"

echo "⚠️  WARNING: This will DELETE all LXON blockchain node infrastructure"
echo "Region: $REGION"
echo ""
read -p "Type 'yes' to confirm deletion: " confirm

if [ "$confirm" != "yes" ]; then
  echo "Cancelled"
  exit 0
fi

echo ""
echo "🧹 Destroying infrastructure..."

cd aws/blockchain-node/terraform

terraform destroy \
  -var-file="environments/prod.tfvars" \
  -auto-approve

echo ""
echo "Cleaning up S3 state..."
STATE_BUCKET="lxon-node-terraform-state-$(aws sts get-caller-identity --query Account --output text)"
aws s3 rm "s3://$STATE_BUCKET" --recursive --region $REGION 2>/dev/null || true

echo ""
echo "Cleaning up DynamoDB..."
aws dynamodb delete-table --table-name lxon-node-terraform-locks --region $REGION 2>/dev/null || true

echo ""
echo "✓ Cleanup complete"
