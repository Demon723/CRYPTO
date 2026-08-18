# Google Cloud Deployment Tutorial with Git Pull

This tutorial guides you through deploying the LXON blockchain project to Google Cloud Platform (GCP) using git pull for continuous deployment.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Google Cloud Setup](#google-cloud-setup)
3. [VM Instance Creation](#vm-instance-creation)
4. [Environment Configuration](#environment-configuration)
5. [Git Pull Deployment Setup](#git-pull-deployment-setup)
6. [Automated Deployment](#automated-deployment)
7. [Security Best Practices](#security-best-practices)
8. [Monitoring and Maintenance](#monitoring-and-maintenance)

---

## Prerequisites

### Required Accounts and Tools

- **Google Cloud Account** with billing enabled
- **GitHub Account** with repository access
- **SSH Key** for VM access
- **Domain Name** (optional, for custom domain)

### Local Machine Requirements

```bash
# Install Google Cloud SDK
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
gcloud init

# Install required tools
npm install -g pm2
npm install -g hardhat
```

---

## Google Cloud Setup

### 1. Create Google Cloud Project

```bash
# Create new project
gcloud projects create lxon-blockchain --name="LXON Blockchain"

# Set as active project
gcloud config set project lxon-blockchain

# Enable required APIs
gcloud services enable compute.googleapis.com
gcloud services enable cloudresourcemanager.googleapis.com
gcloud services enable iam.googleapis.com
```

### 2. Create Service Account

```bash
# Create service account
gcloud iam service-accounts create lxon-deployer \
  --display-name="LXON Deployer" \
  --description="Service account for LXON deployment"

# Grant Compute Admin role
gcloud projects add-iam-policy-binding lxon-blockchain \
  --member="serviceAccount:lxon-deployer@lxon-blockchain.iam.gserviceaccount.com" \
  --role="roles/compute.admin"

# Create and download service account key
gcloud iam service-accounts keys create lxon-deployer-key.json \
  --iam-account=lxon-deployer@lxon-blockchain.iam.gserviceaccount.com
```

---

## VM Instance Creation

### 1. Create VM Instance

```bash
# Create VM with sufficient resources
gcloud compute instances create lxon-node \
  --zone=us-central1-a \
  --machine-type=e2-medium \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud \
  --boot-disk-size=50GB \
  --boot-disk-type=pd-ssd \
  --network-interface=network-tier=PREMIUM \
  --tags=http-server,https-server \
  --metadata-from-file=startup-script=./gcp-startup-script.sh
```

### 2. Configure Firewall Rules

```bash
# Allow HTTP traffic
gcloud compute firewall-rules create allow-http \
  --allow tcp:80 \
  --source-ranges 0.0.0.0/0 \
  --target-tags http-server

# Allow HTTPS traffic
gcloud compute firewall-rules create allow-https \
  --allow tcp:443 \
  --source-ranges 0.0.0.0/0 \
  --target-tags https-server

# Allow SSH traffic
gcloud compute firewall-rules create allow-ssh \
  --allow tcp:22 \
  --source-ranges 0.0.0.0/0 \
  --target-tags ssh-server
```

### 3. Reserve Static IP (Optional)

```bash
# Reserve static IP address
gcloud compute addresses create lxon-static-ip \
  --region=us-central1

# Get the IP address
gcloud compute addresses describe lxon-static-ip --region=us-central1

# Assign to VM
gcloud compute instances add-access-config lxon-node \
  --zone=us-central1-a \
  --address lxon-static-ip \
  --access-config-name external-nat
```

---

## Environment Configuration

### 1. SSH into VM

```bash
# SSH into the VM
gcloud compute ssh lxon-node --zone=us-central1-a

# Or using external IP
ssh user@YOUR_VM_EXTERNAL_IP
```

### 2. Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install Python and build tools
sudo apt install -y python3 python3-pip build-essential git

# Install PM2 for process management
sudo npm install -g pm2

# Install Hardhat
sudo npm install -g hardhat

# Install Nginx for reverse proxy
sudo apt install -y nginx certbot python3-certbot-nginx
```

### 3. Configure Git

```bash
# Configure git user
git config --global user.name "LXON Deployer"
git config --global user.email "deployer@lxon.network"

# Generate SSH key for GitHub
ssh-keygen -t ed25519 -C "lxon-deployer@lxon.network"

# Display public key (add to GitHub)
cat ~/.ssh/id_ed25519.pub

# Test GitHub connection
ssh -T git@github.com
```

### 4. Clone Repository

```bash
# Create deployment directory
mkdir -p /var/www/lxon
cd /var/www/lxon

# Clone repository
git clone git@github.com:Demon723/CRYPTO.git .
```

### 5. Install Project Dependencies

```bash
# Navigate to contracts directory
cd /var/www/lxon/apps/contracts

# Install dependencies
npm install

# Compile contracts
npx hardhat compile
```

---

## Git Pull Deployment Setup

### 1. Create Deployment Script

Create `/var/www/lxon/deploy.sh`:

```bash
#!/bin/bash

# LXON Deployment Script
# This script pulls latest changes and restarts services

set -e

echo "=== Starting LXON Deployment ==="

# Navigate to project directory
cd /var/www/lxon

# Pull latest changes
echo "Pulling latest changes from GitHub..."
git pull origin main

# Navigate to contracts directory
cd apps/contracts

# Install dependencies
echo "Installing dependencies..."
npm install

# Compile contracts
echo "Compiling contracts..."
npx hardhat compile

# Restart services with PM2
echo "Restarting services..."
pm2 restart lxon-node || pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

echo "=== Deployment Complete ==="
```

Make it executable:

```bash
chmod +x /var/www/lxon/deploy.sh
```

### 2. Create PM2 Configuration

Create `/var/www/lxon/apps/contracts/ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: 'lxon-node',
      script: './scripts/run-local-node.js',
      cwd: '/var/www/lxon/apps/contracts',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 8545,
      },
    },
    {
      name: 'lxon-api',
      script: './scripts/run-api-server.js',
      cwd: '/var/www/lxon/apps/contracts',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
};
```

### 3. Create Local Node Script

Create `/var/www/lxon/apps/contracts/scripts/run-local-node.js`:

```javascript
const { spawn } = require('child_process');

console.log('Starting LXON local node...');

const hardhat = spawn('npx', ['hardhat', 'node', '--hostname', '0.0.0.0', '--port', '8545'], {
  cwd: __dirname,
  stdio: 'inherit',
});

hardhat.on('error', (error) => {
  console.error('Failed to start node:', error);
  process.exit(1);
});

hardhat.on('close', (code) => {
  console.log(`Node process exited with code ${code}`);
  process.exit(code);
});
```

---

## Automated Deployment

### Option 1: GitHub Webhook

#### 1. Install Webhook Receiver

```bash
# Install webhook handler
npm install -g webhook

# Create webhook configuration
cat > /var/www/lxon/webhook-config.json << EOF
[
  {
    "id": "lxon-deploy",
    "execute-command": "/var/www/lxon/deploy.sh",
    "command-working-directory": "/var/www/lxon",
    "response-message": "Deployment triggered",
    "trigger-rule": {
      "match": {
        "type": "payload-hash-sha1",
        "secret": "YOUR_WEBHOOK_SECRET",
        "parameter": {
          "source": "header",
          "name": "X-Hub-Signature"
        }
      }
    }
  }
]
EOF

# Start webhook service
pm2 start webhook -- --port 9000 --hooks /var/www/lxon/webhook-config.json
pm2 save
```

#### 2. Configure GitHub Webhook

1. Go to your GitHub repository
2. Navigate to Settings → Webhooks
3. Click "Add webhook"
4. Set Payload URL: `http://YOUR_VM_IP:9000/hooks/lxon-deploy`
5. Set Secret: `YOUR_WEBHOOK_SECRET`
6. Select "Just the push event"
7. Click "Add webhook"

#### 3. Setup Nginx Reverse Proxy

```bash
# Create Nginx configuration
cat > /etc/nginx/sites-available/lxon << EOF
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    location /webhook {
        proxy_pass http://localhost:9000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/lxon /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Option 2: Cron Job (Simple)

```bash
# Add cron job for periodic deployment
crontab -e

# Add this line (runs every 5 minutes)
*/5 * * * * cd /var/www/lxon && git pull origin main && ./deploy.sh >> /var/log/lxon-deploy.log 2>&1
```

### Option 3: Manual Deployment

```bash
# SSH into VM
gcloud compute ssh lxon-node --zone=us-central1-a

# Run deployment script
cd /var/www/lxon
./deploy.sh
```

---

## Security Best Practices

### 1. SSH Key Management

```bash
# Disable password authentication
sudo sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo systemctl restart sshd

# Use SSH keys only
# Add your public SSH key to ~/.ssh/authorized_keys
```

### 2. Firewall Configuration

```bash
# Only allow necessary ports
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw enable
```

### 3. Environment Variables

```bash
# Create .env file
cat > /var/www/lxon/apps/contracts/.env << EOF
PRIVATE_KEY=your_private_key_here
RPC_URL=https://your-rpc-url.com
DATABASE_URL=your_database_url
WEBHOOK_SECRET=your_webhook_secret
EOF

# Set proper permissions
chmod 600 /var/www/lxon/apps/contracts/.env
```

### 4. SSL Certificate

```bash
# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal is configured automatically
sudo certbot renew --dry-run
```

### 5. Regular Updates

```bash
# Create update script
cat > /var/www/lxon/update-system.sh << EOF
#!/bin/bash
sudo apt update && sudo apt upgrade -y
sudo npm update -g
cd /var/www/lxon/apps/contracts
npm update
EOF

chmod +x /var/www/lxon/update-system.sh

# Add to cron (weekly)
crontab -e
# Add: 0 0 * * 0 /var/www/lxon/update-system.sh >> /var/log/system-update.log 2>&1
```

---

## Monitoring and Maintenance

### 1. PM2 Monitoring

```bash
# Monitor processes
pm2 monit

# View logs
pm2 logs lxon-node
pm2 logs lxon-api

# View status
pm2 status
```

### 2. Log Management

```bash
# Create log rotation config
cat > /etc/logrotate.d/lxon << EOF
/var/log/lxon-deploy.log {
    daily
    rotate 7
    compress
    missingok
    notifempty
    create 0640 www-data www-data
}
EOF
```

### 3. Health Check Script

Create `/var/www/lxon/health-check.sh`:

```bash
#!/bin/bash

# Health check for LXON services

echo "=== LXON Health Check ==="

# Check if node is running
if pm2 describe lxon-node > /dev/null 2>&1; then
    echo "✅ LXON Node: Running"
else
    echo "❌ LXON Node: Not Running"
    pm2 restart lxon-node
fi

# Check if API is running
if pm2 describe lxon-api > /dev/null 2>&1; then
    echo "✅ LXON API: Running"
else
    echo "❌ LXON API: Not Running"
    pm2 restart lxon-api
fi

# Check disk space
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "⚠️  Disk Usage: ${DISK_USAGE}% (High)"
else
    echo "✅ Disk Usage: ${DISK_USAGE}%"
fi

# Check memory
MEM_USAGE=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100}')
echo "Memory Usage: ${MEM_USAGE}%"

echo "=== Health Check Complete ==="
```

Add to cron:

```bash
crontab -e
# Add: */10 * * * * /var/www/lxon/health-check.sh >> /var/log/health-check.log 2>&1
```

### 4. Backup Strategy

```bash
# Create backup script
cat > /var/www/lxon/backup.sh << EOF
#!/bin/bash

BACKUP_DIR="/var/backups/lxon"
DATE=\$(date +%Y%m%d_%H%M%S)

mkdir -p \$BACKUP_DIR

# Backup database
# pg_dump lxon_db > \$BACKUP_DIR/lxon_db_\$DATE.sql

# Backup configuration
tar -czf \$BACKUP_DIR/lxon_config_\$DATE.tar.gz /var/www/lxon/apps/contracts/.env

# Keep last 7 days of backups
find \$BACKUP_DIR -name "lxon_*" -mtime +7 -delete

echo "Backup completed: \$DATE"
EOF

chmod +x /var/www/lxon/backup.sh

# Add to cron (daily)
crontab -e
# Add: 0 2 * * * /var/www/lxon/backup.sh >> /var/log/backup.log 2>&1
```

---

## Troubleshooting

### Common Issues

#### 1. Git Pull Fails

```bash
# Check git remote
git remote -v

# Update remote URL
git remote set-url origin git@github.com:Demon723/CRYPTO.git

# Check SSH key
ssh -T git@github.com
```

#### 2. PM2 Services Won't Start

```bash
# Check PM2 logs
pm2 logs

# Check port availability
sudo netstat -tlnp | grep 8545

# Kill process using port
sudo fuser -k 8545/tcp
```

#### 3. Nginx 502 Bad Gateway

```bash
# Check if backend is running
pm2 status

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

#### 4. Out of Memory

```bash
# Check memory usage
free -h

# Add swap space
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

---

## Cost Optimization

### 1. Use Preemptible VMs

```bash
# Create preemptible VM (cheaper but can be terminated)
gcloud compute instances create lxon-node-preemptible \
  --zone=us-central1-a \
  --machine-type=e2-medium \
  --preemptible \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud
```

### 2. Use Spot Instances

```bash
# Configure spot instance in deployment script
gcloud compute instances create lxon-spot \
  --zone=us-central1-a \
  --machine-type=e2-medium \
  --provisioning-model=SPOT \
  --instance-termination-action=STOP
```

### 3. Auto-scale Based on Load

```bash
# Create instance template
gcloud compute instance-templates create lxon-template \
  --machine-type=e2-medium \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud

# Create instance group
gcloud compute instance-groups managed create lxon-group \
  --zone=us-central1-a \
  --size=2 \
  --template=lxon-template

# Configure auto-scaling
gcloud compute instance-groups managed set-autoscaling lxon-group \
  --zone=us-central1-a \
  --max-num-instances=5 \
  --min-num-instances=1 \
  --target-cpu-utilization=0.6
```

---

## Summary

Your LXON blockchain is now deployed on Google Cloud with automated git pull deployment:

**Deployment Flow:**
1. Push changes to GitHub
2. Webhook triggers deployment script
3. Script pulls latest changes
4. Dependencies installed and compiled
5. Services restarted with PM2
6. Nginx serves the application

**Next Steps:**
- Monitor logs regularly
- Set up alerts for failures
- Configure custom domain
- Enable SSL certificate
- Set up monitoring dashboard
- Implement CI/CD pipeline

**Support:**
- Google Cloud Documentation: https://cloud.google.com/docs
- PM2 Documentation: https://pm2.keymetrics.io/docs
- Hardhat Documentation: https://hardhat.org/docs

---

**Status:** Ready for production deployment on Google Cloud Platform! ☁️
