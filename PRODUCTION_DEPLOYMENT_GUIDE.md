# LXON Production Deployment Guide

This guide provides step-by-step instructions for deploying LXON to production mainnet networks with MetaMask compatibility.

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Security Considerations](#security-considerations)
3. [Network Selection](#network-selection)
4. [Deployment Process](#deployment-process)
5. [Post-Deployment Verification](#post-deployment-verification)
6. [MetaMask Integration](#metamask-integration)
7. [Monitoring and Maintenance](#monitoring-and-maintenance)

---

## Pre-Deployment Checklist

### 1. Smart Contract Audit

- [ ] Code review completed
- [ ] Security audit performed
- [ ] Gas optimization verified
- [ ] Test coverage > 90%
- [ ] Vulnerability scan completed

### 2. Infrastructure Preparation

- [ ] Production server ready (GCE/AWS)
- [ ] Domain name configured
- [ ] SSL certificates obtained
- [ ] Firewall rules configured
- [ ] Monitoring tools set up

### 3. Financial Preparation

- [ ] Sufficient native tokens for gas fees
- [ ] Initial liquidity funding prepared
- [ ] Emergency fund established
- [ ] Multi-sig wallet configured

### 4. Documentation

- [ ] User documentation ready
- [ ] API documentation complete
- [ ] Deployment guide finalized
- [ ] Emergency procedures documented

---

## Security Considerations

### 1. Private Key Management

```bash
# NEVER commit private keys to git
# Use environment variables or secure vaults

# Recommended: Use hardware wallet for deployment
# Alternative: Use secure environment variables
export PRIVATE_KEY=0x...  # Only for deployment, never commit
```

### 2. Contract Security

- Use OpenZeppelin audited contracts
- Implement proper access control
- Add emergency pause functionality
- Set appropriate role permissions
- Implement rate limiting if needed

### 3. Network Security

- Use HTTPS for all endpoints
- Implement rate limiting
- Set up DDoS protection
- Configure firewall rules
- Enable monitoring and alerts

### 4. Operational Security

- Use multi-sig for critical operations
- Implement time-locks for governance
- Set up emergency procedures
- Regular security audits
- Incident response plan

---

## Network Selection

### Recommended Networks for Mainnet Deployment

#### 1. Ethereum Mainnet
- **Pros**: Highest liquidity, most users, best security
- **Cons**: High gas fees, slower transactions
- **Best for**: DeFi protocols, high-value transactions

#### 2. Polygon (MATIC)
- **Pros**: Low fees, fast transactions, Ethereum compatible
- **Cons**: Lower liquidity than Ethereum
- **Best for**: High-frequency trading, user-facing dApps

#### 3. Binance Smart Chain (BSC)
- **Pros**: Very low fees, fast transactions
- **Cons**: Centralized concerns
- **Best for**: Trading applications, cost-sensitive users

#### 4. Arbitrum
- **Pros**: Ethereum security, lower fees, fast
- **Cons**: Newer ecosystem
- **Best for**: DeFi applications needing Ethereum security

### Deployment Recommendation

**Start with Polygon** for initial launch:
- Low gas costs for users
- Fast transactions
- Good liquidity
- Ethereum compatible
- Easy to bridge to Ethereum later

---

## Deployment Process

### Step 1: Configure Environment Variables

Create `.env.production` file:

```bash
# Network Configuration
NETWORK=polygon
RPC_URL=https://polygon-rpc.com
CHAIN_ID=137

# Wallet Configuration
PRIVATE_KEY=your_private_key_here
DEPLOYER_ADDRESS=your_deployer_address

# Contract Configuration
TOKEN_NAME=LXON
TOKEN_SYMBOL=LXON
INITIAL_SUPPLY=100000000000000000000000000  # 100 million tokens

# Liquidity Configuration
INITIAL_LIQUIDITY_TOKEN=10000000000000000000000  # 10,000 tokens
INITIAL_LIQUIDITY_NATIVE=1000000000000000000  # 1 native token

# Token Sale Configuration
SALE_DURATION=2592000  # 30 days in seconds
TOKEN_PRICE=100000000000000  # 0.0001 native per token
SALE_CAP=1000000000000000000000000  # 1 million tokens

# Security
MULTISIG_ADDRESS=your_multisig_address
EMERGENCY_ADDRESS=your_emergency_address
```

### Step 2: Deploy to Production

```bash
# Navigate to contracts directory
cd ~/LXON/apps/contracts

# Load production environment
source .env.production

# Deploy EVM-compatible ecosystem
npx hardhat run scripts/deploy-evm-compatible.ts --network polygon
```

### Step 3: Verify Deployment

```bash
# Run verification script
npx hardhat run scripts/verify-native-deployment.ts --network polygon

# Check contract addresses
cat deployments/137-evm-ecosystem.json
```

### Step 4: Add Liquidity

```bash
# Deploy liquidity
npx hardhat run scripts/add-native-liquidity.ts --network polygon
```

### Step 5: Configure Token Sale

```bash
# Deploy token sale
npx hardhat run scripts/deploy-token-sale.ts --network polygon
```

### Step 6: Verify on Block Explorer

- Check contract addresses on Polygonscan
- Verify source code
- Add contract ABI
- Enable contract verification

---

## Post-Deployment Verification

### 1. Contract Verification

```bash
# Verify contracts on block explorer
npx hardhat verify --network polygon CONTRACT_ADDRESS CONSTRUCTOR_ARGS
```

### 2. Functional Testing

```bash
# Run production tests
npx hardhat test test/*.ts --network polygon

# Test token sale
npx hardhat run scripts/test-token-sale.ts --network polygon

# Monitor ecosystem
npx hardhat run scripts/monitor-ecosystem.ts --network polygon
```

### 3. Security Checks

- Verify all roles are properly assigned
- Check emergency controls work
- Test pause functionality
- Verify access control
- Check for any security vulnerabilities

### 4. Performance Testing

- Test transaction speeds
- Monitor gas costs
- Check contract interaction latency
- Verify scalability

---

## MetaMask Integration

### 1. Network Configuration

Users can add the network automatically via the trading interface or manually:

**Polygon Mainnet Configuration:**

```json
{
  "chainId": "0x89",
  "chainName": "Polygon Mainnet",
  "nativeCurrency": {
    "name": "MATIC",
    "symbol": "MATIC",
    "decimals": 18
  },
  "rpcUrls": ["https://polygon-rpc.com"],
  "blockExplorerUrls": ["https://polygonscan.com"]
}
```

### 2. Token Addition

Users can add LXON token automatically:

- Contract Address: (From deployment output)
- Token Symbol: LXON
- Token Decimal: 18

### 3. Trading Interface Update

Update `trading-interface.html` with production addresses:

```javascript
const CONTRACTS = {
  LXON_TOKEN: 'YOUR_DEPLOYED_TOKEN_ADDRESS',
  SWAP: 'YOUR_DEPLOYED_SWAP_ADDRESS',
  RPC_URL: 'https://polygon-rpc.com',
  CHAIN_ID: 137,
  CHAIN_NAME: 'Polygon Mainnet',
  NATIVE_CURRENCY: {
    name: 'MATIC',
    symbol: 'MATIC',
    decimals: 18
  }
};
```

---

## Monitoring and Maintenance

### 1. Real-time Monitoring

```bash
# Set up monitoring script as cron job
crontab -e
# Add: */5 * * * * cd ~/LXON/apps/contracts && npx hardhat run scripts/monitor-ecosystem.ts --network polygon >> /var/log/lxon-monitor.log 2>&1
```

### 2. Health Checks

Create health check script:

```bash
#!/bin/bash
# health-check.sh

echo "=== LXON Health Check ==="

# Check contract deployment
# Check liquidity pools
# Check token sale status
# Check system resources

# Send alerts if issues detected
```

### 3. Backup Strategy

```bash
# Backup deployment information
cp deployments/137-evm-ecosystem.json backups/
cp .env.production backups/

# Backup to secure location
# Implement automated backups
```

### 4. Incident Response

**Emergency Procedures:**

1. **Pause Contracts** - If security issue detected
2. **Withdraw Liquidity** - If critical vulnerability
3. **Notify Users** - Transparent communication
4. **Deploy Fix** - Patch and redeploy
5. **Resume Operations** - After verification

---

## Cost Estimates

### Polygon Mainnet Deployment Costs

| Operation | Gas Cost | MATIC Cost (at $0.50) |
|-----------|----------|----------------------|
| Token Deployment | ~2,000,000 | ~$1.00 |
| Swap Deployment | ~3,000,000 | ~$1.50 |
| Token Sale Deployment | ~2,500,000 | ~$1.25 |
| Add Liquidity | ~1,000,000 | ~$0.50 |
| **Total** | ~8,500,000 | **~$4.25** |

### Ethereum Mainnet Deployment Costs

| Operation | Gas Cost | ETH Cost (at $3,000) |
|-----------|----------|---------------------|
| Token Deployment | ~2,000,000 | ~$6.00 |
| Swap Deployment | ~3,000,000 | ~$9.00 |
| Token Sale Deployment | ~2,500,000 | ~$7.50 |
| Add Liquidity | ~1,000,000 | ~$3.00 |
| **Total** | ~8,500,000 | **~$25.50** |

---

## Launch Checklist

### Pre-Launch (1 week before)

- [ ] All contracts deployed and verified
- [ ] Liquidity added to pools
- [ ] Token sale configured
- [ ] Trading interface updated
- [ ] Documentation published
- [ ] Support team trained
- [ ] Marketing materials ready

### Launch Day

- [ ] Final security check
- [ ] Monitor initial transactions
- [ ] Support team on standby
- [ ] Social media announcements
- [ ] Community engagement
- [ ] Real-time monitoring

### Post-Launch (1 week after)

- [ ] Analyze user feedback
- [ ] Monitor for issues
- [ ] Optimize gas costs
- [ ] Update documentation
- [ ] Plan future features
- [ ] Security review

---

## Troubleshooting

### Common Issues

#### 1. Deployment Fails

**Problem:** Transaction fails during deployment

**Solution:**
- Check gas price and limit
- Verify account has sufficient funds
- Check network connectivity
- Review contract code for errors

#### 2. Verification Fails

**Problem:** Contract verification on block explorer fails

**Solution:**
- Check constructor arguments match
- Verify compiler version
- Check optimization settings
- Try manual verification

#### 3. Users Can't Add Network

**Problem:** MetaMask network addition fails

**Solution:**
- Verify RPC URL is accessible
- Check chain ID is correct
- Ensure network name is unique
- Try manual network addition

#### 4. Token Not Showing

**Problem:** LXON token not visible in MetaMask

**Solution:**
- Verify contract address is correct
- Check token is ERC20 compliant
- Ensure user is on correct network
- Try manual token addition

---

## Next Steps

After successful production deployment:

1. **Monitor Performance** - Track transaction volume and user activity
2. **Gather Feedback** - Collect user feedback and improve UX
3. **Scale Infrastructure** - Add more servers if needed
4. **Expand to Other Networks** - Deploy to Ethereum, BSC, etc.
5. **Add Advanced Features** - Governance, staking, bridges
6. **Security Audits** - Regular security reviews
7. **Community Building** - Grow user community
8. **Partnerships** - Collaborate with other projects

---

## Support Resources

- **Polygon Documentation**: https://docs.polygon.technology
- **MetaMask Support**: https://support.metamask.io
- **Hardhat Documentation**: https://hardhat.org/docs
- **OpenZeppelin**: https://docs.openzeppelin.com

---

## Summary

Your LXON blockchain is now ready for production deployment with:

✅ **MetaMask Compatibility** - Users can use standard wallets
✅ **EVM-Compatible** - Deploy on any major blockchain
✅ **Production Ready** - Security, monitoring, and support
✅ **Scalable** - Can handle high transaction volumes
✅ **User-Friendly** - Easy onboarding and trading

**Recommended Next Action:** Deploy to Polygon mainnet for initial launch, then expand to other networks based on user demand.

---

**Status:** Ready for production deployment! 🚀
