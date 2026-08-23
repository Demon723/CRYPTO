# AWS Terminal Deployment Guide for LXON

This guide provides step-by-step instructions for deploying LXON to AWS using terminal commands only (no AWS Console).

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [AWS CLI Setup](#aws-cli-setup)
3. [EC2 Instance Creation](#ec2-instance-creation)
4. [Security Group Configuration](#security-group-configuration)
5. [Instance Deployment](#instance-deployment)
6. [Automated Git Pull Deployment](#automated-git-pull-deployment)
7. [Mainnet Deployment](#mainnet-deployment)

---

## Prerequisites

### Required Tools

- **AWS CLI** - Command-line interface for AWS
- **AWS Account** - With billing enabled
- **SSH Key Pair** - For EC2 instance access
- **GitHub Account** - With repository access

### Install AWS CLI

```bash
# macOS
brew install awscli

# Linux
sudo apt update
sudo apt install awscli

# Verify installation
aws --version
```

---

## AWS CLI Setup

### 1. Configure AWS CLI

```bash
# Configure AWS credentials
aws configure

# You will be prompted for:
# AWS Access Key ID: your_access_key
# AWS Secret Access Key: your_secret_key
# Default region name: us-east-1 (or your preferred region)
# Default output format: json
```

### 2. Verify Configuration

```bash
# List your IAM user
aws iam get-user

# List available regions
aws ec2 describe-regions --query "Regions[].{Name:RegionName}" --output table
```

### 3. Create SSH Key Pair

```bash
# Create key pair for EC2 access
aws ec2 create-key-pair \
  --key-name lxon-deployer \
  --key-type rsa \
  --query "KeyMaterial" \
  --output text > lxon-deployer.pem

# Set correct permissions
chmod 400 lxon-deployer.pem

# Verify key pair
aws ec2 describe-key-pairs --key-name lxon-deployer
```

---

## EC2 Instance Creation

### 1. Create Security Group

```bash
# Create security group for HTTP/HTTPS/SSH
aws ec2 create-security-group \
  --group-name lxon-sg \
  --description "Security group for LXON deployment"

# Get security group ID
SG_ID=$(aws ec2 describe-security-groups \
  --group-names lxon-sg \
  --query "SecurityGroups[0].GroupId" \
  --output text)

echo "Security Group ID: $SG_ID"
```

### 2. Configure Security Group Rules

```bash
# Allow SSH (port 22)
aws ec2 authorize-security-group-ingress \
  --group-id $SG_ID \
  --protocol tcp \
  --port 22 \
  --cidr 0.0.0.0/0

# Allow HTTP (port 80)
aws ec2 authorize-security-group-ingress \
  --group-id $SG_ID \
  --protocol tcp \
  --port 80 \
  --cidr 0.0.0.0/0

# Allow HTTPS (port 443)
aws ec2 authorize-security-group-ingress \
  --group-id $SG_ID \
  --protocol tcp \
  --port 443 \
  --cidr 0.0.0.0/0

# Allow custom port for Hardhat (8545)
aws ec2 authorize-security-group-ingress \
  --group-id $SG_ID \
  --protocol tcp \
  --port 8545 \
  --cidr 0.0.0.0/0

# Allow custom port for trading interface (8080)
aws ec2 authorize-security-group-ingress \
  --group-id $SG_ID \
  --protocol tcp \
  --port 8080 \
  --cidr 0.0.0.0/0
```

### 3. Launch EC2 Instance

```bash
# Get latest Ubuntu AMI ID
AMI_ID=$(aws ec2 describe-images \
  --owners 099720109477 \
  --filters "Name=name,Values=ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*" \
  --query "sort_by(Images, &CreationDate)[-1].ImageId" \
  --output text)

echo "Ubuntu AMI ID: $AMI_ID"

# Create EC2 instance
INSTANCE_ID=$(aws ec2 run-instances \
  --image-id $AMI_ID \
  --count 1 \
  --instance-type t3.medium \
  --key-name lxon-deployer \
  --security-group-ids $SG_ID \
  --block-device-mappings "[{\"DeviceName\":\"/dev/sda1\",\"Ebs\":{\"VolumeSize\":50,\"VolumeType\":\"gp2\"}}]" \
  --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=lxon-node}]" \
  --query "Instances[0].InstanceId" \
  --output text)

echo "Instance ID: $INSTANCE_ID"
```

### 4. Wait for Instance to be Ready

```bash
# Wait for instance to be running
aws ec2 wait instance-running --instance-ids $INSTANCE_ID

# Get instance public IP
PUBLIC_IP=$(aws ec2 describe-instances \
  --instance-ids $INSTANCE_ID \
  --query "Reservations[0].Instances[0].PublicIpAddress" \
  --output text)

echo "Instance Public IP: $PUBLIC_IP"
```

### 5. Allocate Elastic IP (Optional)

```bash
# Allocate elastic IP
ALLOCATION_ID=$(aws ec2 allocate-address --query "AllocationId" --output text)

echo "Elastic IP Allocation ID: $ALLOCATION_ID"

# Associate elastic IP with instance
aws ec2 associate-address \
  --instance-id $INSTANCE_ID \
  --allocation-id $ALLOCATION_ID

# Get elastic IP
ELASTIC_IP=$(aws ec2 describe-addresses \
  --allocation-ids $ALLOCATION_ID \
  --query "Addresses[0].PublicIp" \
  --output text)

echo "Elastic IP: $ELASTIC_IP"
```

---

## Instance Deployment

### 1. SSH into EC2 Instance

```bash
# SSH into the instance
ssh -i lxon-deployer.pem ubuntu@$PUBLIC_IP

# Or use elastic IP if allocated
ssh -i lxon-deployer.pem ubuntu@$ELASTIC_IP
```

### 2. Update System and Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install Python and build tools
sudo apt install -y python3 python3-pip build-essential git

# Install PM2 for process management
sudo npm install -g pm2

# Install Hardhat
sudo npm install -g hardhat

# Install Nginx for reverse proxy
sudo apt install -y nginx certbot python3-certbot-nginx
```

### 3. Configure Git

```bash
# Configure git user
git config --global user.name "LXON Deployer"
git config --global user.email "deployer@lxon.network"

# Generate SSH key for GitHub
ssh-keygen -t ed25519 -C "lxon-deployer@lxon.network"

# Display public key (add to GitHub)
cat ~/.ssh/id_ed25519.pub

# Test GitHub connection
ssh -T git@github.com
```

### 4. Clone Repository

```bash
# Create deployment directory
mkdir -p /var/www/lxon
cd /var/www/lxon

# Clone repository
git clone git@github.com:Demon723/CRYPTO.git .
```

### 5. Install Project Dependencies

```bash
# Navigate to contracts directory
cd /var/www/lxon/apps/contracts

# Install dependencies
npm install

# Compile contracts
npx hardhat compile
```

### 6. Setup Deployment Script

```bash
# Make deployment script executable
cd /var/www/lxon
chmod +x deploy.sh
```

### 7. Run Initial Deployment

```bash
# Run deployment script
./deploy.sh
```

### 8. Setup PM2

```bash
cd /var/www/lxon/apps/contracts
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 9. Configure Nginx

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/lxon
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name YOUR_DOMAIN_OR_IP;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /rpc {
        proxy_pass http://localhost:8545;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/lxon /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 10. Setup SSL (Optional)

```bash
# Obtain SSL certificate
sudo certbot --nginx -d YOUR_DOMAIN

# Auto-renewal is configured automatically
sudo certbot renew --dry-run
```

---

## Automated Git Pull Deployment

### Option 1: Cron Job (Simplest)

```bash
# Add cron job for periodic deployment
crontab -e

# Add this line (runs every 5 minutes):
*/5 * * * * cd /var/www/lxon && git pull origin main && ./deploy.sh >> /var/log/lxon-deploy.log 2>&1
```

### Option 2: GitHub Webhook

```bash
# Install webhook handler
npm install -g webhook

# Create webhook configuration
cat > /var/www/lxon/webhook-config.json << EOF
[
  {
    "id": "lxon-deploy",
    "execute-command": "/var/www/lxon/deploy.sh",
    "command-working-directory": "/var/www/lxon",
    "response-message": "Deployment triggered",
    "trigger-rule": {
      "match": {
        "type": "payload-hash-sha1",
        "secret": "YOUR_WEBHOOK_SECRET",
        "parameter": {
          "source": "header",
          "name": "X-Hub-Signature"
        }
      }
    }
  }
]
EOF

# Start webhook service
pm2 start webhook -- --port 9000 --hooks /var/www/lxon/webhook-config.json
pm2 save
```

Then add webhook in GitHub:
- Go to Settings → Webhooks
- URL: `http://YOUR_EC2_IP:9000/hooks/lxon-deploy`
- Secret: `YOUR_WEBHOOK_SECRET`

---

## Mainnet Deployment

### 1. Configure Environment Variables

```bash
# Create .env file
cd /var/www/lxon/apps/contracts
nano .env
```

Add your configuration:

```bash
# Polygon Mainnet Configuration
POLYGON_RPC_URL=https://polygon-rpc.com
CHAIN_ID=137

# Wallet Configuration
PRIVATE_KEY=your_private_key_here
DEPLOYER_ADDRESS=your_deployer_address

# Contract Configuration
TOKEN_NAME=LXON
TOKEN_SYMBOL=LXON
INITIAL_SUPPLY=100000000000000000000000000

# Liquidity Configuration
INITIAL_LIQUIDITY_TOKEN=10000000000000000000000
INITIAL_LIQUIDITY_NATIVE=1000000000000000000

# Token Sale Configuration
SALE_DURATION=2592000
TOKEN_PRICE=100000000000000
SALE_CAP=1000000000000000000000000

# Security
MULTISIG_ADDRESS=your_multisig_address
EMERGENCY_ADDRESS=your_emergency_address
```

### 2. Deploy to Polygon Mainnet

```bash
# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

# Deploy to Polygon
npx hardhat run scripts/deploy-evm-compatible.ts --network polygon
```

### 3. Verify Deployment

```bash
# Check deployment output
cat deployments/137-evm-ecosystem.json

# Run monitoring script
npx hardhat run scripts/monitor-ecosystem.ts --network polygon
```

---

## AWS Management Commands

### Instance Management

```bash
# List instances
aws ec2 describe-instances --query "Reservations[].Instances[].[InstanceId,State.Name,PublicIpAddress]" --output table

# Start instance
aws ec2 start-instances --instance-ids $INSTANCE_ID

# Stop instance
aws ec2 stop-instances --instance-ids $INSTANCE_ID

# Terminate instance
aws ec2 terminate-instances --instance-ids $INSTANCE_ID

# Reboot instance
aws ec2 reboot-instances --instance-ids $INSTANCE_ID
```

### Security Group Management

```bash
# List security groups
aws ec2 describe-security-groups --query "SecurityGroups[].[GroupId,GroupName]" --output table

# Delete security group
aws ec2 delete-security-group --group-id $SG_ID
```

### Key Pair Management

```bash
# List key pairs
aws ec2 describe-key-pairs --query "KeyPairs[].[KeyName,KeyPairId]" --output table

# Delete key pair
aws ec2 delete-key-pair --key-name lxon-deployer
```

### Elastic IP Management

```bash
# List elastic IPs
aws ec2 describe-addresses --query "Addresses[].[PublicIp,AllocationId,InstanceId]" --output table

# Release elastic IP
aws ec2 release-address --allocation-id $ALLOCATION_ID
```

---

## Monitoring and Logs

### View Instance Logs

```bash
# SSH into instance
ssh -i lxon-deployer.pem ubuntu@$PUBLIC_IP

# View PM2 logs
pm2 logs

# View PM2 status
pm2 status

# Monitor PM2
pm2 monit
```

### View Nginx Logs

```bash
# Access log
sudo tail -f /var/log/nginx/access.log

# Error log
sudo tail -f /var/log/nginx/error.log
```

### View Deployment Logs

```bash
# Deployment log
tail -f /var/log/lxon-deploy.log
```

---

## Cost Optimization

### 1. Use Spot Instances

```bash
# Create spot instance request
SPOT_REQUEST_ID=$(aws ec2 request-spot-instances \
  --spot-price "0.02" \
  --instance-count 1 \
  --type one-time \
  --launch-specification "ImageId=$AMI_ID,InstanceType=t3.medium,KeyName=lxon-deployer,SecurityGroupIds=[$SG_ID]" \
  --query "SpotInstanceRequests[0].SpotInstanceRequestId" \
  --output text)

echo "Spot Request ID: $SPOT_REQUEST_ID"
```

### 2. Use Auto Scaling

```bash
# Create launch template
aws ec2 create-launch-template \
  --launch-template-name lxon-template \
  --launch-template-data "ImageId=$AMI_ID,InstanceType=t3.medium,KeyName=lxon-deployer,SecurityGroupIds=[$SG_ID]"

# Create auto scaling group
aws autoscaling create-auto-scaling-group \
  --auto-scaling-group-name lxon-asg \
  --launch-template "LaunchTemplateName=lxon-template" \
  --min-size 1 \
  --max-size 5 \
  --desired-capacity 1 \
  --vpc-zone-identifier "subnet-xxxxxx"
```

### 3. Use Reserved Instances

```bash
# Purchase reserved instance
aws ec2 purchase-reserved-instances-offering \
  --reserved-instances-offering-id offering-id \
  --instance-count 1
```

---

## Troubleshooting

### Instance Not Accessible

```bash
# Check instance state
aws ec2 describe-instance-status --instance-ids $INSTANCE_ID

# Check security group rules
aws ec2 describe-security-groups --group-ids $SG_ID

# Check key pair
aws ec2 describe-key-pairs --key-name lxon-deployer
```

### SSH Connection Failed

```bash
# Check SSH key permissions
chmod 400 lxon-deployer.pem

# Try verbose SSH
ssh -vvv -i lxon-deployer.pem ubuntu@$PUBLIC_IP
```

### Deployment Failed

```bash
# Check deployment logs
tail -f /var/log/lxon-deploy.log

# Check PM2 logs
pm2 logs

# Restart services
pm2 restart all
```

---

## Cleanup

### Delete All Resources

```bash
# Terminate instance
aws ec2 terminate-instances --instance-ids $INSTANCE_ID

# Wait for termination
aws ec2 wait instance-terminated --instance-ids $INSTANCE_ID

# Delete security group
aws ec2 delete-security-group --group-id $SG_ID

# Release elastic IP
aws ec2 release-address --allocation-id $ALLOCATION_ID

# Delete key pair
aws ec2 delete-key-pair --key-name lxon-deployer

# Delete local key file
rm lxon-deployer.pem
```

---

## Summary

Your LXON blockchain is now deployed on AWS using terminal commands only:

**✅ AWS Infrastructure:**
- EC2 Instance: `$INSTANCE_ID`
- Public IP: `$PUBLIC_IP`
- Security Group: `$SG_ID`
- SSH Key: `lxon-deployer.pem`

**✅ Deployment:**
- Repository cloned
- Dependencies installed
- Contracts compiled
- Services running with PM2
- Nginx configured

**✅ Automation:**
- Git pull deployment configured
- Automated updates via cron or webhook
- Monitoring and logging set up

**Next Steps:**
1. Configure environment variables for mainnet
2. Deploy to Polygon mainnet
3. Verify deployment
4. Set up monitoring and alerts

---

**Status:** Ready for AWS terminal deployment! 🚀
