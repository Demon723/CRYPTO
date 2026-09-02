# GCE Custom Blockchain Setup Guide

## 🎯 Overview

Set up a custom blockchain on your GCE instance for LXON tokenomics deployment.

**GCE Instance Details:**
- **IP Address:** 35.209.94.197
- **RPC Port:** 8545
- **Zone:** us-central1-a
- **Machine Type:** e2-medium
- **Status:** RUNNING
- **Billing:** Active (LXON account)

---

## 📋 Prerequisites

### 1. SSH Access
```bash
gcloud compute ssh blockchain-node --project=lxon-blockchain --zone=us-central1-a
```

### 2. Verify Docker Installation
```bash
docker --version
docker ps
```

---

## 🚀 Step-by-Step Setup

### Step 1: SSH into GCE Instance

```bash
gcloud compute ssh blockchain-node --project=lxon-blockchain --zone=us-central1-a
```

### Step 2: Update System

```bash
sudo apt-get update
sudo apt-get upgrade -y
```

### Step 3: Install Geth (Go Ethereum)

```bash
# Add Ethereum repository
sudo apt-get install -y software-properties-common
sudo add-apt-repository -y ppa:ethereum/ethereum
sudo apt-get update

# Install Geth
sudo apt-get install -y ethereum

# Verify installation
geth version
```

### Step 4: Create Blockchain Directory

```bash
mkdir -p ~/lxon-blockchain
cd ~/lxon-blockchain
```

### Step 5: Generate Genesis Block

Create `genesis.json`:

```json
{
  "config": {
    "chainId": 723,
    "homesteadBlock": 0,
    "eip150Block": 0,
    "eip155Block": 0,
    "eip158Block": 0,
    "byzantiumBlock": 0,
    "constantinopleBlock": 0,
    "petersburgBlock": 0,
    "istanbulBlock": 0,
    "berlinBlock": 0,
    "londonBlock": 0,
    "arrowGlacierBlock": 0,
    "grayGlacierBlock": 0,
    "mergeNetsplitBlock": 0,
    "shanghaiTime": 0,
    "cancunTime": 0,
    "terminalTotalDifficulty": 0
  },
  "difficulty": "0x20000",
  "gasLimit": "0x8000000",
  "alloc": {
    "0x7F715B7F78a7d1D63455F3e2Ec1fa31D516f9Ef3": {
      "balance": "0x200000000000000000000000000"
    },
    "0x43410E73d2Ef4B2638BE10265e8BE3D2FDfFDc27": {
      "balance": "0x200000000000000000000000000"
    },
    "0x936b266CF4d1819A038e626CD325D3Af9B97c23f": {
      "balance": "0x200000000000000000000000000"
    }
  },
  "coinbase": "0x7F715B7F78a7d1D63455F3e2Ec1fa31D516f9Ef3",
  "extraData": "0x0000000000000000000000000000000000000000000000000000000000000000",
  "nonce": "0x0000000000000042",
  "mixhash": "0x0000000000000000000000000000000000000000000000000000000000000000",
  "parentHash": "0x0000000000000000000000000000000000000000000000000000000000000000",
  "timestamp": "0x00"
}
```

### Step 6: Initialize Blockchain

```bash
cd ~/lxon-blockchain
geth --datadir ./data init genesis.json
```

### Step 7: Create Account

```bash
# Create new account (or import existing)
geth --datadir ./data account new

# Or import existing account
geth --datadir ./data account import /path/to/private-key
```

### Step 8: Start Geth Node

```bash
# Start node with RPC enabled
geth --datadir ./data \
  --networkid 723 \
  --port 30303 \
  --http \
  --http.addr 0.0.0.0 \
  --http.port 8545 \
  --http.corsdomain "*" \
  --http.api eth,web3,net,txpool \
  --ws \
  --ws.addr 0.0.0.0 \
  --ws.port 8546 \
  --ws.origins "*" \
  --ws.api eth,web3,net,txpool \
  --mine \
  --miner.etherbase 0x7F715B7F78a7d1D63455F3e2Ec1fa31D516f9Ef3 \
  --unlock 0x7F715B7F78a7d1D63455F3e2Ec1fa31D516f9Ef3 \
  --password /dev/null \
  --allow-insecure-unlock \
  --nodiscover \
  --maxpeers 0
```

### Step 9: Run as Background Service

Create systemd service file:

```bash
sudo nano /etc/systemd/system/lxon-blockchain.service
```

Add this content:

```ini
[Unit]
Description=LXON Blockchain Node
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/lxon-blockchain
ExecStart=/usr/bin/geth --datadir ./data \
  --networkid 723 \
  --port 30303 \
  --http \
  --http.addr 0.0.0.0 \
  --http.port 8545 \
  --http.corsdomain "*" \
  --http.api eth,web3,net,txpool \
  --ws \
  --ws.addr 0.0.0.0 \
  --ws.port 8546 \
  --ws.origins "*" \
  --ws.api eth,web3,net,txpool \
  --mine \
  --miner.etherbase 0x7F715B7F78a7d1D63455F3e2Ec1fa31D516f9Ef3 \
  --unlock 0x7F715B7F78a7d1D63455F3e2Ec1fa31D516f9Ef3 \
  --password /dev/null \
  --allow-insecure-unlock \
  --nodiscover \
  --maxpeers 0
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start service:

```bash
sudo systemctl daemon-reload
sudo systemctl enable lxon-blockchain
sudo systemctl start lxon-blockchain
sudo systemctl status lxon-blockchain
```

### Step 10: Verify Node is Running

```bash
# Check service status
sudo systemctl status lxon-blockchain

# Check logs
sudo journalctl -u lxon-blockchain -f

# Test RPC endpoint (from local machine)
curl -X POST http://35.209.94.197:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

---

## 🔧 Configuration Options

### Adjust Mining Difficulty

Edit `genesis.json`:
```json
"difficulty": "0x10000"  // Lower = faster blocks
```

### Adjust Gas Limit

Edit `genesis.json`:
```json
"gasLimit": "0x10000000"  // Higher = more transactions per block
```

### Add More Initial Accounts

Edit `genesis.json`:
```json
"alloc": {
  "YOUR_ADDRESS": {
    "balance": "0x200000000000000000000000000"
  }
}
```

---

## 📊 Monitoring

### Check Node Sync Status

```bash
# Attach to Geth console
geth attach http://localhost:8545

# In Geth console:
> eth.syncing
> eth.blockNumber
> net.peerCount
```

### View Logs

```bash
sudo journalctl -u lxon-blockchain -n 100
```

### Check Resource Usage

```bash
htop
df -h
```

---

## 🛡️ Security

### Firewall Rules (Already Configured)

```bash
gcloud compute firewall-rules list --project=lxon-blockchain
```

Should show:
- `allow-blockchain-rpc` - TCP:8545

### Restrict RPC Access (Optional)

To restrict access to specific IPs:

```bash
gcloud compute firewall-rules update allow-blockchain-rpc \
  --project=lxon-blockchain \
  --source-ranges=YOUR_IP_ADDRESS
```

---

## 🚀 Deployment to GCE Network

Once node is running, deploy contracts:

```bash
# From local machine
cd /Users/adikamble/LXON/LXON/apps/contracts

# Deploy to GCE network
npx hardhat run scripts/deploy-lxon-mainnet.ts --network gce
```

---

## 🐛 Troubleshooting

### Issue: Node won't start
**Solution:** Check logs: `sudo journalctl -u lxon-blockchain -n 50`

### Issue: RPC not accessible
**Solution:** Check firewall rules and node is running

### Issue: Out of sync
**Solution:** Restart node: `sudo systemctl restart lxon-blockchain`

### Issue: High CPU usage
**Solution:** Adjust mining difficulty or disable mining if not needed

---

## 📝 Post-Setup Checklist

- [ ] Geth installed and running
- [ ] Genesis block initialized
- [ ] Node mining blocks
- [ ] RPC accessible on port 8545
- [ ] Service running as systemd
- [ ] Firewall rules configured
- [ ] Can connect from local machine
- [ ] Ready for contract deployment

---

## 🎯 Next Steps

1. **Deploy Gnosis Safe** on GCE network
2. **Deploy LXON contracts** on GCE network
3. **Verify functionality** on custom blockchain
4. **Monitor node** performance and sync

---

**Last Updated:** September 2, 2026
**Network:** GCE Custom Blockchain (Chain ID: 723)
**RPC URL:** http://35.209.94.197:8545
