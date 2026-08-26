# GCE Deployment Guide for LXON Tokenomics

## Overview

This guide provides instructions for deploying the enhanced LXON tokenomics to a Google Cloud Engine (GCE) instance running the LXON blockchain.

## Prerequisites

### GCE Instance Setup

**Instance Details:**
- **IP Address:** 3.110.221.224
- **RPC Port:** 8545
- **Network:** LXON (Chain ID: 723)
- **Status:** Must have LXON blockchain node running

### Software Requirements

- **Node.js:** v18+ (for deployment scripts)
- **Hardhat:** Latest version
- **Private Key:** For deployment account
- **LXON Balance:** Sufficient for gas fees

## Configuration

### 1. Update .env File

Add the GCE RPC URL to your `.env` file:

```bash
# GCE Instance RPC URL
GCE_RPC_URL=http://3.110.221.224:8545

# Your private key for deployment
PRIVATE_KEY=0xYourPrivateKey

# Optional: Multi-sig treasury address
TREASURY_ADDRESS=0xYourTreasuryAddress
```

### 2. Verify GCE Network Configuration

The GCE network is already configured in `hardhat.config.ts`:

```typescript
gce: {
  url: process.env.GCE_RPC_URL || 'http://3.110.221.224:8545',
  accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
  chainId: 723
}
```

## Deployment Steps

### Step 1: Verify GCE Connectivity

Test the connection to your GCE instance:

```bash
cd /Users/adikamble/LXON/LXON/apps/contracts
npx hardhat run scripts/verify-rpc.ts --network gce
```

**Expected Output:**
```
✅ Connected to network
  Network: lxon
  Chain ID: 723
  Deployer Address: 0x...
  Account Balance: ... LXON
```

**If connection fails:**
- Check if LXON blockchain node is running on GCE instance
- Verify firewall rules allow port 8545
- Ensure GCE instance is accessible from your location

### Step 2: Deploy to GCE

Deploy the enhanced tokenomics to your GCE instance:

```bash
npx hardhat run scripts/deploy-gce.ts --network gce
```

**Deployment Process:**
1. **Phase 1:** Deploy LXON Native Token
2. **Phase 2:** Deploy Base Token (Mock USDC)
3. **Phase 3:** Mint base tokens to treasury
4. **Phase 4:** Deploy Buyback and Burn Contract
5. **Phase 5:** Configure buyback parameters

**Expected Output:**
```
🚀 Deploying Enhanced LXON Tokenomics to GCE Instance...

📋 Deployment Information:
  GCE Instance: 3.110.221.224:8545
  Network: LXON (Chain ID: 723)
  Deployer Address: 0x...
  Account Balance: ... LXON

📦 Phase 1: Deploying LXON Native Token...
✅ LXON Native Token deployed to: 0x...

💰 Phase 2: Deploying Base Token (Mock USDC)...
✅ Base Token deployed to: 0x...

💰 Phase 3: Minting Base Tokens to Treasury...
✅ Minted 1,000,000 USDC to treasury

🔥 Phase 4: Deploying Buyback and Burn Contract...
✅ Buyback and Burn deployed to: 0x...

⚙️  Phase 5: Configuring Buyback Parameters...
✅ Buyback enabled
✅ Approved unlimited spending for buyback contract

💾 Deployment addresses saved to: deployments/gce.json
```

### Step 3: Verify Deployment

Verify the deployment was successful:

```bash
npx hardhat run scripts/verify-gce.ts --network gce
```

**Expected Output:**
```
🔍 Verifying GCE Deployment...

📋 Contract Addresses:
  LXON Token: 0x...
  Base Token: 0x...
  Buyback Contract: 0x...
  Treasury: 0x...

✅ Verification 1: Emission Parameters
✅ Verification 2: Transaction Burn Fee
✅ Verification 3: Tiered Staking Configuration
✅ Verification 4: Buyback Configuration
✅ Verification 5: Contract Addresses

🎉 GCE deployment verified successfully!
```

## Post-Deployment Tasks

### 1. Monitor GCE Instance Performance

Check the health of your GCE instance:

```bash
# From Cloud Shell or server
curl http://localhost:8545
# Should return JSON response

# Check system resources
top
df -h
free -m
```

### 2. Set Up Multi-sig Treasury (Recommended)

For production deployment, replace the deployer address with a multi-sig treasury:

1. Create Gnosis Safe: https://app.safe.global
2. Add 3+ trusted owners
3. Set threshold to 2+ signatures
4. Update contract treasury address
5. Transfer funds to multi-sig

### 3. Configure Firewall Rules

Ensure your GCE instance has proper firewall configuration:

```bash
# Allow RPC port from your IP
gcloud compute firewall-rules create allow-lxon-rpc \
  --allow tcp:8545 \
  --source-ranges YOUR_IP/32 \
  --target-tags lxon-node
```

### 4. Monitor Tokenomics

Use the monitoring script to track metrics:

```bash
npx hardhat run scripts/monitor-tokenomics.ts --network gce
```

## Troubleshooting

### Connection Issues

**Problem:** Cannot connect to GCE instance

**Solutions:**
- Check if LXON blockchain node is running
- Verify firewall rules allow port 8545
- Ensure GCE instance is running
- Check network connectivity

**Commands:**
```bash
# Check if node is running
curl http://3.110.221.224:8545

# Check firewall rules
gcloud compute firewall-rules list

# Check instance status
gcloud compute instances list
```

### Deployment Issues

**Problem:** Deployment fails with insufficient balance

**Solution:**
- Ensure deployer account has sufficient LXON for gas fees
- Check network for congestion
- Verify private key is correct

**Problem:** Contract deployment reverts

**Solution:**
- Check contract constructor parameters
- Verify network configuration
- Review error messages for specific issues

### Performance Issues

**Problem:** Slow response times from GCE instance

**Solutions:**
- Check GCE instance resource utilization
- Consider upgrading instance type
- Optimize blockchain node configuration
- Check network latency

## Security Considerations

### GCE Security

1. **Firewall Configuration:**
   - Restrict RPC access to trusted IPs
   - Use security groups for access control
   - Monitor for unauthorized access attempts

2. **Instance Security:**
   - Keep system updated
   - Use strong authentication
   - Enable monitoring and logging
   - Regular security audits

3. **Network Security:**
   - Use VPC networks
   - Implement network segmentation
   - Enable DDoS protection
   - Monitor network traffic

### Smart Contract Security

1. **Access Control:**
   - Use multi-sig for critical functions
   - Implement proper role-based access
   - Enable emergency pause mechanisms

2. **Key Management:**
   - Use hardware wallets for mainnet
   - Never commit private keys
   - Rotate keys regularly
   - Use key management services

## Monitoring and Maintenance

### Regular Monitoring

1. **System Monitoring:**
   - CPU and memory usage
   - Disk space and I/O
   - Network traffic
   - Error rates

2. **Blockchain Monitoring:**
   - Block production rate
   - Transaction throughput
   - Peer connectivity
   - Chain synchronization

3. **Application Monitoring:**
   - Contract interactions
   - Token metrics
   - User activity
   - Error rates

### Maintenance Tasks

1. **Regular Updates:**
   - Update blockchain software
   - Apply security patches
   - Update dependencies
   - Review and optimize code

2. **Backup and Recovery:**
   - Regular database backups
   - Configuration backups
   - Disaster recovery testing
   - Recovery procedures

## Scaling Considerations

### Horizontal Scaling

For increased capacity, consider:

1. **Multiple Nodes:**
   - Deploy multiple LXON nodes
   - Load balance RPC requests
   - Implement node redundancy

2. **Load Balancing:**
   - Use load balancers for RPC endpoints
   - Implement health checks
   - Configure failover mechanisms

### Vertical Scaling

For better performance:

1. **Instance Upgrades:**
   - Increase CPU resources
   - Add more memory
   - Use faster storage
   - Optimize network bandwidth

## Cost Optimization

### GCE Cost Management

1. **Right-sizing:**
   - Choose appropriate instance types
   - Monitor resource utilization
   - Scale based on demand

2. **Reserved Instances:**
   - Use reserved instances for savings
   - Commitment discounts
   - Spot instances for non-critical workloads

### Network Costs

1. **Data Transfer:**
   - Optimize data transfer patterns
   - Use CDN for static content
   - Compress data where possible

## Support and Resources

### Documentation

- Hardhat Documentation: https://hardhat.org/docs
- GCE Documentation: https://cloud.google.com/compute/docs
- LXON Documentation: `docs/` directory

### Community

- GitHub Issues: https://github.com/Demon723/LXON/issues
- LXON Community: [Community channels]

### Emergency Contacts

- Technical Support: [Support email]
- Security Issues: [Security email]

## Appendix

### GCE Instance Setup Commands

```bash
# Create GCE instance
gcloud compute instances create lxon-node \
  --zone=us-central1-a \
  --machine-type=e2-medium \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud \
  --boot-disk-size=100GB \
  --tags=lxon-node

# Add firewall rule
gcloud compute firewall-rules create allow-lxon-rpc \
  --allow tcp:8545 \
  --source-ranges=0.0.0.0/0 \
  --target-tags=lxon-node

# SSH into instance
gcloud compute ssh lxon-node --zone=us-central1-a
```

### Useful Commands

```bash
# Check instance status
gcloud compute instances list

# View instance logs
gcloud compute instances get-serial-port-output lxon-node

# Restart instance
gcloud compute instances reset lxon-node

# Delete instance
gcloud compute instances delete lxon-node
```

---

**Last Updated:** August 26, 2026
**Version:** 1.0
