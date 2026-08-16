# LXON Blockchain Node — AWS Free Tier Deployment

Cost-optimized deployment using EC2 t2.micro (staying within AWS Free Tier limits) instead of ECS Fargate + NAT Gateways + ALB.

## ⚠️ Free Tier vs Full Deployment

| Component | Full Deployment | Free Tier Version |
|-----------|-----------------|-------------------|
| Compute | ECS Fargate (4 vCPU, 8GB) | EC2 t2.micro (1 vCPU, 1GB) |
| Networking | Multi-AZ + NAT Gateway (~$65/mo) | Single public subnet, no NAT |
| Load Balancer | ALB (~$25/mo) | None (direct EIP) |
| Storage | EFS 500GB (~$40/mo) | EBS 30GB (Free Tier) |
| **Est. Cost** | **~$285/month** | **~$0/month*** |

*Free for 12 months from AWS account creation, within listed limits. After that or if exceeded, standard rates apply.

## What's Free Tier Eligible Here

- **EC2**: 750 hours/month of t2.micro or t3.micro (enough for 1 instance running 24/7)
- **EBS**: 30 GB/month of General Purpose (SSD) storage — split between root (15GB) + data (15GB)
- **Elastic IP**: Free while attached to a running instance
- **Data Transfer**: 100 GB/month outbound free
- **CloudWatch**: 10 alarms, basic monitoring, free
- **SNS**: 1,000 email notifications/month free
- **ECR**: 500 MB/month storage free

## ⚠️ Important Limitations

Running a full blockchain node on t2.micro (1 vCPU, 1GB RAM) is **significantly constrained**:
- Suitable for **testing/development only** — not production validator use
- Limited peer connections and transaction throughput
- Blockchain data will fill 15GB quickly depending on chain activity — monitor closely
- No auto-recovery/load balancing like the ECS version
- Single point of failure (no Multi-AZ)

For production validator nodes, use the full ECS deployment (`aws/blockchain-node/`) instead.

## Quick Start

```bash
# 1. Set required variables
export AWS_REGION=us-east-1
export VALIDATOR_ADDRESS=0x...
export VALIDATOR_KEY=0x...
export KEY_PAIR_NAME=lxon-freetier-key
export ALERT_EMAIL=you@example.com
export GENESIS_TIME=$(date +%s)

# 2. Deploy
bash aws/blockchain-node-freetier/scripts/deploy.sh

# 3. Set a billing safety net (recommended!)
bash aws/blockchain-node-freetier/scripts/setup-budget-alert.sh 5

# 4. Check usage anytime
bash aws/blockchain-node-freetier/scripts/check-usage.sh
```

## Deploying the Node Software

The EC2 instance boots with Docker installed via user-data, but you need to push your image and start it:

```bash
# Build your image locally
docker build -f docker/lxon-node.Dockerfile -t lxon-node:latest .

# Get ECR URL
ECR_URL=$(cd aws/blockchain-node-freetier/terraform && terraform output -raw ecr_repository_url)

# Push
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $ECR_URL
docker tag lxon-node:latest $ECR_URL:latest
docker push $ECR_URL:latest

# SSH in and pull/run
ssh -i lxon-freetier-key.pem ubuntu@<node-ip>
sudo docker pull $ECR_URL:latest
sudo docker run -d --name lxon-node \
  -p 8545:8545 -p 8546:8546 -p 30303:30303 \
  -v /app/data:/app/data \
  --restart always \
  $ECR_URL:latest
```

## Staying Within Free Tier — Checklist

- [ ] Only **one** EC2 instance running at a time (750 hrs/month = ~1 instance 24/7)
- [ ] Instance type is `t2.micro` or `t3.micro` only
- [ ] EBS volumes total ≤ 30 GB
- [ ] No NAT Gateway created (they are NOT free — ~$0.045/hr + data)
- [ ] No Application Load Balancer (~$16-25/month, not free)
- [ ] No Multi-AZ RDS (this deployment has no RDS at all)
- [ ] Budget alert configured (`setup-budget-alert.sh`)
- [ ] Check AWS Free Tier dashboard weekly: https://console.aws.amazon.com/billing/home#/freetier

## Monitoring Costs

```bash
# Check current usage
bash aws/blockchain-node-freetier/scripts/check-usage.sh

# AWS Console
open https://console.aws.amazon.com/billing/home#/freetier
open https://console.aws.amazon.com/cost-management/home
```

## Cleanup (Important!)

Free Tier only covers 750 hrs/month for **one** instance. If you forget to destroy old test deployments, you risk running multiple instances and exceeding the limit.

```bash
bash aws/blockchain-node-freetier/scripts/cleanup.sh
```

## Upgrading Later

When ready for production (mainnet validator, real traffic), migrate to the full deployment:
- `aws/blockchain-node/` — ECS Fargate, Multi-AZ, EFS, auto-scaling, ~$285/month

## Troubleshooting

### Instance not responding
```bash
# Check instance status
aws ec2 describe-instance-status --instance-ids <id>

# Check user-data logs via SSH
ssh -i lxon-freetier-key.pem ubuntu@<ip> "cat /var/log/user-data.log"
ssh -i lxon-freetier-key.pem ubuntu@<ip> "cat /var/log/cloud-init-output.log"
```

### Out of memory (common on t2.micro with 1GB RAM)
```bash
# Check memory usage
ssh -i lxon-freetier-key.pem ubuntu@<ip> "free -h"

# Add swap (helps but doesn't fully solve blockchain node memory needs)
ssh -i lxon-freetier-key.pem ubuntu@<ip> "sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile"
```

### Storage filling up
```bash
ssh -i lxon-freetier-key.pem ubuntu@<ip> "df -h /app/data"
# If full, you'll need to either prune old data or increase volume size (extra cost beyond 30GB Free Tier)
```

## Resources

- [AWS Free Tier Details](https://aws.amazon.com/free/)
- [AWS Free Tier Usage Dashboard](https://console.aws.amazon.com/billing/home#/freetier)
- [AWS Budgets](https://console.aws.amazon.com/billing/home#/budgets)
