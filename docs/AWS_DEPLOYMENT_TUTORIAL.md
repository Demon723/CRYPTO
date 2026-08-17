# LXON Blockchain Node — AWS Deployment Tutorial

Deploy a production-ready LXON blockchain node on AWS using EC2 or ECS Fargate.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Architecture](#architecture)
3. [Option A: EC2 Deployment (Fastest)](#option-a-ec2-deployment-fastest)
4. [Option B: ECS Fargate + ALB (Production)](#option-b-ecs-fargate--alb-production)
5. [Verify the Node](#verify-the-node)
6. [Monitoring & Logs](#monitoring--logs)
7. [Persistent Storage](#persistent-storage)
8. [Security Hardening](#security-hardening)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

| Tool | Minimum Version | Purpose |
|-----|-----------------|---------|
| AWS CLI | 2.x | Infrastructure deployment |
| Terraform | 1.0+ | Infrastructure as code |
| Docker | 24+ | Container build |
| Node.js | 22.x | Local build/test |
| pnpm | 8+ | Package management |
| Git | 2.40+ | Source control |

Configure AWS credentials:

```bash
aws configure
```

---

## Architecture

```
Internet
    |
    | 8545 (JSON-RPC)
    |
[ ALB / Security Group ]
    |
    +---> [ EC2 Instance ] -----> EBS Volume (/data)
    |         |                      |
    |         |                      +---> LXON Blockchain State
    |         |
    |         +---> apps/lxon-blockchain/dist/node.js
    |         +---> CMD: node dist/node.js
    |
    OR
    |
[ ECS Fargate Task ]
    |
    +---> Docker Image: lxon-node:latest
    +---> Port 8545 mapped
    +---> CloudWatch Logs
```

---

## Option A: EC2 Deployment (Fastest)

Best for: single node, SSH debugging, low cost.

### 1. Launch EC2 Instance

**AWS Console → EC2 → Launch Instance**

| Setting | Value |
|---------|-------|
| AMI | Ubuntu Server 22.04 LTS / Amazon Linux 2023 |
| Instance type | `t3.medium` (2 vCPU, 4 GB RAM) |
| Storage | 20 GB gp3 |
| Security group | Allow TCP **8545** and **22** from your IP |
| Key pair | Download `.pem` |

### 2. SSH and Install Dependencies

```bash
ssh -i /path/to/key.pem ubuntu@<PUBLIC_IP>
```

```bash
# Update
sudo apt update && sudo apt upgrade -y

# Install Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs git build-essential

# Verify
node --version  # v22.x
npm --version
```

### 3. Clone and Build

```bash
cd /opt
sudo git clone <YOUR_REPO_URL> lxon
cd lxon/LXON

# Install pnpm
sudo corepack enable
pnpm --version

# Install dependencies
pnpm install

# Build blockchain package
pnpm --filter lxon-blockchain build
```

### 4. Create systemd Service

```bash
sudo tee /etc/systemd/system/lxon-node.service << 'EOF'
[Unit]
Description=LXON Blockchain Node
After=network.target

[Service]
Type=simple
WorkingDirectory=/opt/lxon/LXON
ExecStart=/usr/bin/node apps/lxon-blockchain/dist/node.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=8545
Environment=CHAIN_ID=723
Environment=DATA_DIR=/data/lxon

[Install]
WantedBy=multi-user.target
EOF
```

### 5. Create Data Directory

```bash
sudo mkdir -p /data/lxon
sudo chown -R ubuntu:ubuntu /data/lxon
```

### 6. Start the Node

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now lxon-node
sudo systemctl status lxon-node
```

### 7. Verify Locally on EC2

```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"lxon_chainId","params":[],"id":1}'
```

Expected response:
```json
{"jsonrpc":"2.0","id":1,"result":"0x2d3"}
```

### 8. Verify from Your Local Machine

```bash
curl -X POST http://<EC2_PUBLIC_IP>:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"lxon_blockNumber","params":[],"id":1}'
```

---

## Option B: ECS Fargate + ALB (Production)

Best for: production, auto-scaling, managed infrastructure.

### 1. Create ECR Repository

```bash
aws ecr create-repository --repository-name lxon-node --region us-east-1
```

### 2. Build and Push Docker Image

Since you may not have Docker locally, use AWS CloudShell:

```bash
# In AWS CloudShell
git clone <YOUR_REPO_URL> lxon
cd lxon/LXON

# Install pnpm
curl -fsSL https://get.pnpm.io/install.sh | sh -
source ~/.bashrc

# Build image
docker build -t lxon-node:latest -f deploy/aws/Dockerfile.node .

# Login to ECR
aws ecr get-login-password | docker login --username AWS --password-stdin \
  $(aws sts get-caller-identity --query Account --output text).dkr.ecr.us-east-1.amazonaws.com

# Tag and push
ECR_URI=$(aws sts get-caller-identity --query Account --output text).dkr.ecr.us-east-1.amazonaws.com/lxon-node
docker tag lxon-node:latest $ECR_URI:latest
docker push $ECR_URI:latest
```

### 3. Deploy with Terraform

```bash
cd deploy/aws/terraform

cat > terraform.tfvars << 'EOF'
aws_region = "us-east-1"
project_name = "lxon-node"
EOF

terraform init -upgrade
terraform plan -out=tfplan
terraform apply tfplan
```

### 4. Get the RPC Endpoint

```bash
terraform output -raw rpc_url
```

Example output:
```
http://lxon-node-service.us-east-1.amazonaws.com:8545
```

### 5. Verify

```bash
RPC_URL=$(terraform output -raw rpc_url)

curl -X POST "$RPC_URL" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"lxon_chainId","params":[],"id":1}'
```

---

## Verify the Node

### Health Check

```bash
# Health endpoint
curl http://<HOST>:8545/health
```

Expected:
```json
{
  "status": "HEALTHY",
  "nodeId": "lxon-node-aws-1",
  "chainId": 723,
  "blockNumber": "0x0",
  "timestamp": "2026-08-17T02:33:45.123Z"
}
```

### JSON-RPC Methods

| Method | Description |
|--------|-------------|
| `lxon_chainId` | Returns chain ID in hex |
| `lxon_blockNumber` | Returns current block height |
| `lxon_getMetrics` | Returns total supply, circulating supply, stake ratio |
| `lxon_getPrices` | Returns oracle price feed |
| `lxon_sendTransaction` | Queues a transaction |

Example:

```bash
curl -X POST http://<HOST>:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc":"2.0",
    "method":"lxon_getMetrics",
    "params":[],
    "id":1
  }'
```

---

## Monitoring & Logs

### EC2 Logs

```bash
# Journal logs
sudo journalctl -u lixon-node -f

# Systemd status
sudo systemctl status lixon-node
```

### ECS Logs

```bash
# CloudWatch log group
aws logs tail /ecs/lxon-node --follow --region us-east-1
```

### Metrics Endpoint

```bash
curl http://<HOST>:8545/metrics
```

---

## Persistent Storage

### EC2

```bash
# Stop node
sudo systemctl stop lixon-node

# Create persistent volume
sudo mkdir -p /data/lxon
sudo chown -R ubuntu:ubuntu /data/lxon

# Update service
sudo systemctl edit lixon-node
# Add: Environment=DATA_DIR=/data/lxon

sudo systemctl start lixon-node
```

### ECS

Attach an EFS volume to the ECS task and mount at `/data`. Update the task definition:

```json
"volumes": [
  {
    "name": "lxon-data",
    "efsVolumeConfiguration": {
      "fileSystemId": "fs-xxxxx",
      "rootDirectory": "/"
    }
  }
],
"mountPoints": [
  {
    "sourceVolume": "lxon-data",
    "containerPath": "/data"
  }
]
```

---

## Security Hardening

| Item | Recommendation |
|------|----------------|
| RPC port | Restrict SG to your IP or VPN. Do not expose 8545 to 0.0.0.0/0 in production. |
| SSH | Disable password auth, use key pairs only. |
| OS updates | Enable unattended upgrades. |
| Node update | Keep Node.js 22.x patched. |
| Monitoring | CloudWatch alarms on CPU, memory, and `/health` failures. |

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `EADDRINUSE` | Another process on port 8545. Stop it or change PORT env. |
| Build fails | Run `pnpm install` at repo root, then `pnpm --filter lxon-blockchain build`. |
| `/health` 404 | Ensure you are running `apps/lxon-blockchain/src/node.ts`, not the old `rpc/server.ts`. |
| Terraform apply fails | Ensure AWS credentials are set: `aws sts get-caller-identity`. |
| ECS task stops | Check CloudWatch logs for startup errors. Ensure `DATA_DIR` exists or is writable. |

---

## Quick Reference

```bash
# Local test
pnpm --filter lxon-blockchain build
node apps/lxon-blockchain/dist/node.js

# Health
curl http://localhost:8545/health

# RPC
curl -X POST http://localhost:8545 -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"lxon_blockNumber","params":[],"id":1}'
```
