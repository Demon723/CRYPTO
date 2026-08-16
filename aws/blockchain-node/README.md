# LXON Blockchain Node on AWS

Production-ready deployment of LXON blockchain validator node on AWS ECS Fargate.

## 🚀 Quick Deploy

```bash
# Set your validator config
export VALIDATOR_ADDRESS=0x...
export VALIDATOR_KEY=0x...
export GENESIS_TIME=$(date +%s)
export ALERT_EMAIL=ops@example.com

# Deploy (5-10 minutes)
bash scripts/deploy.sh

# Done! Your RPC endpoint is ready to use
```

## 📋 What's Included

- **Terraform IaC**: Complete AWS infrastructure
- **ECS Fargate**: Serverless container compute
- **EBS Storage**: 500 GB persistent volume
- **VPC**: Multi-AZ networking with NAT
- **CloudWatch**: Logs, metrics, alarms
- **SNS**: Email alerts
- **Auto-recovery**: Failed tasks restart automatically
- **Security**: Encrypted storage, controlled networking

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│            AWS Account (us-east-1)          │
├─────────────────────────────────────────────┤
│                    VPC                      │
│  ┌───────────────────────────────────────┐  │
│  │      ECS Fargate Service              │  │
│  │  ┌─────────────────────────────────┐  │  │
│  │  │  LXON Blockchain Node           │  │  │
│  │  │  • 4 vCPU, 8 GB RAM             │  │  │
│  │  │  • RPC: 8545, WS: 8546          │  │  │
│  │  │  • P2P: 30303                   │  │  │
│  │  └─────────────────────────────────┘  │  │
│  │           ▼                             │  │
│  │  ┌─────────────────────────────────┐  │  │
│  │  │  EFS (500 GB)                   │  │  │
│  │  │  /app/data (blockchain state)   │  │  │
│  │  └─────────────────────────────────┘  │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │  CloudWatch Logs & Alarms             │  │
│  │  SNS Email Notifications              │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

## 📚 Files

| Path | Purpose |
|------|---------|
| `terraform/` | Terraform configuration |
| `terraform/modules/` | Reusable Terraform modules |
| `terraform/environments/` | Environment configs |
| `scripts/deploy.sh` | One-command deployment |
| `scripts/monitor.sh` | Health monitoring |
| `scripts/build.sh` | Local Docker build |
| `scripts/cleanup.sh` | Infrastructure teardown |
| `DEPLOYMENT.md` | Full documentation |

## 🔧 Configuration

### Environment Variables

```bash
export AWS_REGION=us-east-1
export VALIDATOR_ADDRESS=0x...    # Ethereum address
export VALIDATOR_KEY=0x...        # 64-char hex key
export GENESIS_TIME=1704067200    # Unix timestamp
export ALERT_EMAIL=ops@example.com
```

### Terraform Variables

Edit `terraform/environments/prod.tfvars`:

```hcl
task_cpu                       = 4096      # 4 vCPU
task_memory                    = 8192      # 8 GB
blockchain_data_volume_size    = 500       # GB
max_peers                      = 50
rpc_port                       = 8545
rpc_ws_port                    = 8546
```

## 📊 Costs

| Component | Monthly Cost |
|-----------|------------|
| ECS Fargate (4 vCPU, 8 GB) | ~$230 |
| EBS gp3 (500 GB) | ~$40 |
| Data Transfer | ~$10 |
| Monitoring & Logs | ~$5 |
| **Total** | **~$285** |

## 🎯 Access Your Node

After deployment:

```bash
# Get RPC endpoint
RPC_ENDPOINT=$(aws ecs describe-tasks \
  --cluster lxon-node-prod \
  --tasks $(aws ecs list-tasks --cluster lxon-node-prod --query 'taskArns[0]' --output text) \
  --query 'tasks[0].attachments[?name==`ElasticNetworkInterface`].details[?name==`publicIp`].value' \
  --output text)

echo "RPC: http://$RPC_ENDPOINT:8545"

# Test it
curl -X POST http://$RPC_ENDPOINT:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
```

## 📝 Next Steps

1. **Deploy**: `bash scripts/deploy.sh`
2. **Monitor**: `bash scripts/monitor.sh`
3. **Integrate**: Point dApps to RPC endpoint
4. **Scale**: Increase resources as needed
5. **Backup**: Configure EBS snapshots

## 🚨 Troubleshooting

### Task not starting
```bash
aws logs tail /ecs/lxon-node-prod --follow
```

### RPC not responding
```bash
aws ecs describe-services --cluster lxon-node-prod --services lxon-node-node
```

### Out of storage
```bash
# Increase volume
terraform apply -var blockchain_data_volume_size=1000
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed troubleshooting.

## 🧹 Cleanup

```bash
bash scripts/cleanup.sh
```

## 📖 Full Documentation

See [DEPLOYMENT.md](DEPLOYMENT.md) for:
- Step-by-step setup
- RPC usage examples
- Monitoring & alerting
- Security best practices
- Upgrading LXON
- Advanced configuration

## 📞 Support

- Report issues: GitHub issues
- Documentation: [DEPLOYMENT.md](DEPLOYMENT.md)
- LXON docs: [../../README.md](../../README.md)
