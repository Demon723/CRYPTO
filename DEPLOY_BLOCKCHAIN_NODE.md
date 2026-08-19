# 🚀 LXON Blockchain Node - AWS ECS Deployment

**Complete production-ready setup for deploying LXON blockchain validator node to AWS**

---

## 📋 What's Been Created

Your LXON blockchain is now configured for AWS deployment with:

✅ **Complete Terraform Infrastructure**
- VPC with 2 availability zones
- ECS Fargate cluster (serverless containers)
- Persistent EFS storage (500 GB)
- Application security groups
- CloudWatch logging & monitoring
- SNS email alerts
- IAM roles with least-privilege

✅ **Production Docker Image**
- Multi-stage build (optimized size)
- Non-root user (security)
- Health checks
- Log streaming to CloudWatch
- Based on Alpine Linux

✅ **Automation Scripts**
- `deploy.sh` - One-command deployment
- `build.sh` - Local Docker build
- `monitor.sh` - Real-time monitoring
- `cleanup.sh` - Infrastructure teardown

✅ **Comprehensive Documentation**
- `README.md` - Quick overview
- `DEPLOYMENT.md` - Full step-by-step guide (10K+ words)
- `QUICKSTART.md` - 5-minute setup
- Configuration examples
- Troubleshooting guide

---

## 🎯 Deploy in 3 Commands

```bash
# 1. Set your configuration
export AWS_REGION=us-east-1
export VALIDATOR_ADDRESS=0x...      # Your validator address
export VALIDATOR_KEY=0x...          # Your private key
export GENESIS_TIME=$(date +%s)     # Current Unix timestamp
export ALERT_EMAIL=ops@example.com  # For alerts

# 2. Deploy (5-10 minutes)
cd /Users/adikamble/LXON/LXON
bash aws/blockchain-node/scripts/deploy.sh

# 3. Access your node
curl -X POST http://<public-ip>:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
```

---

## 📁 Directory Structure

```
aws/blockchain-node/
├── README.md                         # Quick start guide
├── DEPLOYMENT.md                     # Full documentation
├── QUICKSTART.md                     # 5-minute setup
├── scripts/
│   ├── deploy.sh       ⭐           # One-command deployment
│   ├── build.sh                      # Build Docker image
│   ├── monitor.sh                    # Monitor health
│   └── cleanup.sh                    # Destroy infrastructure
└── terraform/
    ├── main.tf                       # Main config
    ├── variables.tf                  # Input variables
    ├── environments/
    │   └── prod.tfvars              # Production settings
    └── modules/
        ├── vpc/                      # Networking
        ├── ecr/                      # Container registry
        ├── security_groups/          # Network security
        ├── ebs/                      # Storage
        ├── ecs_cluster/              # ECS cluster
        ├── ecs_service/              # ECS tasks
        ├── iam_roles/                # Permissions
        └── monitoring/               # Alarms & logs
```

---

## 💰 Cost & Specs

### Default Configuration
- **Compute**: 4 vCPU, 8 GB RAM (ECS Fargate)
- **Storage**: 500 GB EBS gp3 (encrypted)
- **Network**: Multi-AZ VPC with NAT gateways
- **Monitoring**: CloudWatch logs + 4 alarms
- **Estimated Cost**: **~$285/month**

### Scaling
- 1 vCPU = ~$37/month
- 1 GB RAM = ~$10/month
- 100 GB storage = ~$8/month

---

## 🔧 Configuration Options

### Edit Terraform Variables

File: `aws/blockchain-node/terraform/environments/prod.tfvars`

```hcl
# Compute
task_cpu     = 4096      # 0.25 to 4 vCPU
task_memory  = 8192      # 512 MB to 30 GB

# Storage
blockchain_data_volume_size = 500     # GB
blockchain_data_iops        = 3000    # IOPS

# RPC
rpc_port     = 8545
rpc_ws_port  = 8546

# Network
max_peers    = 50

# Blockchain
chain_id     = 1
network_id   = 1
```

### Restrict RPC Access

```hcl
# Only allow from specific IPs
rpc_ingress_cidr = [
  "203.0.113.0/24",    # Your office
  "198.51.100.0/24"    # Your VPN
]
```

---

## 📊 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    AWS Account                          │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────┐  │
│  │  VPC (10.0.0.0/16)                               │  │
│  │  - 2 Public Subnets (ALB)                        │  │
│  │  - 2 Private Subnets (ECS)                       │  │
│  │                                                  │  │
│  │  ┌─────────────────────────────────────────┐   │  │
│  │  │  ECS Fargate Task                       │   │  │
│  │  │  ┌──────────────────────────────────┐   │   │  │
│  │  │  │ LXON Blockchain Node             │   │   │  │
│  │  │  │ • 4 vCPU, 8 GB RAM               │   │   │  │
│  │  │  │ • RPC: 8545 (JSON-RPC)          │   │   │  │
│  │  │  │ • WS: 8546 (WebSocket)          │   │   │  │
│  │  │  │ • P2P: 30303 (Peer network)     │   │   │  │
│  │  │  └──────────────────────────────────┘   │   │  │
│  │  │           ▼                              │   │  │
│  │  │  ┌──────────────────────────────────┐   │   │  │
│  │  │  │ EFS Volume (500 GB)              │   │   │  │
│  │  │  │ Mount: /app/data                 │   │   │  │
│  │  │  │ Encryption: AES-256              │   │   │  │
│  │  │  └──────────────────────────────────┘   │   │  │
│  │  └─────────────────────────────────────────┘   │  │
│  │                                                  │  │
│  │  Security Groups:                              │  │
│  │  • RPC (8545-8546) - Controlled                │  │
│  │  • P2P (30303) - Open                          │  │
│  │  • Egress - All                                │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Monitoring & Logging                            │  │
│  │  • CloudWatch Logs (30 days)                     │  │
│  │  • CloudWatch Alarms (CPU, Memory, Health)      │  │
│  │  • SNS Email Notifications                      │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 🔐 Security Features

- **Network Isolation**: Private VPC with controlled ingress
- **Encryption**: EBS volumes encrypted at rest
- **Secrets**: Validator key in environment variables (rotate regularly)
- **Access Control**: IAM roles with least-privilege
- **Monitoring**: CloudWatch alerts on anomalies
- **Non-root User**: Container runs as non-root
- **Automated Recovery**: Failed tasks restart automatically

---

## 📈 What Gets Deployed

### Compute
- 1 ECS Fargate task (4 vCPU, 8 GB)
- Auto-recovery enabled
- Health checks every 60 seconds

### Storage
- 500 GB EFS volume
- Encrypted at rest
- 30-day snapshots

### Networking
- VPC with 2 AZs
- 2 public subnets (NAT gateways)
- 2 private subnets (ECS tasks)
- Security groups for RPC, P2P

### Monitoring
- CloudWatch Logs (30 days)
- 4 CloudWatch Alarms:
  - High CPU (>85%)
  - High Memory (>85%)
  - Unhealthy tasks
  - No running tasks

- SNS email notifications

### IAM
- Task execution role (ECR pull, logs)
- Task role (EBS, CloudWatch, logs)

---

## 🚀 Quick Start

### Prerequisites
```bash
brew install aws-cli terraform docker
aws configure
```

### Deploy
```bash
# 1. Configure
export VALIDATOR_ADDRESS=0x...
export VALIDATOR_KEY=0x...
export GENESIS_TIME=$(date +%s)
export ALERT_EMAIL=ops@example.com

# 2. Deploy
cd /Users/adikamble/LXON/LXON
bash aws/blockchain-node/scripts/deploy.sh

# 3. Monitor
bash aws/blockchain-node/scripts/monitor.sh

# 4. Test
curl -X POST http://<public-ip>:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
```

---

## 📚 Documentation

| File | Purpose |
|------|---------|
| `README.md` | Overview and quick start (5 min read) |
| `DEPLOYMENT.md` | Comprehensive guide (30 min read) |
| `QUICKSTART.md` | 5-minute setup checklist |
| `terraform/main.tf` | Infrastructure as code |
| `scripts/deploy.sh` | Automated deployment |

---

## 🔧 Common Operations

### View Logs
```bash
aws logs tail /ecs/lxon-node-prod --follow
```

### Scale Resources
```bash
cd aws/blockchain-node/terraform
terraform apply -var task_cpu=8192 -var task_memory=16384
```

### Monitor Health
```bash
bash aws/blockchain-node/scripts/monitor.sh
```

### Upgrade Node
```bash
# Update code, rebuild, push
git pull origin main
docker build -f docker/lxon-node.Dockerfile -t lxon-node:latest .
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin ...
docker tag lxon-node:latest ...
docker push ...

# Restart
aws ecs update-service --cluster lxon-node-prod --service lxon-node-node --force-new-deployment
```

### Destroy Infrastructure
```bash
bash aws/blockchain-node/scripts/cleanup.sh
```

---

## ✅ Deployment Checklist

- [ ] AWS account created
- [ ] AWS CLI installed and configured
- [ ] Terraform installed
- [ ] Docker installed
- [ ] Validator address ready
- [ ] Validator key ready (kept secure!)
- [ ] Alert email set
- [ ] `bash aws/blockchain-node/scripts/deploy.sh` executed
- [ ] RPC endpoint tested
- [ ] dApps pointing to RPC

---

## 🎯 Next Steps

### Immediate (Today)
1. Read `aws/blockchain-node/README.md` (5 min)
2. Set environment variables
3. Run deployment script
4. Test RPC endpoint

### Short-term (This Week)
1. Configure dApps to use your RPC
2. Monitor node performance
3. Set up backup procedures
4. Test failover/recovery

### Long-term (Ongoing)
1. Monitor costs
2. Update LXON when new versions available
3. Scale resources as needed
4. Archive data periodically

---

## 📞 Troubleshooting

### Not Starting?
```bash
aws logs tail /ecs/lxon-node-prod --follow
```

### RPC Not Responding?
```bash
aws ecs describe-services --cluster lxon-node-prod --services lxon-node-node
```

### Out of Storage?
```bash
terraform apply -var blockchain_data_volume_size=1000
```

See `DEPLOYMENT.md` for detailed troubleshooting.

---

## 📊 Estimated Timeline

| Step | Time |
|------|------|
| Prerequisites setup | 5 min |
| AWS credentials config | 2 min |
| Script deployment | 10 min |
| Task startup | 5 min |
| **Total** | **~20 min** |

---

## 💡 Tips

- **Start small**: Use default 4 vCPU, 8 GB config
- **Monitor first**: Watch metrics before scaling
- **Restrict RPC**: Don't leave it open to 0.0.0.0/0 in production
- **Backup keys**: Store validator key in AWS Secrets Manager
- **Test regularly**: Verify RPC endpoints work
- **Update regularly**: Pull latest LXON versions

---

## 🔗 Resources

- **AWS Docs**: https://docs.aws.amazon.com/ecs/
- **Terraform**: https://www.terraform.io/docs/
- **LXON Repo**: ../../README.md
- **Ethereum RPC**: https://ethereum.org/en/developers/docs/apis/json-rpc/

---

## 📄 File Locations

```
/Users/adikamble/LXON/LXON/
├── aws/
│   ├── blockchain-node/                    ← You are here
│   │   ├── README.md
│   │   ├── DEPLOYMENT.md
│   │   ├── QUICKSTART.md
│   │   ├── scripts/
│   │   │   ├── deploy.sh               ⭐ Run this
│   │   │   ├── monitor.sh
│   │   │   ├── build.sh
│   │   │   └── cleanup.sh
│   │   └── terraform/
│   │       ├── main.tf
│   │       ├── variables.tf
│   │       ├── environments/prod.tfvars
│   │       └── modules/
│   └── (full stack deployment also available)
├── docker/
│   ├── lxon-node.Dockerfile           ← Production image
│   ├── lxon-backend.Dockerfile
│   └── lxon-explorer.Dockerfile
└── README.md
```

---

## 🎉 Ready to Deploy?

```bash
# Start here:
cd /Users/adikamble/LXON/LXON
cat aws/blockchain-node/README.md

# Then deploy:
bash aws/blockchain-node/scripts/deploy.sh
```

---

**You now have everything needed to run a production LXON blockchain validator on AWS!**

For questions, see `DEPLOYMENT.md` or check AWS documentation.

Good luck! 🚀
