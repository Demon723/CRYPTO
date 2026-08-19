# LXON Blockchain Node - AWS ECS Deployment

Deploy a production-grade LXON blockchain validator node on AWS ECS Fargate with persistent storage, auto-recovery, and full monitoring.

## Quick Start (5 Minutes)

```bash
# 1. Set environment variables
export AWS_REGION=us-east-1
export VALIDATOR_ADDRESS=0x...        # Your validator address
export VALIDATOR_KEY=0x...            # Your validator private key
export GENESIS_TIME=$(date +%s)       # Current Unix timestamp
export ALERT_EMAIL=ops@example.com    # For CloudWatch alarms

# 2. Build and deploy
bash aws/blockchain-node/scripts/build.sh
bash aws/blockchain-node/scripts/deploy.sh

# 3. Monitor
bash aws/blockchain-node/scripts/monitor.sh
```

After deployment (5-10 minutes):
- **RPC Endpoint**: `http://<public-ip>:8545`
- **WebSocket**: `ws://<public-ip>:8546`

## What Gets Deployed

### Compute
- **ECS Fargate Task**: 4 vCPU, 8 GB RAM
- **Auto-recovery**: Failed tasks restart automatically
- **Logging**: All logs streamed to CloudWatch

### Storage
- **Persistent Volume**: 500 GB EBS gp3 volume
- **Data Location**: `/app/data` inside container
- **Encryption**: AES-256 at rest

### Networking
- **VPC**: Dedicated VPC with 2 availability zones
- **Security Groups**: Controlled ingress/egress
- **RPC Ports**: 8545 (HTTP), 8546 (WebSocket), 30303 (P2P)

### Monitoring
- **CloudWatch Logs**: 30-day retention
- **CloudWatch Alarms**: CPU, Memory, Task health
- **SNS Notifications**: Email alerts on failures

## Prerequisites

### AWS Account
- Active AWS account with IAM permissions
- EC2, ECS, VPC, CloudWatch, ECS, S3, DynamoDB, SNS access

### Local Tools
```bash
# macOS
brew install aws-cli terraform docker

# Linux
sudo apt-get install aws-cli terraform docker.io

# Windows
choco install awscli terraform docker
```

### AWS Credentials
```bash
aws configure
# Enter:
#   AWS Access Key ID: [your-key]
#   AWS Secret Access Key: [your-secret]
#   Default region: us-east-1
#   Default output: json
```

## Configuration

### Environment Variables

Create `.env.blockchain-node`:

```bash
#!/bin/bash
export AWS_REGION=us-east-1
export AWS_PROFILE=default
export ENVIRONMENT=prod

# Validator Configuration
export VALIDATOR_ADDRESS=0x... # Ethereum-style address
export VALIDATOR_KEY=0x...     # Private key (64 hex chars)
export CHAIN_ID=1
export NETWORK_ID=1

# Blockchain Parameters
export GENESIS_TIME=$(date +%s)
export MAX_PEERS=50

# Compute
export TASK_CPU=4096    # 4 vCPU
export TASK_MEMORY=8192 # 8 GB

# Storage
export VOLUME_SIZE=500  # GB

# RPC
export RPC_PORT=8545
export RPC_WS_PORT=8546

# Alerts
export ALERT_EMAIL=ops@example.com
```

Load before deployment:
```bash
source .env.blockchain-node
bash aws/blockchain-node/scripts/deploy.sh
```

### Terraform Variables

Edit `aws/blockchain-node/terraform/environments/prod.tfvars`:

```hcl
aws_region         = "us-east-1"
environment        = "prod"
chain_id            = 1
max_peers           = 50
task_cpu            = 4096
task_memory         = 8192
```

## Step-by-Step Deployment

### Step 1: Build Docker Image

```bash
bash aws/blockchain-node/scripts/build.sh
```

This creates:
- `lxon-node:latest`
- `lxon-node:[timestamp]`

### Step 2: Deploy to AWS

```bash
export AWS_REGION=us-east-1
export VALIDATOR_ADDRESS=0x...
export VALIDATOR_KEY=0x...
export GENESIS_TIME=$(date +%s)
export ALERT_EMAIL=ops@example.com

bash aws/blockchain-node/scripts/deploy.sh
```

Deployment steps:
1. ✓ Verifies AWS credentials
2. ✓ Creates S3 bucket for Terraform state
3. ✓ Creates DynamoDB table for state locking
4. ✓ Builds Docker image
5. ✓ Pushes image to ECR
6. ✓ Plans Terraform deployment
7. ✓ Applies infrastructure
8. ✓ Starts ECS task
9. ✓ Outputs RPC endpoint

### Step 3: Verify Deployment

```bash
# Check service status
aws ecs describe-services \
  --cluster lxon-node-prod \
  --services lxon-node-node \
  --region us-east-1

# Get public IP
aws ecs describe-tasks \
  --cluster lxon-node-prod \
  --tasks $(aws ecs list-tasks --cluster lxon-node-prod --region us-east-1 --query 'taskArns[0]' --output text) \
  --region us-east-1 \
  --query 'tasks[0].attachments[?name==`ElasticNetworkInterface`].details[?name==`networkInterfaceId`].value' \
  --output text

# Test RPC endpoint
curl -X POST http://<public-ip>:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
```

## RPC Usage

### HTTP Endpoint

```bash
# Get chain ID
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'

# Get account balance
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_getBalance","params":["0x...","latest"],"id":1}'

# Send transaction
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_sendRawTransaction","params":["0x..."],"id":1}'
```

### WebSocket Endpoint

```bash
# Connect with wscat
npm install -g wscat
wscat -c ws://localhost:8546

# Subscribe to new blocks
{"jsonrpc":"2.0","method":"eth_subscribe","params":["newHeads"],"id":1}

# Subscribe to logs
{"jsonrpc":"2.0","method":"eth_subscribe","params":["logs",{"address":"0x..."}],"id":1}
```

## Monitoring

### View Logs

```bash
# Real-time logs
aws logs tail /ecs/lxon-node-prod --follow

# Last 100 lines
aws logs tail /ecs/lxon-node-prod --max-items 100

# With timestamps
aws logs tail /ecs/lxon-node-prod --follow --log-stream-name-prefix lxon-node
```

### CloudWatch Alarms

```bash
# List all alarms
aws cloudwatch describe-alarms --alarm-name-prefix lxon-node

# Get alarm details
aws cloudwatch describe-alarms \
  --alarm-names lxon-node-node-cpu-high \
  --query 'MetricAlarms[0]'
```

### Health Check

```bash
# Check node health (if implemented)
curl http://localhost:8545/health

# Check peer count
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"net_peerCount","params":[],"id":1}'
```

## Scaling & Configuration

### Increase Compute

```bash
# Update to 8 vCPU, 16 GB
cd aws/blockchain-node/terraform
terraform apply -var task_cpu=8192 -var task_memory=16384
```

### Increase Storage

```bash
# Update volume to 1 TB
terraform apply -var blockchain_data_volume_size=1000
```

### Restrict RPC Access

Edit security group in Terraform:

```hcl
rpc_ingress_cidr = ["10.0.0.0/8"]  # Private network only
```

Then:
```bash
terraform apply
```

## Cost Estimation (Monthly)

| Component | Cost |
|-----------|------|
| ECS Fargate (4 vCPU) | ~$150 |
| ECS Fargate (8 GB) | ~$80 |
| EBS gp3 (500 GB) | ~$40 |
| Data Transfer | ~$10 |
| CloudWatch (logs + alarms) | ~$5 |
| **Total** | **~$285/month** |

*Prices vary by region. US East 1 pricing shown.*

## Troubleshooting

### Task not starting

```bash
# Check task definition
aws ecs describe-task-definition \
  --task-definition lxon-node-node \
  --region us-east-1

# View task logs
aws logs tail /ecs/lxon-node-prod --follow

# Check service events
aws ecs describe-services \
  --cluster lxon-node-prod \
  --services lxon-node-node \
  --region us-east-1 \
  --query 'services[0].events[:5]'
```

### RPC not responding

```bash
# Check security group allows port 8545
aws ec2 describe-security-groups \
  --filters "Name=tag:Name,Values=lxon-node-ecs-sg" \
  --query 'SecurityGroups[0].IpPermissions'

# Test connectivity
curl -v http://<public-ip>:8545/

# Check container logs
aws logs tail /ecs/lxon-node-prod --follow
```

### High CPU/Memory usage

```bash
# View metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/ECS \
  --metric-name CPUUtilization \
  --dimensions Name=ServiceName,Value=lxon-node-node \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Maximum

# Scale up
aws ecs update-service \
  --cluster lxon-node-prod \
  --service lxon-node-node \
  --task-definition lxon-node-node:1 \
  --region us-east-1
```

### Storage full

```bash
# Check volume usage
aws ec2 describe-volumes \
  --filters Name=tag:Name,Values=lxon-node-data-1 \
  --query 'Volumes[0].[Size,Iops,Throughput]'

# Increase volume size
terraform apply -var blockchain_data_volume_size=1000
```

## Security Best Practices

### Validator Key Management

🚨 **Never commit private keys to version control**

Options:
1. **AWS Secrets Manager**:
   ```bash
   aws secretsmanager create-secret \
     --name lxon/validator-key \
     --secret-string '{"address":"0x...","key":"0x..."}'
   ```

2. **Environment variables** (local deployment only):
   ```bash
   export VALIDATOR_KEY=0x...
   ```

3. **AWS Parameter Store**:
   ```bash
   aws ssm put-parameter \
     --name /lxon/validator-key \
     --value 0x... \
     --type SecureString
   ```

### Network Isolation

Restrict RPC to known IPs:

```hcl
# terraform/environments/prod.tfvars
rpc_ingress_cidr = [
  "203.0.113.0/24",   # Your office
  "198.51.100.0/24"   # Your VPN
]
```

### Monitoring & Alerts

Enable email notifications:

```bash
export ALERT_EMAIL=security@example.com
terraform apply
```

## Upgrading LXON

### 1. Build new image

```bash
# Update code
git pull origin main

# Build image
bash aws/blockchain-node/scripts/build.sh

# Tag with version
docker tag lxon-node:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/lxon-node:v1.2.0
```

### 2. Push to ECR

```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin ...
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/lxon-node:v1.2.0
```

### 3. Update ECS service

```bash
aws ecs update-service \
  --cluster lxon-node-prod \
  --service lxon-node-node \
  --force-new-deployment \
  --region us-east-1
```

Monitor deployment:
```bash
bash aws/blockchain-node/scripts/monitor.sh
```

## Cleanup

```bash
# Destroy all AWS resources
bash aws/blockchain-node/scripts/cleanup.sh

# Confirm deletion (type 'yes')
```

⚠️ **Warning**: This deletes:
- ECS cluster and tasks
- VPC and subnets
- EBS volumes
- RDS databases
- All associated resources

Data is retained for 7 days via EBS snapshots.

## Support & Resources

- [AWS ECS Documentation](https://docs.aws.amazon.com/ecs/)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [LXON Blockchain Docs](../../README.md)
- [Ethereum JSON-RPC Spec](https://ethereum.org/en/developers/docs/apis/json-rpc/)

## License

MIT - See LICENSE file
