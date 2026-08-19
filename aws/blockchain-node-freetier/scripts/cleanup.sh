#!/bin/bash

set -e

REGION="${AWS_REGION:-us-east-1}"

echo "⚠️  This will DESTROY the LXON Free Tier deployment (EC2, EBS, VPC, etc)"
read -p "Type 'yes' to confirm: " confirm

if [ "$confirm" != "yes" ]; then
  echo "Cancelled"
  exit 0
fi

cd aws/blockchain-node-freetier/terraform

terraform destroy \
  -var-file="environments/freetier.tfvars" \
  -auto-approve

cd ../../..

AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
STATE_BUCKET="lxon-node-freetier-state-${AWS_ACCOUNT_ID}"

echo "Cleaning up Terraform state backend..."
aws s3 rm "s3://$STATE_BUCKET" --recursive --region $REGION 2>/dev/null || true
aws dynamodb delete-table --table-name lxon-node-freetier-locks --region $REGION 2>/dev/null || true

echo "✓ Cleanup complete. No more Free Tier resources should be running."
echo "Verify in AWS Console: EC2 > Instances, EBS > Volumes"
