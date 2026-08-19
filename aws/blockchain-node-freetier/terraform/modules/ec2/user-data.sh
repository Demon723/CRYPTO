#!/bin/bash
set -e

# Update system
apt-get update
apt-get install -y \
  curl \
  wget \
  git \
  build-essential \
  nodejs \
  npm \
  python3-pip \
  docker.io \
  ntp

# Start Docker
systemctl start docker
systemctl enable docker

# Create app directories
mkdir -p /app/data
mkdir -p /app/logs

# Mount data volume
DEVICE=$(lsblk -nd -o NAME,SIZE | grep '${data_volume_size}G' | awk '{print $1}' | head -1)
if [ ! -z "$DEVICE" ]; then
  mkfs.ext4 /dev/$DEVICE || true
  mount /dev/$DEVICE /app/data || true
  echo "/dev/$DEVICE /app/data ext4 defaults,nofail 0 0" >> /etc/fstab
fi

# Create lxon user
useradd -m -s /bin/bash lxon || true
chown -R lxon:lxon /app

# Pull Docker image (replace with your ECR image URL)
# docker login ECR
# docker pull YOUR_ECR_URL/lxon-node:latest

# Start LXON node with Docker
cat > /home/lxon/docker-compose.yml <<'DOCKER_EOF'
version: '3.8'
services:
  lxon-node:
    image: lxon-node:latest
    container_name: lxon-node
    ports:
      - "8545:8545"
      - "8546:8546"
      - "30303:30303"
      - "30303:30303/udp"
    volumes:
      - /app/data:/app/data
    environment:
      - NODE_ENV=production
      - CHAIN_ID=${chain_id}
      - GENESIS_TIME=${genesis_time}
      - VALIDATOR_ADDRESS=${validator_address}
      - VALIDATOR_KEY=${validator_key}
    restart: always
    logging:
      driver: "awslogs"
      options:
        awslogs-group: "/lxon/node"
        awslogs-region: "us-east-1"
        awslogs-stream-prefix: "lxon-node"
DOCKER_EOF

chown lxon:lxon /home/lxon/docker-compose.yml

# CloudWatch agent (optional - Free Tier has limited monitoring)
# apt-get install -y amazon-cloudwatch-agent

# Start node via cron (runs automatically on reboot)
echo "@reboot cd /home/lxon && docker-compose up -d" | crontab -u lxon -

# Log completion
echo "LXON node setup complete" >> /var/log/user-data.log
