# LXON Sovereign Blockchain Deployment Guide - Google Cloud

## 🚀 Overview

This guide will help you deploy the LXON blockchain as a sovereign network using Google Cloud Platform (GCP).

## 📋 Prerequisites

- Google Cloud account with billing enabled
- Domain name (optional but recommended)
- Basic knowledge of Docker and networking
- At least $50-100/month budget for infrastructure

## 🏗️ Architecture

### Network Components
1. **Validator Nodes** (3-5 nodes for consensus)
2. **RPC Nodes** (2-3 nodes for public access)
3. **Archive Nodes** (1-2 nodes for historical data)
4. **Monitoring** (Prometheus + Grafana)
5. **Load Balancer** (Google Cloud Load Balancer)

### Server Requirements
- **Validator Nodes**: n2-standard-4 (4 vCPU, 16GB RAM)
- **RPC Nodes**: n2-standard-2 (2 vCPU, 8GB RAM)
- **Archive Nodes**: n2-standard-8 (8 vCPU, 32GB RAM)

## 📝 Step 1: Set Up Google Cloud Project

### 1.1 Create Project
```bash
# Create new GCP project
gcloud projects create lxon-blockchain

# Set as default project
gcloud config set project lxon-blockchain

# Enable required APIs
gcloud services enable compute.googleapis.com
gcloud services enable container.googleapis.com
gcloud services enable cloudresourcemanager.googleapis.com
gcloud services enable iam.googleapis.com
```

### 1.2 Configure Network
```bash
# Create VPC network
gcloud compute networks create lxon-network \
  --subnet-mode=custom

# Create subnet
gcloud compute networks subnets create lxon-subnet \
  --network=lxon-network \
  --region=us-central1 \
  --range=10.0.0.0/24

# Create firewall rules
gcloud compute firewall-rules create lxon-allow-p2p \
  --network=lxon-network \
  --allow=tcp:30303,udp:30303 \
  --source-ranges=0.0.0.0/0

gcloud compute firewall-rules create lxon-allow-rpc \
  --network=lxon-network \
  --allow=tcp:8545,8546 \
  --source-ranges=0.0.0.0/0

gcloud compute firewall-rules create lxon-allow-ssh \
  --network=lxon-network \
  --allow=tcp:22 \
  --source-ranges=0.0.0.0/0
```

## 📝 Step 2: Deploy Validator Nodes

### 2.1 Create Validator Instance Template
```bash
# Create instance template
gcloud compute instance-templates create lxon-validator-template \
  --machine-type=n2-standard-4 \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud \
  --boot-disk-size=100GB \
  --boot-disk-type=pd-ssd \
  --network=lxon-network \
  --subnet=lxon-subnet \
  --tags=lxon-validator \
  --metadata-from-file=startup-script=./scripts/validator-setup.sh
```

### 2.2 Create Validator Startup Script
```bash
# Create scripts/validator-setup.sh
cat > scripts/validator-setup.sh << 'EOF'
#!/bin/bash

# Update system
apt-get update && apt-get upgrade -y

# Install dependencies
apt-get install -y docker.io docker-compose git curl wget

# Start Docker
systemctl start docker
systemctl enable docker

# Create LXON directory
mkdir -p /lxon
cd /lxon

# Clone LXON repository (replace with your repo)
git clone https://github.com/Demon723/CRYPTO.git
cd CRYPTO

# Build LXON blockchain node
cd apps/lxon-blockchain
npm install
npm run build

# Create systemd service
cat > /etc/systemd/system/lxon-validator.service << 'SERVICE'
[Unit]
Description=LXON Validator Node
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/lxon/CRYPTO/apps/lxon-blockchain
ExecStart=/usr/bin/node dist/index.js --validator
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
SERVICE

# Enable and start service
systemctl enable lxon-validator
systemctl start lxon-validator

echo "LXON Validator Node deployed successfully"
EOF
```

### 2.3 Deploy Validator Nodes
```bash
# Create instance group
gcloud compute instance-groups managed create lxon-validators \
  --base-instance-name=lxon-validator \
  --template=lxon-validator-template \
  --size=3 \
  --region=us-central1

# Wait for instances to be ready
gcloud compute instance-groups managed wait-until-stable lxon-validators \
  --region=us-central1
```

## 📝 Step 3: Deploy RPC Nodes

### 3.1 Create RPC Instance Template
```bash
gcloud compute instance-templates create lxon-rpc-template \
  --machine-type=n2-standard-2 \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud \
  --boot-disk-size=200GB \
  --boot-disk-type=pd-ssd \
  --network=lxon-network \
  --subnet=lxon-subnet \
  --tags=lxon-rpc \
  --metadata-from-file=startup-script=./scripts/rpc-setup.sh
```

### 3.2 Create RPC Startup Script
```bash
cat > scripts/rpc-setup.sh << 'EOF'
#!/bin/bash

# Update system
apt-get update && apt-get upgrade -y

# Install dependencies
apt-get install -y docker.io docker-compose git curl wget nginx

# Start Docker
systemctl start docker
systemctl enable docker

# Create LXON directory
mkdir -p /lxon
cd /lxon

# Clone LXON repository
git clone https://github.com/Demon723/CRYPTO.git
cd CRYPTO

# Build LXON blockchain node
cd apps/lxon-blockchain
npm install
npm run build

# Create systemd service
cat > /etc/systemd/system/lxon-rpc.service << 'SERVICE'
[Unit]
Description=LXON RPC Node
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/lxon/CRYPTO/apps/lxon-blockchain
ExecStart=/usr/bin/node dist/index.js --rpc --rpc-port=8545
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
SERVICE

# Enable and start service
systemctl enable lxon-rpc
systemctl start lxon-rpc

# Configure Nginx reverse proxy
cat > /etc/nginx/sites-available/lxon-rpc << 'NGINX'
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:8545;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINX

# Enable Nginx site
ln -s /etc/nginx/sites-available/lxon-rpc /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx

echo "LXON RPC Node deployed successfully"
EOF
```

### 3.3 Deploy RPC Nodes
```bash
# Create instance group
gcloud compute instance-groups managed create lxon-rpcs \
  --base-instance-name=lxon-rpc \
  --template=lxon-rpc-template \
  --size=2 \
  --region=us-central1

# Wait for instances to be ready
gcloud compute instance-groups managed wait-until-stable lxon-rpcs \
  --region=us-central1
```

## 📝 Step 4: Set Up Load Balancer

### 4.1 Create Load Balancer
```bash
# Create health check
gcloud compute health-checks create http lxon-rpc-health \
  --port=8545 \
  --request-path=/health

# Create backend service
gcloud compute backend-services create lxon-rpc-backend \
  --health-checks=lxon-rpc-health \
  --global

# Add instance group to backend
gcloud compute backend-services add-backend lxon-rpc-backend \
  --instance-group=lxon-rpcs \
  --instance-group-region=us-central1 \
  --global

# Create URL map
gcloud compute url-maps create lxon-rpc-lb \
  --default-service=lxon-rpc-backend

# Create forwarding rule
gcloud compute forwarding-rules create lxon-rpc-forwarding \
  --global \
  --ports=80 \
  --url-map=lxon-rpc-lb
```

### 4.2 Get Load Balancer IP
```bash
# Get external IP
gcloud compute forwarding-rules describe lxon-rpc-forwarding \
  --global \
  --format="value(IPAddress)"
```

## 📝 Step 5: Deploy Smart Contracts

### 5.1 Update Hardhat Config
```typescript
// Update hardhat.config.ts
const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.26',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      },
      evmVersion: 'cancun'
    }
  },
  networks: {
    lxonMainnet: {
      url: 'https://YOUR_LOAD_BALANCER_IP', // Replace with your LB IP
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 723 // Your custom chain ID
    }
  },
  // ... rest of config
};
```

### 5.2 Deploy Contracts
```bash
# Set environment variables
export PRIVATE_KEY="your_private_key"

# Deploy to your sovereign chain
npx hardhat run scripts/deploy-minimal.ts --network lxonMainnet
```

## 📝 Step 6: Set Up Block Explorer

### 6.1 Deploy Block Explorer
```bash
# Create block explorer instance
gcloud compute instances create lxon-explorer \
  --machine-type=n2-standard-2 \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud \
  --boot-disk-size=50GB \
  --network=lxon-network \
  --subnet=lxon-subnet \
  --tags=lxon-explorer

# SSH into instance
gcloud compute ssh lxon-explorer

# Install block explorer (using Blockscout)
git clone https://github.com/blockscout/blockscout
cd blockscout
docker-compose up -d
```

### 6.2 Configure Explorer
```bash
# Update configuration
cd explorer/config
cp config.toml.example config.toml

# Edit config.toml with your RPC endpoint
# Set database credentials
# Configure explorer settings
```

## 📝 Step 7: Add Liquidity

### 7.1 Deploy Liquidity Contract
```typescript
// Create scripts/add-liquidity.ts
import { ethers } from 'hardhat';

async function main() {
  const [deployer] = await ethers.getSigners();
  
  const lxonToken = await ethers.getContractAt('LXONNativeToken', TOKEN_ADDRESS);
  const lxonDEX = await ethers.getContractAt('LXONNativeDEX', DEX_ADDRESS);
  
  // Mint tokens for liquidity
  const liquidityAmount = ethers.parseEther('1000000'); // 1M XON
  await lxonToken.mint(deployer.address, liquidityAmount);
  
  // Approve DEX
  await lxonToken.approve(DEX_ADDRESS, liquidityAmount);
  
  // Add liquidity
  await lxonDEX.addLiquidity(liquidityAmount);
  
  console.log('Liquidity added successfully');
}

main();
```

### 7.2 Execute Liquidity Addition
```bash
npx hardhat run scripts/add-liquidity.ts --network lxonMainnet
```

## 📝 Step 8: Set Up Public RPC Access

### 8.1 Configure Domain (Optional)
```bash
# If you have a domain, configure DNS
# Add A record pointing to load balancer IP
# rpc.lxon.network -> YOUR_LOAD_BALANCER_IP
```

### 8.2 Test RPC Access
```bash
# Test RPC endpoint
curl -X POST \
  https://YOUR_LOAD_BALANCER_IP \
  -H 'Content-Type: application/json' \
  -d '{
    "jsonrpc":"2.0",
    "method":"eth_blockNumber",
    "params":[],
    "id":1
  }'
```

## 📝 Step 9: Set Up Monitoring

### 9.1 Deploy Monitoring Stack
```bash
# Create monitoring instance
gcloud compute instances create lxon-monitoring \
  --machine-type=n2-standard-2 \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud \
  --boot-disk-size=100GB \
  --network=lxon-network \
  --subnet=lxon-subnet

# SSH into instance
gcloud compute ssh lxon-monitoring

# Install Prometheus and Grafana
docker run -d \
  --name prometheus \
  -p 9090:9090 \
  -v /prometheus-data:/prometheus \
  prom/prometheus

docker run -d \
  --name grafana \
  -p 3000:3000 \
  -v /grafana-data:/var/lib/grafana \
  grafana/grafana
```

## 📝 Step 10: Apply for Exchange Listings

### 10.1 Prepare Listing Application
```typescript
// Create listing information
const listingInfo = {
  projectName: "LXON",
  tokenSymbol: "XON",
  tokenAddress: "YOUR_TOKEN_ADDRESS",
  chainId: 723,
  rpcUrl: "https://rpc.lxon.network",
  explorerUrl: "https://explorer.lxon.network",
  totalSupply: "1000000000000000000000000000", // 1 billion
  circulatingSupply: "100000000000000000000000000", // 100 million
  website: "https://lxon.network",
  whitepaper: "https://lxon.network/whitepaper.pdf",
  socialLinks: {
    twitter: "https://twitter.com/lxon_network",
    discord: "https://discord.gg/lxon",
    telegram: "https://t.me/lxon_network"
  },
  team: [
    {
      name: "Founder Name",
      role: "CEO",
      linkedin: "https://linkedin.com/in/..."
    }
  ],
  auditReports: [
    "https://lxon.network/audit-report.pdf"
  ]
};
```

### 10.2 Apply to Exchanges
```bash
# Tier 3 Exchanges (easiest)
- MEXC: https://www.mexc.com/cex/assets/listing/apply
- Bitrue: https://www.bitrue.com/asset/applylisting
- CoinEx: https://www.coinex.com/coin/listing

# Tier 2 Exchanges (medium difficulty)
- KuCoin: https://www.kucoin.com/listing-application
- Gate.io: https://www.gate.io/listing-application
- Bybit: https://bybit.com/listing-application

# Tier 1 Exchanges (hardest)
- Binance: https://www.binance.com/en/listing-application
- Coinbase: https://www.coinbase.com/asset-hub/add
- Kraken: https://support.kraken.com/hc/en-us/requests/new
```

## 📊 Cost Summary

### Monthly Costs
- Validator Nodes (3x n2-standard-4): ~$300/month
- RPC Nodes (2x n2-standard-2): ~$100/month
- Archive Node (1x n2-standard-8): ~$200/month
- Load Balancer: ~$50/month
- Block Explorer: ~$100/month
- Monitoring: ~$50/month
- Storage: ~$50/month

**Total: ~$850/month**

### Initial Setup Costs
- Security Audits: $50,000 - $200,000
- Initial Liquidity: $10,000 - $100,000
- Exchange Listing Fees: $10,000 - $500,000
- Legal Compliance: $20,000 - $100,000
- Marketing: $50,000 - $500,000

**Total Initial: $140,000 - $1,400,000**

## 🎯 Next Steps

1. **Set up Google Cloud account** and create project
2. **Deploy validator nodes** using the scripts above
3. **Deploy RPC nodes** with load balancer
4. **Deploy smart contracts** to your sovereign chain
5. **Add initial liquidity** to the DEX
6. **Set up block explorer** for transparency
7. **Configure public RPC access**
8. **Apply for exchange listings**
9. **Build community** and awareness
10. **Monitor and scale** as needed

## 📞 Support

For help with deployment:
- Google Cloud Documentation: https://cloud.google.com/docs
- LXON Documentation: https://github.com/Demon723/CRYPTO
- Discord Community: https://discord.gg/lxon
