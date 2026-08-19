#!/bin/bash

# LXON RPC Node Setup Script for Google Cloud
# This script sets up an RPC node for the LXON blockchain

set -e

echo "=== LXON RPC Node Setup ==="

# Update system
echo "Updating system packages..."
apt-get update && apt-get upgrade -y

# Install dependencies
echo "Installing dependencies..."
apt-get install -y docker.io docker-compose git curl wget nodejs nginx build-essential

# Start Docker
echo "Starting Docker service..."
systemctl start docker
systemctl enable docker

# Create LXON directory
echo "Creating LXON directory..."
mkdir -p /lxon
cd /lxon

# Clone LXON repository
echo "Cloning LXON repository..."
git clone https://github.com/Demon723/CRYPTO.git
cd CRYPTO

# Install Node.js dependencies
echo "Installing Node.js dependencies..."
cd apps/contracts
npm install --silent

# Create RPC configuration
echo "Creating RPC configuration..."
mkdir -p /lxon/config
cat > /lxon/config/rpc.json << 'EOF'
{
  "chainId": 723,
  "networkId": 723,
  "rpc": {
    "enabled": true,
    "port": 8545,
    "host": "0.0.0.0",
    "cors": "*",
    "apis": ["eth", "net", "web3", "lxon"],
    "cache": {
      "enabled": true,
      "size": 1000
    }
  },
  "p2p": {
    "port": 30303,
    "discovery": true,
    "bootnodes": []
  },
  "sync": {
    "mode": "full",
    "fastSync": true
  }
}
EOF

# Create systemd service
echo "Creating systemd service..."
cat > /etc/systemd/system/lxon-rpc.service << 'SERVICE'
[Unit]
Description=LXON RPC Node
After=network.target docker.service

[Service]
Type=simple
User=root
WorkingDirectory=/lxon/CRYPTO
ExecStart=/usr/bin/npm run start:rpc
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
SERVICE

# Reload systemd
systemctl daemon-reload

# Enable and start service
echo "Enabling and starting LXON RPC service..."
systemctl enable lxon-rpc
systemctl start lxon-rpc

# Wait for service to start
sleep 5

# Configure Nginx reverse proxy
echo "Configuring Nginx reverse proxy..."
cat > /etc/nginx/sites-available/lxon-rpc << 'NGINX'
server {
    listen 80;
    server_name _;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req zone=api_limit burst=20 nodelay;

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
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
NGINX

# Enable Nginx site
ln -sf /etc/nginx/sites-available/lxon-rpc /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test and restart Nginx
nginx -t
systemctl restart nginx

# Enable Nginx on boot
systemctl enable nginx

# Check service status
echo "Checking service status..."
systemctl status lxon-rpc
systemctl status nginx

echo ""
echo "=== LXON RPC Node Setup Complete ==="
echo "RPC node is now running and configured."
echo "Check logs with: journalctl -u lxon-rpc -f"
echo "Check status with: systemctl status lxon-rpc"
echo "Test RPC endpoint: curl http://localhost/health"