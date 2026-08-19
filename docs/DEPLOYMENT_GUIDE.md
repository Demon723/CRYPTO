# LXON Deployment Guide

## ☁️ AWS Deployment

### Architecture Overview

```
Internet → CloudFront/WAF → ALB → ECS Fargate (LXON Node, Backend, Explorer)
                               ↓
                           RDS PostgreSQL (Multi-AZ)
                               ↓
                           ElastiCache Redis
                               ↓
                           S3 (Static Assets)
```

### Prerequisites

1. **AWS Account** with appropriate permissions
2. **AWS CLI** configured locally
3. **Terraform** >= 1.0 installed
4. **Docker** installed and running
5. **ECR repositories** created (see setup script)

### Deployment Steps

#### 1. Initial Setup

```bash
# Run the setup script to create ECR repos and build images
./deploy/aws/scripts/setup.sh
```

#### 2. Configure Terraform

```bash
# Copy example variables
cp deploy/aws/terraform/terraform.tfvars.example deploy/aws/terraform/terraform.tfvars

# Edit with your values
vim deploy/aws/terraform/terraform.tfvars
```

Key variables:
- `aws_region`: AWS region (e.g., `us-east-1`)
- `environment`: `staging` or `production`
- `alert_email`: Email for CloudWatch alerts
- `container_cpu` / `container_memory`: Fargate task resources

#### 3. Deploy Infrastructure

```bash
./deploy/aws/scripts/deploy.sh
```

This will:
1. Initialize Terraform with S3 backend
2. Plan infrastructure changes
3. Apply VPC, subnets, security groups
4. Create ECS cluster and Fargate services
5. Provision RDS PostgreSQL Multi-AZ
6. Set up ALB with HTTPS (production)
7. Configure CloudWatch alarms and dashboard
8. Output the ALB URL

#### 4. Verify Deployment

```bash
# Check ECS service status
aws ecs describe-services --cluster lxon-cluster --services lxon-node-service

# Check task health
aws ecs list-tasks --cluster lxon-cluster --service-name lxon-node-service

# View logs
aws logs tail /ecs/lxon --follow
```

### CI/CD with CircleCI

AWS deployment is configured in `.circleci/config.yml`:

- **Staging**: Auto-deploys on every push to `main`
- **Production**: Manual approval required, deploys after staging success

To enable:
1. Add `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` to CircleCI project settings
2. Create IAM role `CircleCIRole` with necessary permissions
3. Push to `main` branch to trigger deployment

### Infrastructure Components

| Component | AWS Service | Purpose |
|-----------|-------------|---------|
| Compute | ECS Fargate | Container orchestration |
| Load Balancer | ALB | Traffic distribution |
| Database | RDS PostgreSQL | Persistent storage |
| Cache | ElastiCache Redis | Session cache |
| Storage | EFS | Shared file storage |
| Logs | CloudWatch | Centralized logging |
| Alerts | SNS + CloudWatch | Monitoring alerts |
| DNS | Route 53 | Domain management |
| CDN | CloudFront | Static asset delivery |

### Security Best Practices

- All resources deployed in private subnets
- Security groups restrict access to only required ports
- RDS and ElastiCache not publicly accessible
- Secrets stored in AWS Secrets Manager
- ECS tasks use IAM roles (no hardcoded credentials)
- ALB redirects HTTP to HTTPS in production
- CloudWatch alarms for CPU, memory, and health

### Cost Optimization

- Use Fargate Spot for non-critical workloads (70% savings)
- Enable RDS auto-scaling for storage
- Use S3 Intelligent-Tiering for logs
- Set up CloudWatch alarms to detect idle resources
- Use Savings Plans for steady-state workloads

### Troubleshooting

```bash
# Check ECS task logs
aws logs tail /ecs/lxon --follow --filter-pattern "lixon-node"

# Check service events
aws ecs describe-services --cluster lxon-cluster --services lixon-node-service --query "services[0].events"

# SSH into Fargate task (via CloudShell)
aws ecs execute-command --cluster lixon-cluster --task <task-id> --interactive
```

### Scaling

To scale the application:

```bash
# Scale ECS service
aws ecs update-service --cluster lxon-cluster --service lixon-node-service --desired-count 4

# Or update Terraform
cd deploy/aws/terraform
terraform apply -var="task_count=4"
```

Auto-scaling is configured in `ecs.tf` with target tracking on CPU and memory utilization.

### Prerequisites

1. **Install Dependencies**:
```bash
cd apps/contracts
npm install
```

2. **Environment Variables**:
Create `.env` file in `apps/contracts/`:
```env
# Private key for deployment
PRIVATE_KEY=your_private_key_here

# RPC URLs
TESTNET_RPC_URL=https://ethereum-testnet.infura.io/v3/YOUR_PROJECT_ID
MAINNET_RPC_URL=https://mainnet.infura.io/v3/YOUR_PROJECT_ID

# Etherscan API for contract verification
ETHERSCAN_API_KEY=your_etherscan_api_key

# Governance members (optional for initial deployment)
COUNCIL_MEMBER_1=0x...
COUNCIL_MEMBER_2=0x...
COUNCIL_MEMBER_3=0x...
COUNCIL_MEMBER_4=0x...
COUNCIL_MEMBER_5=0x...

EMERGENCY_ADMIN_1=0x...
EMERGENCY_ADMIN_2=0x...

TEAM_MEMBER_1=0x...
TEAM_MEMBER_2=0x...
TEAM_MEMBER_3=0x...
TEAM_MEMBER_4=0x...
```

### Deployment Steps

#### 1. Deploy to Local Development Network

```bash
# Start local node
npx hardhat node

# Deploy contracts
npx hardhat run scripts/deploy-lxon-decentralized.ts --network localhost
```

#### 2. Deploy to Testnet

```bash
# Deploy contracts
npx hardhat run scripts/deploy-lxon-decentralized.ts --network testnet

# Verify contracts on Etherscan
npx hardhat verify --network testnet <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

#### 3. Setup Governance (After Contract Deployment)

```bash
# Set environment variables with deployed contract addresses
export LXON_DECENTRALIZED_ADDRESS=0x...
export LXON_DAO_ADDRESS=0x...
export TIMELOCK_ADDRESS=0x...
export LXON_VESTING_ADDRESS=0x...

# Run governance setup
npx hardhat run scripts/deploy-lxon-governance.ts --network testnet
```

#### 4. Deploy to Mainnet (After Security Audits)

```bash
# WARNING: Only deploy after comprehensive security audits
npx hardhat run scripts/deploy-lxon-decentralized.ts --network mainnet

# Verify contracts
npx hardhat verify --network mainnet <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>

# Setup governance
npx hardhat run scripts/deploy-lxon-governance.ts --network mainnet
```

## 📋 Deployment Checklist

### Pre-Deployment
- [ ] Security audits completed (CertiK, Trail of Bits, OpenZeppelin)
- [ ] Test suite passing (100% coverage)
- [ ] Gas optimization reviewed
- [ ] Deployment environment variables configured
- [ ] Multi-sig wallet setup for team funds
- [ ] Monitoring and alerting configured

### Deployment Day
- [ ] Backup deployment account private key
- [ ] Verify network and chain ID
- [ ] Deploy LXONDecentralized contract
- [ ] Verify LXONDecentralized deployment
- [ ] Deploy LXONDAO contract
- [ ] Verify LXONDAO deployment
- [ ] Deploy TimelockController
- [ ] Verify TimelockController deployment
- [ ] Deploy LXONVesting contract
- [ ] Verify LXONVesting deployment
- [ ] Configure roles and permissions
- [ ] Setup technical council
- [ ] Setup emergency admins
- [ ] Configure team vesting
- [ ] Verify all configurations

### Post-Deployment
- [ ] Verify contracts on block explorer
- [ ] Test token minting
- [ ] Test governance proposal
- [ ] Test emergency override
- [ ] Monitor contract interactions
- [ ] Setup block explorer indexing
- [ ] Configure monitoring dashboards
- [ ] Announce deployment to community

## 🔒 Security Considerations

### Deployment Security
1. **Use Hardware Wallet**: Deploy from hardware wallet (Ledger, Trezor)
2. **Multi-Sig**: Use multi-sig for critical operations
3. **Environment Variables**: Never commit `.env` file
4. **Key Management**: Store private keys securely
5. **Testing**: Deploy to testnet first, verify thoroughly

### Post-Deployment Security
1. **Monitor**: Monitor contract interactions for suspicious activity
2. **Alerts**: Set up alerts for large transfers
3. **Upgrades**: Have upgrade mechanism ready (if needed)
4. **Insurance**: Consider protocol insurance
5. **Audit**: Regular security audits

## 📊 Network Configuration

### Local Development
- **Network**: Hardhat Network
- **Chain ID**: 31337
- **Gas Price**: Auto
- **Block Time**: Auto

### Testnet
- **Network**: Ethereum Testnet
- **Chain ID**: 11155111
- **Gas Price**: Dynamic
- **Block Time**: ~12 seconds
- **Explorer**: https://testnet.etherscan.io

### Mainnet
- **Network**: Ethereum Mainnet
- **Chain ID**: 1
- **Gas Price**: Dynamic
- **Block Time**: ~12 seconds
- **Explorer**: https://etherscan.io

## 🎯 Contract Deployment Order

1. **LXONDecentralized** - Core token contract
2. **TimelockController** - Security timelock
3. **LXONDAO** - Governance contract
4. **LXONVesting** - Team vesting contract

## 📝 Deployment Verification

After deployment, verify:

```bash
# Check contract addresses
npx hardhat console --network testnet
> const lxon = await ethers.getContractAt('LXONDecentralized', '0x...')
> await lxon.name()
> await lxon.symbol()
> await lxon.MAX_SUPPLY()
> await lxon.totalSupply()
```

## 🚨 Emergency Procedures

### Rollback Plan
1. Pause contracts using PAUSER_ROLE
2. Revert to previous deployment snapshot
3. Communicate with community
4. Investigate issue
5. Fix and redeploy

### Emergency Override
If critical issue detected:
```bash
# Declare emergency (requires EMERGENCY_ROLE)
# Execute emergency override (72-hour notice + 80% council approval)
```

## 📈 Gas Optimization

Deployment gas costs (estimated):
- LXONDecentralized: ~2,000,000 gas
- LXONDAO: ~1,500,000 gas
- TimelockController: ~500,000 gas
- LXONVesting: ~1,000,000 gas
- **Total**: ~5,000,000 gas

At 30 gwei: ~0.15 ETH (~$300 at $2,000/ETH)

## 🎓 Best Practices

1. **Test Thoroughly**: Test on local network, then testnet, then mainnet
2. **Verify Contracts**: Always verify source code on Etherscan
3. **Monitor**: Monitor contract interactions post-deployment
4. **Document**: Document all deployment decisions
5. **Backup**: Backup all deployment data and keys
6. **Communicate**: Communicate deployment to community
7. **Security**: Prioritize security over speed