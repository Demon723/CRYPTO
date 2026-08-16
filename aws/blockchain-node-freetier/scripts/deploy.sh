#!/bin/bash

set -e

# LXON Blockchain Node - AWS Free Tier Deployment
# Deploys a cost-optimized LXON node on EC2 t2.micro (Free Tier eligible)

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     LXON Blockchain Node - AWS FREE TIER Deployment         ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

REGION="${AWS_REGION:-us-east-1}"
ENVIRONMENT="freetier"
PROJECT_NAME="lxon-node"

echo -e "${YELLOW}Configuration:${NC}"
echo "  Region: $REGION"
echo "  Instance: t2.micro (Free Tier: 750 hrs/month)"
echo "  Storage: 30GB total (Free Tier: 30GB/month)"
echo ""

echo -e "${YELLOW}⚠️  FREE TIER LIMITS:${NC}"
echo "  - t2.micro: 750 hours/month (1 instance running 24/7 = 720 hrs, fits within limit)"
echo "  - EBS: 30GB/month across all volumes"
echo "  - Data transfer: 100GB/month outbound free"
echo "  - Free Tier is valid for 12 months from AWS account creation"
echo ""

read -p "Continue with Free Tier deployment? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
  echo "Cancelled"
  exit 0
fi

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"
for cmd in aws terraform; do
  if ! command -v $cmd &> /dev/null; then
    echo -e "${RED}✗ $cmd is not installed${NC}"
    exit 1
  fi
done
echo -e "${GREEN}✓ Prerequisites met${NC}"
echo ""

# Verify AWS credentials
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text --region $REGION 2>/dev/null)
if [ -z "$AWS_ACCOUNT_ID" ]; then
  echo -e "${RED}✗ AWS credentials not configured${NC}"
  exit 1
fi
echo -e "${GREEN}✓ AWS Account: $AWS_ACCOUNT_ID${NC}"
echo ""

# Check for required environment variables
if [ -z "$VALIDATOR_ADDRESS" ] || [ -z "$VALIDATOR_KEY" ] || [ -z "$KEY_PAIR_NAME" ] || [ -z "$ALERT_EMAIL" ]; then
  echo -e "${RED}Missing required environment variables:${NC}"
  echo "  export VALIDATOR_ADDRESS=0x..."
  echo "  export VALIDATOR_KEY=0x..."
  echo "  export KEY_PAIR_NAME=your-ec2-key-pair"
  echo "  export ALERT_EMAIL=you@example.com"
  echo "  export GENESIS_TIME=\$(date +%s)"
  exit 1
fi

GENESIS_TIME="${GENESIS_TIME:-$(date +%s)}"

# Check if key pair exists
if ! aws ec2 describe-key-pairs --key-names "$KEY_PAIR_NAME" --region $REGION &>/dev/null; then
  echo -e "${YELLOW}Key pair '$KEY_PAIR_NAME' not found. Creating it...${NC}"
  aws ec2 create-key-pair \
    --key-name "$KEY_PAIR_NAME" \
    --region $REGION \
    --query 'KeyMaterial' \
    --output text > "${KEY_PAIR_NAME}.pem"
  chmod 400 "${KEY_PAIR_NAME}.pem"
  echo -e "${GREEN}✓ Key pair created: ${KEY_PAIR_NAME}.pem (SAVE THIS FILE!)${NC}"
fi

# Setup Terraform backend
echo -e "${YELLOW}Setting up Terraform backend...${NC}"
STATE_BUCKET="${PROJECT_NAME}-freetier-state-${AWS_ACCOUNT_ID}"
LOCKS_TABLE="${PROJECT_NAME}-freetier-locks"

if ! aws s3 ls "s3://${STATE_BUCKET}" --region $REGION 2>/dev/null; then
  aws s3api create-bucket \
    --bucket $STATE_BUCKET \
    --region $REGION \
    $([ "$REGION" != "us-east-1" ] && echo "--create-bucket-configuration LocationConstraint=$REGION") \
    2>/dev/null || true
  aws s3api put-bucket-versioning \
    --bucket $STATE_BUCKET \
    --versioning-configuration Status=Enabled \
    --region $REGION
fi

if ! aws dynamodb describe-table --table-name $LOCKS_TABLE --region $REGION 2>/dev/null; then
  aws dynamodb create-table \
    --table-name $LOCKS_TABLE \
    --attribute-definitions AttributeName=LockID,AttributeType=S \
    --key-schema AttributeName=LockID,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --region $REGION 2>/dev/null || true
fi
echo -e "${GREEN}✓ Terraform backend ready${NC}"
echo ""

# Deploy infrastructure
echo -e "${YELLOW}Deploying Free Tier infrastructure...${NC}"
cd aws/blockchain-node-freetier/terraform

terraform init \
  -backend-config="bucket=$STATE_BUCKET" \
  -backend-config="region=$REGION" \
  -upgrade

cat > terraform.auto.tfvars <<EOF
aws_region        = "$REGION"
alert_email       = "$ALERT_EMAIL"
key_pair_name     = "$KEY_PAIR_NAME"
validator_address = "$VALIDATOR_ADDRESS"
validator_key     = "$VALIDATOR_KEY"
genesis_time      = $GENESIS_TIME
EOF

terraform plan \
  -var-file="environments/freetier.tfvars" \
  -out=tfplan

echo ""
echo -e "${YELLOW}Review the plan above. Press Enter to apply, Ctrl+C to cancel.${NC}"
read -r

terraform apply tfplan

NODE_IP=$(terraform output -raw node_public_ip 2>/dev/null || echo "")
RPC_ENDPOINT=$(terraform output -raw node_rpc_endpoint 2>/dev/null || echo "")
INSTANCE_ID=$(terraform output -raw instance_id 2>/dev/null || echo "")

cd ../../..

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║          🎉 Free Tier Deployment Complete!                 ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}Instance Details:${NC}"
echo "  Instance ID: $INSTANCE_ID"
echo "  Public IP: $NODE_IP"
echo "  RPC Endpoint: $RPC_ENDPOINT"
echo ""
echo -e "${GREEN}SSH Access:${NC}"
echo "  ssh -i ${KEY_PAIR_NAME}.pem ubuntu@$NODE_IP"
echo ""
echo -e "${YELLOW}Note: The instance takes 3-5 minutes to fully initialize.${NC}"
echo -e "${YELLOW}Node software needs to be deployed via Docker after SSH access.${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. SSH into the instance"
echo "  2. Push your Docker image to ECR: $(cd aws/blockchain-node-freetier/terraform && terraform output -raw ecr_repository_url 2>/dev/null)"
echo "  3. Pull and run the image on the instance"
echo "  4. Test: curl $RPC_ENDPOINT"
echo ""
echo -e "${YELLOW}⚠️  FREE TIER REMINDER:${NC}"
echo "  - Monitor usage in AWS Billing Dashboard"
echo "  - Set up AWS Budgets alert at \$1 to avoid surprise charges"
echo "  - t2.micro Free Tier: 750 hrs/month for 12 months from account creation"
echo ""
