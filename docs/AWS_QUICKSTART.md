# LXON Quick Start - AWS Deployment

## 5-Minute Setup

```bash
# 1. Configure AWS
export AWS_REGION=us-east-1
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
aws configure

# 2. Build Docker images
bash scripts/build-docker.sh

# 3. Deploy to AWS
cd aws/terraform
terraform init
terraform plan -var-file="environments/prod.tfvars"
terraform apply

# 4. Get outputs
ALB_DNS=$(terraform output -raw alb_dns_name)
echo "Your services are running at: http://$ALB_DNS"
```

## What Gets Deployed

✅ **VPC with 2 Availability Zones**
- Public subnets for ALB
- Private subnets for ECS, RDS, Redis
- NAT gateways for egress

✅ **ECS Fargate Cluster**
- `lxon-node`: Blockchain RPC endpoints (8545-8546)
- `lxon-backend`: NestJS API (4000)
- `lxon-explorer`: Block explorer UI (3000)

✅ **Data Layer**
- RDS PostgreSQL (db.t3.small, 50GB)
- ElastiCache Redis (cache.t3.micro)

✅ **Load Balancing**
- Application Load Balancer
- Auto-scaling for backend

✅ **Monitoring**
- CloudWatch Logs
- CloudWatch Alarms
- SNS notifications

## Access Services

- **Block Explorer**: `http://$ALB_DNS`
- **API**: `http://$ALB_DNS/api/v1`
- **RPC Node**: `http://$ALB_DNS:8545`

## Next Steps

1. **Set up DNS** (Route 53)
2. **Add SSL certificate** (AWS Certificate Manager)
3. **Configure validator** (set VALIDATOR_ADDRESS, VALIDATOR_KEY)
4. **Set up CI/CD** (GitHub Actions)
5. **Enable monitoring** (CloudWatch dashboards)

See [AWS_DEPLOYMENT.md](AWS_DEPLOYMENT.md) for full guide.
