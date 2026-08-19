#!/bin/bash

# Automated LXON Blockchain Deployment on Google Cloud
# This script automates the entire deployment process

set -e

# Configuration
PROJECT_ID="lxon-blockchain"
REGION="us-central1"
ZONE="us-central1-a"
NETWORK_NAME="lxon-network"
SUBNET_NAME="lxon-subnet"
SUBNET_RANGE="10.0.0.0/24"
VALIDATOR_COUNT=3
RPC_COUNT=2

echo "=== LXON Blockchain Deployment on Google Cloud ==="
echo "Project: $PROJECT_ID"
echo "Region: $REGION"
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "Error: gcloud CLI is not installed"
    echo "Install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Step 1: Create project
echo "Step 1: Creating Google Cloud project..."
gcloud projects create $PROJECT_ID || echo "Project may already exist"
gcloud config set project $PROJECT_ID

# Step 2: Enable APIs
echo "Step 2: Enabling required APIs..."
gcloud services enable compute.googleapis.com
gcloud services enable container.googleapis.com
gcloud services enable cloudresourcemanager.googleapis.com
gcloud services enable iam.googleapis.com

# Step 3: Create network
echo "Step 3: Creating VPC network..."
gcloud compute networks create $NETWORK_NAME \
  --subnet-mode=custom || echo "Network may already exist"

gcloud compute networks subnets create $SUBNET_NAME \
  --network=$NETWORK_NAME \
  --region=$REGION \
  --range=$SUBNET_RANGE || echo "Subnet may already exist"

# Step 4: Create firewall rules
echo "Step 4: Creating firewall rules..."
gcloud compute firewall-rules create lxon-allow-p2p \
  --network=$NETWORK_NAME \
  --allow=tcp:30303,udp:30303 \
  --source-ranges=0.0.0.0/0 || echo "Firewall rule may already exist"

gcloud compute firewall-rules create lxon-allow-rpc \
  --network=$NETWORK_NAME \
  --allow=tcp:8545,8546 \
  --source-ranges=0.0.0.0/0 || echo "Firewall rule may already exist"

gcloud compute firewall-rules create lxon-allow-ssh \
  --network=$NETWORK_NAME \
  --allow=tcp:22 \
  --source-ranges=0.0.0.0/0 || echo "Firewall rule may already exist"

# Step 5: Upload setup scripts
echo "Step 5: Uploading setup scripts to Cloud Storage..."
gsutil mb gs://lxon-deployment-scripts || echo "Bucket may already exist"
gsutil cp scripts/validator-setup.sh gs://lxon-deployment-scripts/
gsutil cp scripts/rpc-setup.sh gs://lxon-deployment-scripts/

# Step 6: Create validator instance template
echo "Step 6: Creating validator instance template..."
gcloud compute instance-templates create lxon-validator-template \
  --machine-type=n2-standard-4 \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud \
  --boot-disk-size=100GB \
  --boot-disk-type=pd-ssd \
  --network=$NETWORK_NAME \
  --subnet=$SUBNET_NAME \
  --tags=lxon-validator \
  --metadata-from-file=startup-script=<(gsutil cat gs://lxon-deployment-scripts/validator-setup.sh) || echo "Template may already exist"

# Step 7: Create RPC instance template
echo "Step 7: Creating RPC instance template..."
gcloud compute instance-templates create lxon-rpc-template \
  --machine-type=n2-standard-2 \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud \
  --boot-disk-size=200GB \
  --boot-disk-type=pd-ssd \
  --network=$NETWORK_NAME \
  --subnet=$SUBNET_NAME \
  --tags=lxon-rpc \
  --metadata-from-file=startup-script=<(gsutil cat gs://lxon-deployment-scripts/rpc-setup.sh) || echo "Template may already exist"

# Step 8: Deploy validator nodes
echo "Step 8: Deploying validator nodes..."
gcloud compute instance-groups managed create lxon-validators \
  --base-instance-name=lxon-validator \
  --template=lxon-validator-template \
  --size=$VALIDATOR_COUNT \
  --region=$REGION || echo "Instance group may already exist"

# Step 9: Deploy RPC nodes
echo "Step 9: Deploying RPC nodes..."
gcloud compute instance-groups managed create lxon-rpcs \
  --base-instance-name=lxon-rpc \
  --template=lxon-rpc-template \
  --size=$RPC_COUNT \
  --region=$REGION || echo "Instance group may already exist"

# Step 10: Wait for instances to be ready
echo "Step 10: Waiting for instances to be ready..."
gcloud compute instance-groups managed wait-until-stable lxon-validators \
  --region=$REGION || true
gcloud compute instance-groups managed wait-until-stable lxon-rpcs \
  --region=$REGION || true

# Step 11: Create load balancer
echo "Step 11: Creating load balancer..."
gcloud compute health-checks create http lxon-rpc-health \
  --port=8545 \
  --request-path=/health || echo "Health check may already exist"

gcloud compute backend-services create lxon-rpc-backend \
  --health-checks=lxon-rpc-health \
  --global || echo "Backend service may already exist"

gcloud compute backend-services add-backend lxon-rpc-backend \
  --instance-group=lxon-rpcs \
  --instance-group-region=$REGION \
  --global || echo "Backend may already exist"

gcloud compute url-maps create lxon-rpc-lb \
  --default-service=lxon-rpc-backend || echo "URL map may already exist"

gcloud compute forwarding-rules create lxon-rpc-forwarding \
  --global \
  --ports=80 \
  --url-map=lxon-rpc-lb || echo "Forwarding rule may already exist"

# Step 12: Get load balancer IP
echo "Step 12: Getting load balancer IP..."
LB_IP=$(gcloud compute forwarding-rules describe lxon-rpc-forwarding \
  --global \
  --format="value(IPAddress)" 2>/dev/null || echo "pending")

echo ""
echo "=== Deployment Complete ==="
echo "Load Balancer IP: $LB_IP"
echo ""
echo "Next steps:"
echo "1. Update hardhat.config.ts with the load balancer IP"
echo "2. Deploy smart contracts: npx hardhat run scripts/deploy-minimal.ts --network lxonMainnet"
echo "3. Add liquidity: npx hardhat run scripts/add-liquidity.ts --network lxonMainnet"
echo "4. Test RPC access: curl http://$LB_IP/health"
echo ""
echo "Instance groups:"
echo "- Validators: gcloud compute instance-groups managed list lxon-validators --region=$REGION"
echo "- RPCs: gcloud compute instance-groups managed list lxon-rpcs --region=$REGION"
echo ""
echo "Monitor instances:"
echo "- gcloud compute instances list --project=$PROJECT_ID"