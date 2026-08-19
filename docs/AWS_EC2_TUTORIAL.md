# LXON Blockchain Node — AWS EC2 Deployment Tutorial

Exact steps to deploy the LXON blockchain node on an AWS EC2 instance.

**Date:** 2026-08-17
**Repo root:** `/Users/adikamble/LXON/CRYPTO`
**Node source:** `apps/lxon-blockchain/src/rpc/node.ts`
**Entry point:** `pnpm cli node`
**Default ports:** `8545` (HTTP), `8546` (WebSocket)
**Default chain ID:** `1`

---

## 1. Launch EC2 Instance (Already Done)

**AWS Console → EC2 → Launch Instance**

| Setting | Value |
|---------|-------|
| AMI | Ubuntu Server 26.04 LTS (HVM), EBS General Purpose (SSD) Volume Type |
| Instance type | `t3.micro` (Free tier) or `t3.small` (~$15/month) |
| Storage | 20-30 GB gp3 SSD |
| Security group | Allow inbound **TCP 22** (SSH from 42.104.225.19/32), **TCP 8545** (LXON RPC from 0.0.0.0/0), **TCP 80/443** (HTTP/HTTPS from 0.0.0.0/0) |
| Key pair | Download the `.pem` file |

---

## 2. SSH Into the Instance

```bash
# Navigate to your key pair location
cd /path/to/your-key-pair.pem

# Set correct permissions
chmod 400 your-key-pair.pem

# Connect to EC2
ssh -i your-key-pair.pem ubuntu@<YOUR_EC2_PUBLIC_IP>
```

Example:
```bash
ssh -i ~/Downloads/lxon-key.pem ubuntu@54.123.45.67
```

---

## 3. Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20 (required by project)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git build-essential

# Verify installation
node --version   # expect v20.x
npm --version
```

---

## 4. Install pnpm and PM2

```bash
# Install pnpm globally
sudo npm install -g pnpm

# Install PM2 for process management
sudo npm install -g pm2

# Verify installations
pnpm --version
pm2 --version
```

---

## 5. Clone the Repository

```bash
# Navigate to installation directory
cd /opt

# Option 1: If repository is public, use HTTPS
sudo git clone https://github.com/Demon723/CRYPTO.git lxon
cd lxon/CRYPTO

# Option 2: If repository is private, use SSH
# First, generate SSH key on EC2:
# ssh-keygen -t ed25519 -C "ubuntu@ec2-instance"
# Copy the public key (~/.ssh/id_ed25519.pub) and add to GitHub SSH keys
# Then clone:
# sudo git clone git@github.com:Demon723/CRYPTO.git lxon
# cd lxon/CRYPTO

# Option 3: If repository is private, use Personal Access Token
# Create PAT at GitHub Settings → Developer settings → Personal access tokens
# Then clone with token:
# sudo git clone https://<YOUR_TOKEN>@github.com/Demon723/CRYPTO.git lxon
# cd lxon/CRYPTO
```

---

## 6. Install Project Dependencies

```bash
# Install all workspace dependencies
pnpm install

# Expected output: Done in Xs
```

---

## 7. Build the Blockchain Package

```bash
# Build the blockchain engine
pnpm --filter lxon-blockchain build

# Verify build output exists
ls -la apps/lxon-blockchain/dist/
```

---

## 8. Create a Persistent Data Directory

```bash
# Create data directory for blockchain storage
sudo mkdir -p /data/lxon
sudo chown -R ubuntu:ubuntu /data/lxon
```

---

## 9. Start the LXON Node with PM2

```bash
# Start the node using PM2
pm2 start "pnpm cli node" --name lxon-node

# Configure PM2 to start on boot
pm2 save
pm2 startup

# Follow the instructions from pm2 startup to enable startup
```

---

## 10. Verify the Node is Running

```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs lxon-node

# Expected output: "JSON-RPC server listening on port 8545"
```

---

## 11. Test the JSON-RPC Endpoint

### Test from EC2 Instance

```bash
# Test client version
curl -s -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"web3_clientVersion","params":[],"id":1}'

# Expected: {"jsonrpc":"2.0","result":"LXON/v1.0.0","id":1}

# Test block number
curl -s -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'

# Expected: {"jsonrpc":"2.0","result":"0x0","id":1}

# Test network version
curl -s -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"net_version","params":[],"id":1}'

# Expected: {"jsonrpc":"2.0","result":"1","id":1}
```

### Test from Your Local Machine

```bash
# Replace with your EC2 public IP
curl -s -X POST http://<YOUR_EC2_PUBLIC_IP>:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"web3_clientVersion","params":[],"id":1}'
```

---

## 12. PM2 Management Commands

```bash
# View status
pm2 status

# View logs
pm2 logs lxon-node

# Restart node
pm2 restart lxon-node

# Stop node
pm2 stop lxon-node

# Delete node
pm2 delete lxon-node

# Monitor in real-time
pm2 monit
```

---

## 13. Update the Node

```bash
cd /opt/lxon/CRYPTO

# Pull latest changes
sudo git pull

# Reinstall dependencies
pnpm install

# Rebuild blockchain package
pnpm --filter lxon-blockchain build

# Restart node
pm2 restart lxon-node
```

---

## 14. Troubleshooting

| Issue | Fix |
|-------|-----|
| `EADDRINUSE` | Port 8545 is in use. `pm2 stop lxon-node` or change `PORT` env. |
| Connection refused | Check security group allows TCP 8545. Check `pm2 status`. |
| Build fails | Run `pnpm install` at repo root first. |
| Permission denied on `/data/lxon` | `sudo chown -R ubuntu:ubuntu /data/lxon` |
| Node not starting | Check `pm2 logs lxon-node` for error messages |
| Dependencies not found | Ensure Node.js v20+ is installed (`node --version`) |

---

## JSON-RPC Methods Reference

| Method | Description |
|--------|-------------|
| `web3_clientVersion` | Returns client version string |
| `eth_blockNumber` | Returns current block number (hex) |
| `eth_getBalance` | Returns account balance (hex) |
| `eth_sendRawTransaction` | Submits a signed transaction |
| `eth_getTransactionCount` | Returns transaction count (nonce) |
| `net_version` | Returns network ID (string) |

---

## Environment Variables (Optional)

You can set environment variables for production:

```bash
# Edit PM2 ecosystem file
pm2 ecosystem

# Or set environment variables before starting
export NODE_ENV=production
export CHAIN_ID=1
export PORT=8545
export GENESIS_TIME=$(date +%s)
export VALIDATOR_ADDRESS=<your-address>
export VALIDATOR_KEY=<your-private-key>

pm2 start "pnpm cli node" --name lxon-node
```

---

## Security Recommendations

1. **Restrict SSH access:** Use security groups to allow SSH only from your IP
2. **Restrict RPC access:** In production, do not expose port 8545 to `0.0.0.0/0`. Use VPN, SSH tunnel, or restrict to known IPs
3. **Use firewall:** Configure UFW on the EC2 instance
4. **Enable monitoring:** Set up CloudWatch alarms or monitoring
5. **Backup data:** Regularly backup `/data/lxon` or use EBS snapshots
6. **Use secrets manager:** Store private keys in AWS Secrets Manager, not in environment variables

---

## Next Steps

1. **Configure domain:** Point your domain to the EC2 public IP
2. **Set up SSL:** Use Let's Encrypt with Certbot for HTTPS
3. **Add monitoring:** Set up CloudWatch or external monitoring
4. **Deploy additional nodes:** For validator sets, deploy more EC2 instances
5. **Set up load balancer:** Use AWS ALB for multiple nodes
