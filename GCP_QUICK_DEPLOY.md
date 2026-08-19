# Quick GCP Deployment for Existing Project

This guide helps you deploy your existing LXON project to Google Cloud using git pull.

## Prerequisites

- Existing Google Cloud project
- VM instance already created (or create one below)
- GitHub repository access
- SSH access to VM

## Quick VM Setup (if needed)

```bash
# Set your project
gcloud config set project YOUR_PROJECT_ID

# Create VM
gcloud compute instances create lxon-node \
  --zone=us-central1-a \
  --machine-type=e2-medium \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud \
  --boot-disk-size=50GB \
  --tags=http-server,https-server

# Allow HTTP/HTTPS
gcloud compute firewall-rules create allow-http --allow tcp:80 --source-ranges 0.0.0.0/0
gcloud compute firewall-rules create allow-https --allow tcp:443 --source-ranges 0.0.0.0/0
```

## Deploy to Existing VM

### 1. SSH into your VM

```bash
gcloud compute ssh lxon-node --zone=us-central1-a
```

### 2. Install dependencies

```bash
sudo apt update
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs python3 python3-pip build-essential git
sudo npm install -g pm2 hardhat
sudo apt install -y nginx certbot python3-certbot-nginx
```

### 3. Setup Git

```bash
git config --global user.name "LXON Deployer"
git config --global user.email "deployer@lxon.network"
ssh-keygen -t ed25519 -C "lxon-deployer@lxon.network"
cat ~/.ssh/id_ed25519.pub  # Add this to GitHub
```

### 4. Clone your project

```bash
mkdir -p /var/www/lxon
cd /var/www/lxon
git clone git@github.com:Demon723/CRYPTO.git .
```

### 5. Install and compile

```bash
cd apps/contracts
npm install
npx hardhat compile
```

### 6. Setup deployment script

```bash
cd /var/www/lxon
chmod +x deploy.sh
```

### 7. Run initial deployment

```bash
./deploy.sh
```

### 8. Setup PM2

```bash
cd apps/contracts
pm2 start ecosystem.config.js
pm2 save
```

### 9. Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/lxon
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name YOUR_DOMAIN_OR_IP;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/lxon /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 10. Setup SSL (optional)

```bash
sudo certbot --nginx -d YOUR_DOMAIN
```

## Automated Git Pull Deployment

### Option 1: Cron Job (Simplest)

```bash
crontab -e
# Add this line:
*/5 * * * * cd /var/www/lxon && git pull origin main && ./deploy.sh >> /var/log/lxon-deploy.log 2>&1
```

### Option 2: GitHub Webhook

```bash
# Install webhook
npm install -g webhook

# Create webhook config
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
        "secret": "YOUR_SECRET",
        "parameter": {
          "source": "header",
          "name": "X-Hub-Signature"
        }
      }
    }
  }
]
EOF

# Start webhook
pm2 start webhook -- --port 9000 --hooks /var/www/lxon/webhook-config.json
pm2 save
```

Then add webhook in GitHub:
- Go to Settings → Webhooks
- URL: `http://YOUR_VM_IP:9000/hooks/lxon-deploy`
- Secret: `YOUR_SECRET`

## Manual Deployment

```bash
# SSH into VM
gcloud compute ssh lxon-node --zone=us-central1-a

# Pull and deploy
cd /var/www/lxon
git pull origin main
./deploy.sh
```

## Monitoring

```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs lxon-node

# Monitor
pm2 monit
```

## Troubleshooting

**Git pull fails:**
```bash
cd /var/www/lxon
git remote -v
ssh -T git@github.com
```

**PM2 won't start:**
```bash
pm2 logs
pm2 restart lxon-node
```

**Nginx 502 error:**
```bash
pm2 status
sudo systemctl restart nginx
```

## Summary

Your existing LXON project is now deployed on GCP with automated git pull updates.

**Next push to GitHub will automatically deploy to your VM!**
