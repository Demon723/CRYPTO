# AWS Deployment Summary

Your LXON blockchain node is now ready for AWS deployment with complete infrastructure-as-code and automation.

## 📁 Directory Structure

```
aws/blockchain-node/
├── terraform/                          # Infrastructure as Code
│   ├── main.tf                        # Main Terraform config
│   ├── variables.tf                   # Input variables
│   ├── environments/
│   │   └── prod.tfvars               # Production settings
│   └── modules/
│       ├── vpc/                      # VPC and networking
│       ├── ecr/                      # Container registry
│       ├── security_groups/          # Network security
│       ├── ebs/                      # Persistent storage
│       ├── ecs_cluster/              # ECS cluster
│       ├── ecs_service/              # ECS service & tasks
│       ├── iam_roles/                # IAM permissions
│       └── monitoring/               # CloudWatch alarms
├── scripts/
│   ├── deploy.sh                     # One-command deployment ⭐
│   ├── build.sh                      # Build Docker image
│   ├── monitor.sh                    # Monitor node health
│   └── cleanup.sh                    # Destroy infrastructure
├── README.md                         # Quick start
└── DEPLOYMENT.md                     # Full documentation

docker/
└── lxon-node.Dockerfile              # Production image (multi-stage)
```

## 🚀 Deploy in 3 Steps

### 1️⃣ Set Configuration

```bash
export AWS_REGION=us-east-1
export VALIDATOR_ADDRESS=0x...        # Your validator address
export VALIDATOR_KEY=0x...            # Your private key
export GENESIS_TIME=$(date +%s)       # Current timestamp
export ALERT_EMAIL=ops@example.com    # For alerts
```

### 2️⃣ Run Deployment

```bash
bash aws/blockchain-node/scripts/deploy.sh
```

**What happens:**
- ✓ Verifies AWS credentials
- ✓ Creates S3 backend for Terraform state
- ✓ Builds Docker image
- ✓ Pushes to ECR
- ✓ Deploys VPC, ECS, storage, monitoring
- ✓ Starts blockchain node
- ✓ Outputs RPC endpoint

### 3️⃣ Use Your Node

```bash
# Get RPC endpoint from output
RPC=http://<public-ip>:8545

# Test it
curl -X POST $RPC \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
```

## 📊 Infrastructure Created

| Component | Specs | Purpose |
|-----------|-------|---------|
| **VPC** | 10.0.0.0/16, 2 AZs | Network isolation |
| **ECS Fargate** | 4 vCPU, 8 GB RAM | Compute |
| **EFS** | 500 GB, gp3, encrypted | Blockchain data |
| **Security Groups** | 4 groups | Network access control |
| **CloudWatch** | 30-day logs | Monitoring |
| **SNS** | Email alerts | Notifications |
| **IAM Roles** | Task execution + task role | Permissions |

## 🔧 Configuration Options

### Compute Resources

Edit `terraform/environments/prod.tfvars`:

```hcl
task_cpu     = 4096    # 0.25 to 4 vCPU
task_memory  = 8192    # 512 MB to 30 GB
```

Supported combinations:
- 256 CPU + 512 MB → 2048 MB RAM
- 512 CPU + 1 GB → 4 GB RAM
- 1024 CPU + 2 GB → 8 GB RAM
- 2048 CPU + 4 GB → 16 GB RAM
- 4096 CPU + 8 GB → 30 GB RAM

### Storage

```hcl
blockchain_data_volume_size    = 500      # GB
blockchain_data_volume_type    = "gp3"    # gp3, io1, io2
blockchain_data_iops           = 3000     # IOPS
blockchain_data_throughput     = 125      # MB/s (gp3 only)
```

### Network Security

```hcl
rpc_ingress_cidr = ["0.0.0.0/0"]  # Allow all (change for production!)
```

Restrict to known IPs:

```hcl
rpc_ingress_cidr = [
  "203.0.113.0/24",   # Your office
  "198.51.100.0/24"   # Your data center
]
```

## 💰 Cost Estimate

**Monthly cost for default configuration:**

| Component | Cost |
|-----------|------|
| ECS Fargate (4 vCPU) | $150 |
| ECS Fargate (8 GB) | $80 |
| EBS gp3 (500 GB, 3K IOPS, 125 MB/s) | $40 |
| Data transfer | $10 |
| CloudWatch (logs + 4 alarms) | $5 |
| **Total** | **$285/month** |

**Scaling costs:**
- 1 vCPU = ~$37/month
- 1 GB RAM = ~$10/month
- 100 GB storage = ~$8/month

## 📈 Monitoring

### Real-time Logs

```bash
aws logs tail /ecs/lxon-node-prod --follow
```

### Service Status

```bash
aws ecs describe-services \
  --cluster lxon-node-prod \
  --services lxon-node-node \
  --region us-east-1
```

### Metrics Dashboard

```bash
aws cloudwatch describe-alarms \
  --alarm-name-prefix lxon-node \
  --region us-east-1
```

### Health Check

```bash
# Get public IP
IP=$(aws ecs describe-tasks \
  --cluster lxon-node-prod \
  --tasks $(aws ecs list-tasks --cluster lxon-node-prod --query 'taskArns[0]' --output text) \
  --query 'tasks[0].attachments[?name==`ElasticNetworkInterface`].details[?name==`networkInterfaceId`].value' \
  --output text --region us-east-1)

# Test RPC
curl http://$IP:8545
```

## 🔄 Workflow

### Local Development

```bash
# Build Docker image locally
bash aws/blockchain-node/scripts/build.sh

# Test image
docker run -p 8545:8545 lxon-node:latest
```

### Deployment

```bash
# Deploy to AWS
bash aws/blockchain-node/scripts/deploy.sh

# Monitor
bash aws/blockchain-node/scripts/monitor.sh

# View logs
aws logs tail /ecs/lxon-node-prod --follow
```

### Updates

```bash
# 1. Update code
git pull origin main

# 2. Build new image
docker build -f docker/lxon-node.Dockerfile -t lxon-node:latest .

# 3. Push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $REGISTRY
docker tag lxon-node:latest $REGISTRY/lxon-node:latest
docker push $REGISTRY/lxon-node:latest

# 4. Restart service (pulls new image)
aws ecs update-service --cluster lxon-node-prod --service lxon-node-node --force-new-deployment
```

### Cleanup

```bash
bash aws/blockchain-node/scripts/cleanup.sh
```

## 🔐 Security Checklist

- [ ] Validator key stored securely (AWS Secrets Manager or environment)
- [ ] RPC access restricted to known IPs (`rpc_ingress_cidr`)
- [ ] Email alerts configured for failures
- [ ] CloudWatch logs enabled with 30-day retention
- [ ] EBS volumes encrypted
- [ ] VPC security groups reviewed
- [ ] IAM roles follow least-privilege principle
- [ ] SSH access disabled (Fargate only)

## 🐛 Troubleshooting

### Task won't start
```bash
# Check logs
aws logs tail /ecs/lxon-node-prod --follow

# Check task status
aws ecs describe-tasks --cluster lxon-node-prod --tasks <task-arn>

# Check service events
aws ecs describe-services --cluster lxon-node-prod --services lxon-node-node
```

### RPC not responding
```bash
# Check security group
aws ec2 describe-security-groups --filters Name=tag:Name,Values=lxon-node-ecs-sg

# Test connectivity
curl -v http://<ip>:8545/

# Check service is running
aws ecs list-tasks --cluster lxon-node-prod
```

### Out of memory/storage
```bash
# Check metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/ECS \
  --metric-name MemoryUtilization \
  --dimensions Name=ServiceName,Value=lxon-node-node \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Maximum

# Scale up
terraform apply -var task_memory=16384
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed troubleshooting.

## 📚 Resources

- **AWS ECS**: https://docs.aws.amazon.com/ecs/
- **Terraform**: https://www.terraform.io/docs/
- **LXON Docs**: ../../README.md
- **Ethereum JSON-RPC**: https://ethereum.org/en/developers/docs/apis/json-rpc/

## ✅ Checklist

- [ ] AWS account and CLI configured
- [ ] Terraform installed locally
- [ ] Docker installed
- [ ] Validator address and key ready
- [ ] Alert email configured
- [ ] `bash aws/blockchain-node/scripts/deploy.sh` executed
- [ ] RPC endpoint tested
- [ ] Monitoring configured
- [ ] dApps pointing to RPC endpoint

## 📞 Next Steps

1. **Quick Start**: Read [README.md](README.md) (5 min)
2. **Configure**: Edit `terraform/environments/prod.tfvars`
3. **Deploy**: Run `bash aws/blockchain-node/scripts/deploy.sh` (10 min)
4. **Monitor**: Use `bash aws/blockchain-node/scripts/monitor.sh`
5. **Integrate**: Point applications to RPC endpoint
6. **Scale**: Increase resources as needed

---

**Total deployment time: ~15 minutes** ⏱️

Questions? See [DEPLOYMENT.md](DEPLOYMENT.md) for comprehensive documentation.
