# GCE Server Management Commands

## 🔧 GCE Server Connection and Management

**Server Details:**
- **IP Address:** 35.209.94.197
- **RPC Port:** 8545
- **Chain ID:** 723
- **Status:** RUNNING

---

## 🚀 Basic Connection Commands

### SSH to GCE Server
```bash
# Connect to GCE server using gcloud
gcloud compute ssh blockchain-node --project=lxon-blockchain --zone=us-central1-a

# Connect directly via IP
ssh ubuntu@35.209.94.197

# Using specific SSH key
ssh -i /path/to/ssh-key ubuntu@35.209.94.197
```

### Check Server Status
```bash
# Check if server is reachable
ping 35.209.94.197

# Check if port 8545 is open
telnet 35.209.94.197 8545
# OR
nc -zv 35.209.94.197 8545

# Check server uptime and load
uptime

# Check disk space
df -h

# Check memory usage
free -h

# Check CPU usage
top
```

---

## 🔄 Blockchain Node Management

### Check Blockchain Node Status
```bash
# Check if blockchain node process is running
ps aux | grep -i blockchain
ps aux | grep -i geth
ps aux | grep -i node

# Check if port 8545 is listening
netstat -tlnp | grep 8545
# OR
ss -tlnp | grep 8545

# Check blockchain node logs
tail -f /var/log/blockchain/node.log
# OR
journalctl -u blockchain-node -f
```

### Start Blockchain Node
```bash
# Start blockchain node service
sudo systemctl start blockchain-node

# Start manually (if using geth)
geth --datadir /path/to/data --networkid 723 --port 30303 --rpc --rpcaddr 0.0.0.0 --rpcport 8545 --rpcapi eth,net,web3,personal

# Start in background
nohup geth --datadir /path/to/data --networkid 723 --port 30303 --rpc --rpcaddr 0.0.0.0 --rpcport 8545 --rpcapi eth,net,web3,personal > node.log 2>&1 &
```

### Stop Blockchain Node
```bash
# Stop blockchain node service
sudo systemctl stop blockchain-node

# Kill process manually
pkill -f geth
pkill -f blockchain-node
```

### Restart Blockchain Node
```bash
# Restart blockchain node service
sudo systemctl restart blockchain-node

# Restart manually
sudo systemctl stop blockchain-node
sudo systemctl start blockchain-node
```

---

## 🔍 Diagnostics and Troubleshooting

### Check System Logs
```bash
# Check system logs
sudo journalctl -xe

# Check blockchain node logs
sudo journalctl -u blockchain-node -n 100

# Check authentication logs
sudo tail -f /var/log/auth.log

# Check kernel logs
sudo dmesg | tail
```

### Network Diagnostics
```bash
# Check network interfaces
ip addr show

# Check network connectivity
ping -c 4 8.8.8.8

# Check DNS resolution
nslookup google.com

# Check firewall rules
sudo iptables -L -n
# OR
sudo ufw status

# Check if port is blocked
sudo netstat -tlnp | grep 8545
```

### Check Disk and File System
```bash
# Check disk usage
df -h

# Check inode usage
df -i

# Check disk health
sudo smartctl -a /dev/sda

# Check file system errors
sudo fsck -f /dev/sda1
```

---

## 🛠️ Maintenance Commands

### System Updates
```bash
# Update package list
sudo apt update

# Upgrade packages
sudo apt upgrade -y

# Clean up
sudo apt autoremove -y
```

### Service Management
```bash
# Enable blockchain node to start on boot
sudo systemctl enable blockchain-node

# Disable blockchain node from starting on boot
sudo systemctl disable blockchain-node

# Check service status
sudo systemctl status blockchain-node

# View service logs
sudo journalctl -u blockchain-node -f
```

### Resource Monitoring
```bash
# Monitor system resources in real-time
htop

# Monitor disk I/O
iotop

# Monitor network traffic
iftop

# Check process resource usage
ps aux --sort=-%cpu | head
ps aux --sort=-%mem | head
```

---

## 🔐 Security Commands

### Firewall Configuration
```bash
# Allow port 8545 (RPC)
sudo ufw allow 8545/tcp

# Allow SSH
sudo ufw allow 22/tcp

# Enable firewall
sudo ufw enable

# Check firewall status
sudo ufw status

# Allow specific IP
sudo ufw allow from YOUR_IP_ADDRESS to any port 8545
```

### SSH Security
```bash
# Check SSH configuration
sudo cat /etc/ssh/sshd_config

# Restart SSH service
sudo systemctl restart sshd

# Check SSH logs
sudo tail -f /var/log/auth.log
```

---

## 📊 Blockchain Specific Commands

### Check Blockchain Data
```bash
# Check blockchain data directory
ls -la /path/to/blockchain/data

# Check chain data size
du -sh /path/to/blockchain/data

# Check latest block
geth attach /path/to/data/geth.ipc
# Then in geth console:
> eth.blockNumber
> eth.syncing
```

### Reset Blockchain Data (CAUTION)
```bash
# Stop node first
sudo systemctl stop blockchain-node

# Backup current data
mv /path/to/blockchain/data /path/to/blockchain/data.backup

# Initialize new chain
geth --datadir /path/to/blockchain/data init /path/to/genesis.json

# Start node
sudo systemctl start blockchain-node
```

---

## 🚨 Emergency Commands

### Force Kill Process
```bash
# Find process ID
ps aux | grep geth

# Kill process
sudo kill -9 <PID>

# Kill all geth processes
sudo pkill -9 geth
```

### Clear Port
```bash
# Find process using port 8545
sudo lsof -i :8545

# Kill process
sudo kill -9 <PID>
```

### Reboot Server
```bash
# Graceful reboot
sudo reboot

# Immediate reboot
sudo reboot -f

# Shutdown
sudo shutdown -h now
```

---

## 📝 Quick Reference

### Most Common Commands
```bash
# SSH to server
ssh username@34.44.174.4

# Check blockchain node status
sudo systemctl status blockchain-node

# Restart blockchain node
sudo systemctl restart blockchain-node

# Check logs
sudo journalctl -u blockchain-node -f

# Check if port is listening
netstat -tlnp | grep 8545

# Check server resources
htop
```

---

## � Git Commands for Deployment

### Basic Git Operations
```bash
# Clone repository
git clone https://github.com/your-repo/lxon.git
cd lxon

# Check current branch
git branch

# Switch to main branch
git checkout main

# Pull latest changes
git pull origin main

# Check git status
git status

# View recent commits
git log --oneline -10
```

### Pull Request Workflow
```bash
# Create new branch for changes
git checkout -b feature/deployment-updates

# Make changes to files
# ... edit files ...

# Stage changes
git add .

# Commit changes
git commit -m "Update deployment configuration for GCE network"

# Push branch to remote
git push origin feature/deployment-updates

# Create pull request (using GitHub CLI)
gh pr create --title "Update deployment configuration" --body "Description of changes"

# Or create pull request manually at GitHub.com
```

### Merge Pull Request
```bash
# Switch to main branch
git checkout main

# Pull latest changes
git pull origin main

# Merge feature branch
git merge feature/deployment-updates

# Push merged changes
git push origin main

# Delete feature branch locally
git branch -d feature/deployment-updates

# Delete feature branch remotely
git push origin --delete feature/deployment-updates
```

### Deployment-Specific Git Commands
```bash
# Deploy specific commit
git checkout <commit-hash>
# Then run deployment scripts

# Rollback to previous commit
git log --oneline
git checkout <previous-commit-hash>

# Stash uncommitted changes
git stash

# Apply stashed changes
git stash pop

# Discard uncommitted changes
git checkout -- .
```

### GitHub CLI Commands
```bash
# Install GitHub CLI (if not installed)
# Ubuntu/Debian: sudo apt install gh
# macOS: brew install gh

# Authenticate with GitHub
gh auth login

# List pull requests
gh pr list

# View pull request details
gh pr view <pr-number>

# Merge pull request
gh pr merge <pr-number>

# Close pull request
gh pr close <pr-number>
```

### GCE Deployment Git Workflow
```bash
# Clone repository on GCE
git clone https://github.com/your-username/lxon.git
cd lxon

# Create branch for GCE deployment
git checkout -b feature/gce-blockchain-setup

# Add genesis.json and deployment files
git add genesis.json
git add scripts/
git add hardhat.config.ts

# Commit changes
git commit -m "Add GCE blockchain genesis and deployment configuration"

# Push to remote
git push origin feature/gce-blockchain-setup

# Create pull request
gh pr create --title "Add GCE blockchain setup" --body "Configured custom blockchain on GCE with genesis block and deployment scripts"

# After review, merge PR
gh pr merge feature/gce-blockchain-setup
```

### Push Changes to GCE Server
```bash
# From local machine, copy files to GCE
gcloud compute scp genesis.json blockchain-node:~/lxon-blockchain/ --project=lxon-blockchain --zone=us-central1-a
gcloud compute scp scripts/ blockchain-node:~/lxon-blockchain/scripts/ --project=lxon-blockchain --zone=us-central1-a
gcloud compute scp hardhat.config.ts blockchain-node:~/lxon-blockchain/ --project=lxon-blockchain --zone=us-central1-a

# Or use rsync for directory sync
gcloud compute scp --recurse . blockchain-node:~/lxon-blockchain/ --project=lxon-blockchain --zone=us-central1-a
```

### Pull Changes from GCE Server
```bash
# Copy files from GCE to local machine
gcloud compute scp blockchain-node:~/lxon-blockchain/genesis.json . --project=lxon-blockchain --zone=us-central1-a

# Pull entire directory
gcloud compute scp --recurse blockchain-node:~/lxon-blockchain/ . --project=lxon-blockchain --zone=us-central1-a
```

---

## �🔧 Configuration Files

### Common Locations
```bash
# Blockchain node config
/etc/blockchain/config.json
/etc/geth/config.toml

# Service file
/etc/systemd/system/blockchain-node.service

# Logs
/var/log/blockchain/
/var/log/syslog

# Data directory
/var/lib/blockchain/
/home/user/.ethereum/
```

---

**Note:** Replace placeholder values (username, paths, etc.) with your actual GCE server configuration.

**Last Updated:** September 2, 2026
**Server IP:** 34.44.174.4
**RPC Port:** 8545
