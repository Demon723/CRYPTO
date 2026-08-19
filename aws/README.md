# LXON AWS Deployment

Complete infrastructure-as-code for deploying LXON cryptocurrency blockchain to AWS using Terraform, ECS Fargate, RDS, and ElastiCache.

## 📋 Contents

- `terraform/` - Terraform configuration for AWS infrastructure
- `docker/` - Production Dockerfiles for each service
- `.github/workflows/deploy.yml` - CI/CD pipeline
- `scripts/` - Deployment automation scripts
- `docs/AWS_DEPLOYMENT.md` - Full deployment guide
- `docs/AWS_QUICKSTART.md` - Quick start (5 minutes)

## 🏗️ Infrastructure

### Components

| Service | Compute | Database | Cache | Load Balancer |
|---------|---------|----------|-------|---------------|
| lxon-node | ECS Fargate (2 vCPU, 4GB) | N/A | N/A | N/A |
| lxon-backend | ECS Fargate (1 vCPU, 2GB) | RDS PostgreSQL | Redis | ALB |
| lxon-explorer | ECS Fargate (0.5 vCPU, 1GB) | N/A | N/A | ALB |

### Networking

- **VPC**: 10.0.0.0/16
- **Public Subnets**: 2 (ALB, NAT)
- **Private Subnets**: 2 (ECS, RDS, Redis)
- **Availability Zones**: 2 (Multi-AZ HA)
- **Security Groups**: 4 (ALB, ECS, RDS, Redis)

### Databases

- **RDS PostgreSQL**: db.t3.small, 50GB, Multi-AZ
- **ElastiCache Redis**: cache.t3.micro, Single node

## 🚀 Quick Start

```bash
# 1. Prerequisites
export AWS_REGION=us-east-1
aws configure

# 2. Build Docker images
bash scripts/build-docker.sh

# 3. Deploy infrastructure
cd aws/terraform
terraform init
terraform plan -var-file="environments/prod.tfvars"
terraform apply

# 4. Push images to ECR
bash ../scripts/deploy-aws.sh

# 5. Access your deployment
ALB_DNS=$(terraform output -raw alb_dns_name)
echo "Services: http://$ALB_DNS"
```

## 📚 Full Documentation

See [docs/AWS_DEPLOYMENT.md](docs/AWS_DEPLOYMENT.md) for:
- Detailed prerequisites
- Step-by-step setup
- Domain configuration
- Monitoring & logging
- Cost estimation
- Troubleshooting
- Cleanup

## 🔧 Configuration

### Terraform Variables

Edit `aws/terraform/environments/prod.tfvars`:

```hcl
aws_region            = "us-east-1"
environment           = "prod"
db_instance_class     = "db.t3.small"
allocated_storage     = 50
```

### Environment Variables

Create `.env.production`:

```bash
export AWS_REGION=us-east-1
export DB_PASSWORD=...
export VALIDATOR_ADDRESS=0x...
export VALIDATOR_KEY=0x...
```

## 🐳 Docker Images

### lxon-node (Blockchain)
- **Base**: node:22-alpine
- **Size**: ~450MB
- **Ports**: 8545 (RPC), 8546 (WebSocket)
- **Health Check**: HTTP /health

### lxon-backend (API)
- **Base**: node:22-alpine
- **Size**: ~280MB
- **Ports**: 4000 (REST), WebSocket
- **Framework**: NestJS
- **Health Check**: HTTP /api/v1/health

### lxon-explorer (UI)
- **Base**: node:22-alpine
- **Size**: ~220MB
- **Ports**: 3000 (Next.js)
- **Health Check**: HTTP /

## 📊 Monitoring

### CloudWatch
- Container Insights enabled
- Auto-scaling based on CPU (70% threshold)
- SNS alerts for failures

### Logs
- All services log to CloudWatch
- 7-day retention
- Streaming available via AWS CLI

### Alarms
- High CPU utilization (>80%)
- High memory utilization (>80%)
- Unhealthy tasks

## 💾 Data

### Database
- **RDS PostgreSQL**: Primary data store
- **Multi-AZ**: Automatic failover
- **Automated Backups**: 7-day retention
- **Encryption**: At-rest (AES-256)

### Cache
- **ElastiCache Redis**: Session & query cache
- **Automatic Snapshots**: 7-day retention
- **Failover**: Manual (upgrade to cluster for auto-failover)

## 🔐 Security

### Network
- VPC isolation
- Security groups (ingress/egress rules)
- Private subnets for data layer
- NAT gateways for egress

### Secrets
- AWS Secrets Manager for sensitive data
- IAM roles for service-to-service auth
- Encryption at rest & in transit

### Compliance
- CloudTrail logging
- VPC Flow Logs
- AWS Config monitoring

## 📈 Auto-Scaling

### Backend Service
- **Min Replicas**: 1
- **Max Replicas**: 4
- **Metric**: CPU utilization (70%)
- **Scale-up**: +1 task when CPU > 70%
- **Scale-down**: -1 task when CPU < 30%

### Node & Explorer
- **Fixed Replicas**: 1 each
- Can be scaled manually via AWS CLI

## 🚨 Common Issues

### Services not starting
```bash
aws ecs describe-tasks --cluster lxon-prod --tasks [task-arn]
aws logs get-log-events --log-group-name /ecs/lxon-prod --log-stream-name ...
```

### Database connection issues
- Check security groups allow port 5432
- Verify RDS endpoint in environment
- Confirm credentials in Secrets Manager

### High costs
- Right-size instance classes
- Enable spot instances for non-critical services
- Use Reserved Instances for predictable workloads

## 🧹 Cleanup

```bash
cd aws/terraform
terraform destroy -var-file="environments/prod.tfvars"
```

⚠️ **Note**: RDS snapshots are retained for 7 days after deletion.

## 📞 Support

For issues:
1. Check CloudWatch Logs
2. Review CloudWatch Alarms
3. See docs/AWS_DEPLOYMENT.md#Troubleshooting
4. Open GitHub issue with logs

## 📄 License

MIT - See LICENSE file
