# LXON AWS Deployment Guide

Complete guide for deploying LXON to AWS using ECS, RDS, ElastiCache, and Terraform.

## Architecture Overview

```
                           ┌─────────────────────┐
                           │   Route 53 DNS      │
                           └──────────┬──────────┘
                                      │
                           ┌──────────▼──────────┐
                           │  CloudFront (CDN)   │
                           └──────────┬──────────┘
                                      │
                ┌─────────────────────▼─────────────────────┐
                │  Application Load Balancer (ALB)          │
                │  - Port 80 (redirect to 443)              │
                │  - Port 443 (HTTPS)                       │
                └─────────────────────┬─────────────────────┘
                        │              │              │
        ┌───────────────┼──────────────┼──────────────┬──────────────┐
        │               │              │              │              │
    ┌───▼──────┐   ┌────▼────┐   ┌────▼──────┐  ┌────▼─────┐    ┌───▼──────┐
    │ ECS Task │   │ECS Task │   │ ECS Task  │  │ECS Task  │    │ECS Task  │
    │lxon-node │   │backend1 │   │backend2   │  │explorer1 │    │explorer2 │
    └──────────┘   └─────────┘   └───────────┘  └──────────┘    └──────────┘
        │
    ┌───▼──────────────────────────────┐
    │  AWS Secrets Manager / SSM        │
    │  - Database credentials          │
    │  - Validator keys                │
    │  - API keys                      │
    └────────────────────────────────┘

    ┌──────────────────────────────────────────────────────────────────┐
    │  Private Subnets (Data Layer)                                    │
    │  ┌────────────────────┐      ┌─────────────────────────────┐   │
    │  │ RDS PostgreSQL     │      │ ElastiCache Redis           │   │
    │  │ - Master (primary) │      │ - Cluster (failover)        │   │
    │  │ - Read replicas    │      │ - Automatic backup          │   │
    │  │ - Multi-AZ         │      │ - 7-day retention           │   │
    │  │ - 50GB storage     │      │ - cache.t3.micro            │   │
    │  └────────────────────┘      └─────────────────────────────┘   │
    └──────────────────────────────────────────────────────────────────┘

    ┌──────────────────────────────────────────────────────────────────┐
    │  Monitoring & Logging                                            │
    │  ┌────────────────┐  ┌─────────────────┐  ┌──────────────────┐  │
    │  │CloudWatch Logs │  │CloudWatch Alarms│  │AWS X-Ray Tracing│  │
    │  └────────────────┘  └─────────────────┘  └──────────────────┘  │
    └──────────────────────────────────────────────────────────────────┘
```

## Prerequisites

### AWS Account Setup
- AWS Account with appropriate IAM permissions
- IAM user with programmatic access (access key + secret key)
- Minimum permissions: EC2, ECS, RDS, ElastiCache, VPC, IAM, CloudWatch, ECR

### Local Machine Setup
```bash
# Install AWS CLI v2
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Install Terraform v1.5+
brew install terraform  # macOS
# or download from https://www.terraform.io/downloads

# Install Docker
brew install docker  # macOS
# or download from https://www.docker.com/products/docker-desktop

# Install jq (for JSON parsing)
brew install jq
```

### Configure AWS Credentials
```bash
aws configure
# Enter:
# AWS Access Key ID: [your-access-key]
# AWS Secret Access Key: [your-secret-key]
# Default region name: us-east-1
# Default output format: json
```

## Step 1: Prepare Your Environment Variables

Create `.env.production` in the project root:

```bash
# AWS Configuration
export AWS_REGION=us-east-1
export AWS_PROFILE=default
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# Environment
export ENVIRONMENT=prod
export PROJECT_NAME=lxon

# Database
export DB_PASSWORD=$(openssl rand -base64 32)
export DB_USERNAME=lxon

# Blockchain
export CHAIN_ID=1
export GENESIS_TIME=$(date +%s)
export VALIDATOR_ADDRESS=0x... # Your validator address
export VALIDATOR_KEY=0x... # Your validator private key (encrypted recommended)

# ECR
export ECR_REGISTRY=$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com
```

## Step 2: Build Docker Images

Build production-optimized images locally:

```bash
# Build all images
bash scripts/build-docker.sh

# Verify images
docker images | grep lxon
```

### Image Details

| Image | Size | Base | Purpose |
|-------|------|------|---------|
| lxon-node | ~450MB | node:22-alpine | Blockchain node with RPC endpoints |
| lxon-backend | ~280MB | node:22-alpine | NestJS REST API + WebSocket |
| lxon-explorer | ~220MB | node:22-alpine | Next.js block explorer UI |

## Step 3: Deploy Infrastructure with Terraform

### Initialize Terraform

```bash
cd aws/terraform

# Initialize Terraform (creates S3 backend, DynamoDB table)
terraform init \
  -backend-config="bucket=lxon-terraform-state-us-east-1" \
  -backend-config="region=us-east-1"
```

### Create Terraform Variables File

Create `aws/terraform/terraform.tfvars`:

```hcl
aws_region     = "us-east-1"
project_name   = "lxon"
environment    = "prod"

# VPC
vpc_cidr               = "10.0.0.0/16"
availability_zones     = ["us-east-1a", "us-east-1b"]
public_subnet_cidrs    = ["10.0.1.0/24", "10.0.2.0/24"]
private_subnet_cidrs   = ["10.0.10.0/24", "10.0.11.0/24"]

# Database
db_instance_class  = "db.t3.small"
allocated_storage  = 50
backup_retention   = 7

# Cache
cache_node_type    = "cache.t3.micro"
num_cache_nodes    = 1

# Blockchain
chain_id           = 1
genesis_time       = 1704067200
```

### Deploy Infrastructure

```bash
# Plan deployment
terraform plan -out=tfplan

# Review the plan output, then apply
terraform apply tfplan

# Get outputs
terraform output
```

Expected outputs:
```
alb_dns_name        = "lxon-alb-123456789.us-east-1.elb.amazonaws.com"
ecr_repositories    = {
  "lxon_backend"  = "123456789.dkr.ecr.us-east-1.amazonaws.com/lxon-backend"
  "lxon_explorer" = "123456789.dkr.ecr.us-east-1.amazonaws.com/lxon-explorer"
  "lxon_node"     = "123456789.dkr.ecr.us-east-1.amazonaws.com/lxon-node"
}
rds_endpoint        = "lxon-db.123456789.us-east-1.rds.amazonaws.com:5432"
redis_endpoint      = "lxon-redis.123456789.cache.amazonaws.com"
```

## Step 4: Push Docker Images to ECR

```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin $ECR_REGISTRY

# Tag images
docker tag lxon-node:latest $ECR_REGISTRY/lxon-node:latest
docker tag lxon-backend:latest $ECR_REGISTRY/lxon-backend:latest
docker tag lxon-explorer:latest $ECR_REGISTRY/lxon-explorer:latest

# Push images
docker push $ECR_REGISTRY/lxon-node:latest
docker push $ECR_REGISTRY/lxon-backend:latest
docker push $ECR_REGISTRY/lxon-explorer:latest

# Verify images
aws ecr describe-images --repository-name lxon-node --region us-east-1
```

## Step 5: Configure Secrets Manager

Store sensitive data in AWS Secrets Manager:

```bash
# Database password
aws secretsmanager create-secret \
  --name lxon/db/password \
  --secret-string $(openssl rand -base64 32)

# Validator key
aws secretsmanager create-secret \
  --name lxon/blockchain/validator-key \
  --secret-string '{"address":"0x...","key":"0x..."}'

# API keys
aws secretsmanager create-secret \
  --name lxon/api/keys \
  --secret-string '{"jwt_secret":"...","api_key":"..."}'
```

## Step 6: Update ECS Task Definitions (Optional)

Update task definitions to use secrets from AWS Secrets Manager:

```bash
# Get current task definition
aws ecs describe-task-definition \
  --task-definition lxon-node:1 \
  --region us-east-1 > /tmp/task-def.json

# Edit task definition to reference secrets
# Then register new version
aws ecs register-task-definition --cli-input-json file:///tmp/task-def.json
```

## Step 7: Set Up CI/CD with GitHub Actions

1. Add AWS credentials as GitHub repository secrets:
   - `AWS_ROLE_TO_ASSUME`: IAM role ARN for GitHub Actions
   - `AWS_ACCOUNT_ID`: Your AWS account ID

2. Push code to main branch to trigger deployment:
   ```bash
   git add .
   git commit -m "Deploy LXON to AWS"
   git push origin main
   ```

3. Monitor deployment in GitHub Actions tab

## Step 8: Domain Setup

### Route 53 Configuration

1. Purchase domain or create hosted zone in Route 53
2. Create A record pointing to ALB:
   ```
   Name: lxon.example.com
   Type: A
   Alias: Yes
   Alias Target: [ALB DNS Name]
   ```

### SSL/TLS Certificate (AWS Certificate Manager)

```bash
# Request certificate
aws acm request-certificate \
  --domain-name lxon.example.com \
  --subject-alternative-names "*.lxon.example.com" \
  --validation-method DNS \
  --region us-east-1
```

## Monitoring & Maintenance

### CloudWatch Dashboards

View real-time metrics:
```bash
aws cloudwatch list-dashboards --region us-east-1
```

### View Logs

```bash
# Backend logs
aws logs tail /ecs/lxon-prod --follow

# Node logs
aws logs tail /ecs/lxon-prod --follow --log-stream-name-prefix lxon-node

# Explorer logs
aws logs tail /ecs/lxon-prod --follow --log-stream-name-prefix lxon-explorer
```

### Check Service Health

```bash
# List services
aws ecs list-services --cluster lxon-prod --region us-east-1

# Describe service
aws ecs describe-services \
  --cluster lxon-prod \
  --services lxon-backend \
  --region us-east-1

# Get task logs
aws ecs list-tasks --cluster lxon-prod --region us-east-1
```

### Scale Services

```bash
# Scale backend to 3 tasks
aws ecs update-service \
  --cluster lxon-prod \
  --service lxon-backend \
  --desired-count 3 \
  --region us-east-1
```

## Cost Estimation (Monthly)

| Service | Instance | Quantity | Cost/Month |
|---------|----------|----------|-----------|
| ECS Fargate (vCPU) | 2.5 vCPU | 3 services | ~$150 |
| ECS Fargate (Memory) | 6.5 GB | 3 services | ~$80 |
| RDS PostgreSQL | db.t3.small | 1 | ~$30 |
| ElastiCache Redis | cache.t3.micro | 1 | ~$20 |
| ALB | Hours + LCU | 1 | ~$25 |
| Data Transfer | GB out | 100GB | ~$10 |
| CloudWatch | Logs + Alarms | - | ~$10 |
| **Total** | | | **~$325/month** |

## Troubleshooting

### Services not starting

```bash
# Check task status
aws ecs describe-tasks \
  --cluster lxon-prod \
  --tasks [task-arn] \
  --region us-east-1

# View logs
aws logs get-log-events \
  --log-group-name /ecs/lxon-prod \
  --log-stream-name lxon-node/... \
  --region us-east-1
```

### Database connection issues

```bash
# Test RDS connectivity
aws rds describe-db-instances \
  --db-instance-identifier lxon-db \
  --region us-east-1

# Check security groups
aws ec2 describe-security-groups \
  --filters Name=group-name,Values=lxon-rds-sg \
  --region us-east-1
```

### High CPU/Memory usage

- Scale up ECS task resources
- Check CloudWatch Container Insights metrics
- Review application logs for leaks

## Cleanup

To destroy all infrastructure:

```bash
cd aws/terraform

# Destroy infrastructure
terraform destroy \
  -var-file="environments/prod.tfvars"

# Remove Terraform state
aws s3 rm s3://lxon-terraform-state-us-east-1 --recursive
aws dynamodb delete-table --table-name lxon-terraform-locks
```

## Additional Resources

- [AWS ECS Documentation](https://docs.aws.amazon.com/ecs/)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [LXON Documentation](../README.md)
