# Tutorial: Deploying LXON Blockchain Node on AWS Free Tier

This tutorial walks you through deploying a LXON blockchain node on AWS using Free Tier–eligible resources (EC2 t2.micro, EBS, Elastic IP). Total time: ~30-40 minutes. Estimated cost: **$0/month** if you stay within limits (see Step 9).

> **Note**: This setup is for testing/development. A t2.micro (1 vCPU, 1GB RAM) is not sufficient for a production validator node. For production, see the full ECS deployment in `aws/blockchain-node/`.

---

## Prerequisites

Before starting, make sure you have:

- An AWS account (Free Tier is valid for 12 months from account creation)
- AWS CLI, Terraform, and Docker installed locally
- Your LXON project at `/Users/adikamble/LXON/LXON`

### Install required tools

```bash
# macOS
brew install awscli terraform docker

# Verify installations
aws --version
terraform --version
docker --version
```

### Configure AWS credentials

```bash
aws configure
```

Enter your Access Key ID, Secret Access Key, default region (`us-east-1` recommended for Free Tier), and output format (`json`).

---

## Step 1: Understand What Gets Deployed

This tutorial uses the pre-built Free Tier configuration at `aws/blockchain-node-freetier/`, which deploys:

| Resource | Free Tier Limit | What We Use |
|----------|------------------|-------------|
| EC2 instance | 750 hrs/month (t2.micro/t3.micro) | 1x t2.micro, 24/7 |
| EBS storage | 30 GB/month | 15GB root + 15GB data = 30GB |
| Elastic IP | Free while attached to running instance | 1x EIP |
| Data transfer | 100 GB/month outbound | Usage-dependent |
| CloudWatch alarms | 10/month free | 2 alarms (CPU, status check) |
| SNS email alerts | 1,000/month free | Failure notifications |
| ECR storage | 500 MB/month free | Docker image storage |

**No NAT Gateway and no Load Balancer are used** — those are the two components that silently cost money even under "Free Tier" setups.

---

## Step 2: Generate Your Validator Credentials

The LXON node needs a validator address and private key. Generate a test keypair:

```bash
cd /Users/adikamble/LXON/LXON
node -e "
const { ethers } = require('ethers');
const wallet = ethers.Wallet.createRandom();
console.log('Address:', wallet.address);
console.log('Private Key:', wallet.privateKey);
"
```

Save the output — you'll need both values shortly. **Never commit these to git or share the private key.**

---

## Step 3: Create an EC2 Key Pair Name

Pick a name for your SSH key pair (the deploy script will create it automatically if it doesn't exist):

```bash
export KEY_PAIR_NAME=lxon-freetier-key
```

---

## Step 4: Set Environment Variables

```bash
export AWS_REGION=us-east-1
export VALIDATOR_ADDRESS=0xYourAddressFromStep2
export VALIDATOR_KEY=0xYourPrivateKeyFromStep2
export KEY_PAIR_NAME=lxon-freetier-key
export ALERT_EMAIL=you@example.com
export GENESIS_TIME=$(date +%s)
```

Double-check nothing is empty:

```bash
echo "Address: $VALIDATOR_ADDRESS"
echo "Key pair: $KEY_PAIR_NAME"
echo "Email: $ALERT_EMAIL"
echo "Genesis: $GENESIS_TIME"
```

---

## Step 5: Build the LXON Node Docker Image

```bash
cd /Users/adikamble/LXON/LXON
docker build -f docker/lxon-node.Dockerfile -t lxon-node:latest .
```

This produces a multi-stage, Alpine-based image running as a non-root user, exposing ports 8545 (RPC) and 8546 (WebSocket).

Verify the image built successfully:

```bash
docker images | grep lxon-node
```

---

## Step 6: Deploy AWS Infrastructure

Run the automated deployment script:

```bash
bash aws/blockchain-node-freetier/scripts/deploy.sh
```

This script will:
1. Verify AWS credentials
2. Create/verify your EC2 key pair (saves `lxon-freetier-key.pem` locally)
3. Set up a Terraform S3 backend + DynamoDB lock table
4. Run `terraform plan` and show you the resources to be created
5. Prompt you to confirm before applying
6. Provision: VPC, public subnet, security group, EC2 instance, EBS volumes, Elastic IP, ECR repo, CloudWatch alarms, SNS topic

When prompted to review the plan, confirm you see (approximately):
- 1x `aws_instance` (t2.micro)
- 2x `aws_ebs_volume` (15GB each)
- 1x `aws_eip`
- 1x `aws_vpc`, 1x subnet, 1x internet gateway
- 1x `aws_ecr_repository`
- 2x `aws_cloudwatch_metric_alarm`

Press Enter to apply.

**Confirm the SNS email subscription** — check your inbox for an AWS SNS confirmation email and click the confirmation link, or you won't receive alerts.

---

## Step 7: Push Your Docker Image to ECR

After deployment completes, get your ECR repository URL from the Terraform output (printed at the end of the script), or fetch it manually:

```bash
cd aws/blockchain-node-freetier/terraform
ECR_URL=$(terraform output -raw ecr_repository_url)
cd /Users/adikamble/LXON/LXON
echo "ECR URL: $ECR_URL"
```

Log in, tag, and push:

```bash
aws ecr get-login-password --region $AWS_REGION | \
  docker login --username AWS --password-stdin $ECR_URL

docker tag lxon-node:latest $ECR_URL:latest
docker push $ECR_URL:latest
```

---

## Step 8: Start the Node on the Instance

Get the instance's public IP (also printed by the deploy script):

```bash
cd aws/blockchain-node-freetier/terraform
NODE_IP=$(terraform output -raw node_public_ip)
cd /Users/adikamble/LXON/LXON
echo "Node IP: $NODE_IP"
```

Wait 2-3 minutes after deployment for the instance's boot script (installing Docker, mounting the data volume) to finish, then SSH in:

```bash
ssh -i lxon-freetier-key.pem ubuntu@$NODE_IP
```

Once connected, pull and run your image:

```bash
# On the EC2 instance
aws ecr get-login-password --region us-east-1 | \
  sudo docker login --username AWS --password-stdin <ECR_URL>

sudo docker pull <ECR_URL>:latest

sudo docker run -d \
  --name lxon-node \
  -p 8545:8545 -p 8546:8546 -p 30303:30303 \
  -v /app/data:/app/data \
  -e VALIDATOR_ADDRESS=$VALIDATOR_ADDRESS \
  -e VALIDATOR_KEY=$VALIDATOR_KEY \
  --restart always \
  <ECR_URL>:latest
```

Exit the SSH session:

```bash
exit
```

---

## Step 9: Verify the Node Is Running

From your local machine, test the RPC endpoint:

```bash
curl -X POST http://$NODE_IP:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
```

You should get a JSON response with a `result` field. If it hangs or fails:

```bash
# Check the container logs
ssh -i lxon-freetier-key.pem ubuntu@$NODE_IP "sudo docker logs lxon-node"

# Check container status
ssh -i lxon-freetier-key.pem ubuntu@$NODE_IP "sudo docker ps -a"
```

---

## Step 10: Set a Budget Alert (Strongly Recommended)

Protect yourself from unexpected charges:

```bash
bash aws/blockchain-node-freetier/scripts/setup-budget-alert.sh 5
```

This creates an AWS Budget that emails you at 80% and 100% of a $5/month threshold.

---

## Step 11: Monitor Free Tier Usage

Check your resource usage anytime:

```bash
bash aws/blockchain-node-freetier/scripts/check-usage.sh
```

Also check the AWS dashboards directly:
- Free Tier usage: https://console.aws.amazon.com/billing/home#/freetier
- Current bill: https://console.aws.amazon.com/billing/home#/bills

---

## Staying Within Free Tier — Checklist

- [ ] Only **one** EC2 instance running (750 hrs/month ≈ one instance 24/7)
- [ ] Instance type is `t2.micro` or `t3.micro` only
- [ ] Total EBS storage ≤ 30 GB
- [ ] No NAT Gateway was created (this config doesn't create one — verify in VPC console)
- [ ] No Load Balancer was created (this config doesn't create one — verify in EC2 > Load Balancers)
- [ ] Budget alert is active (Step 10)
- [ ] You're within the 12-month Free Tier window of your AWS account

---

## Troubleshooting

### Instance unreachable / SSH times out
```bash
# Check instance state
aws ec2 describe-instances --filters "Name=tag:Name,Values=lxon-node-node" \
  --query 'Reservations[0].Instances[0].State.Name' --output text --region us-east-1

# Check security group allows your IP on port 22
aws ec2 describe-security-groups --filters "Name=tag:Name,Values=lxon-node-sg" --region us-east-1
```

### Container won't start / crashes
```bash
ssh -i lxon-freetier-key.pem ubuntu@$NODE_IP "sudo docker logs lxon-node --tail 100"
```

### Out of memory (common on 1GB RAM)
```bash
ssh -i lxon-freetier-key.pem ubuntu@$NODE_IP "free -h"

# Add a 2GB swapfile to help
ssh -i lxon-freetier-key.pem ubuntu@$NODE_IP \
  "sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile"
```

### Data volume filling up
```bash
ssh -i lxon-freetier-key.pem ubuntu@$NODE_IP "df -h /app/data"
```
If it's near full, prune old data or plan to migrate to the full production deployment (`aws/blockchain-node/`) with larger storage.

---

## Cleaning Up

When you're done testing, destroy everything to avoid any lingering charges:

```bash
bash aws/blockchain-node-freetier/scripts/cleanup.sh
```

Type `yes` to confirm. This removes the EC2 instance, EBS volumes, VPC, security groups, and Terraform state backend.

Verify in the AWS Console afterward: EC2 → Instances, EBS → Volumes, VPC → Your VPCs should all be clear of `lxon-node` resources.

---

## Next Steps

- **Production deployment**: Once ready for real validator traffic, migrate to `aws/blockchain-node/` (ECS Fargate, Multi-AZ, persistent EFS storage, auto-scaling) — see its `DEPLOYMENT.md`.
- **CI/CD**: Automate image builds and pushes to ECR on every commit.
- **Monitoring**: Add more CloudWatch alarms as your usage grows (mind the 10/month free limit).

---

## Reference: Environment Variables Used

| Variable | Description | Example |
|----------|-------------|---------|
| `AWS_REGION` | AWS region to deploy in | `us-east-1` |
| `VALIDATOR_ADDRESS` | Blockchain validator address | `0x1234...` |
| `VALIDATOR_KEY` | Validator private key (keep secret!) | `0xabcd...` |
| `KEY_PAIR_NAME` | EC2 SSH key pair name | `lxon-freetier-key` |
| `ALERT_EMAIL` | Email for CloudWatch/SNS/Budget alerts | `you@example.com` |
| `GENESIS_TIME` | Unix timestamp for genesis block | `$(date +%s)` |
