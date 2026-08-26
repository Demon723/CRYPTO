# Mainnet Deployment Guide

## ⚠️ CRITICAL SECURITY WARNINGS

**READ THIS CAREFULLY BEFORE PROCEEDING**

- **Mainnet deployment involves REAL MONEY** - Mistakes cannot be undone
- **Never commit private keys** to version control
- **Use hardware wallets** (Ledger, Trezor) for deployment
- **Set up multi-sig treasury** (Gnosis Safe) before deployment
- **Test thoroughly on testnet** before mainnet
- **Ensure sufficient ETH** for gas fees (0.5-1 ETH minimum)
- **Have emergency plans** ready in case of issues

## Prerequisites Checklist

### 1. Security Setup
- [ ] Hardware wallet (Ledger, Trezor) configured
- [ ] Multi-sig treasury wallet created (Gnosis Safe)
- [ ] Private key secured (never shared or committed)
- [ ] 2FA enabled on all accounts
- [ ] Emergency recovery plan documented

### 2. Infrastructure Setup
- [ ] Mainnet RPC endpoint configured (Infura, Alchemy, or own node)
- [ ] Etherscan API key obtained
- [ ] Infura API key obtained
- [ ] `.env` file configured with credentials
- [ ] `.env` added to `.gitignore`

### 3. Treasury Setup
- [ ] Multi-sig treasury wallet created (Gnosis Safe)
- [ ] Treasury address added to `.env` as `TREASURY_ADDRESS`
- [ ] Treasury funded with sufficient USDC/ETH for buyback
- [ ] Treasury owners configured (at least 3/5 multi-sig)

### 4. Contract Preparation
- [ ] Contracts audited by professional security firm
- [ ] Testnet deployment successful and verified
- [ ] All tokenomics tested on testnet
- [ ] Gas optimization completed
- [ ] Emergency stop mechanisms tested

### 5. Base Token Setup
- [ ] Real USDC address obtained (Circle's official contract)
- [ ] OR WETH address obtained (Wrapped Ether)
- [ ] Base token approved for treasury operations
- [ ] Base token funded in treasury

## Pre-Deployment Steps

### 1. Configure Environment Variables

Update your `.env` file with mainnet credentials:

```bash
# Mainnet RPC URL (use Infura, Alchemy, or your own node)
MAINNET_RPC_URL=https://mainnet.infura.io/v3/YOUR_PROJECT_ID

# Your deployer private key (from hardware wallet)
PRIVATE_KEY=your_private_key_here

# Etherscan API Key for contract verification
ETHERSCAN_API_KEY=your_etherscan_api_key

# Multi-sig treasury address (Gnosis Safe)
TREASURY_ADDRESS=0xYourMultisigAddress
```

### 2. Verify Network Configuration

Check `hardhat.config.ts` has mainnet configured:

```typescript
mainnet: {
  url: process.env.MAINNET_RPC_URL,
  accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
  chainId: 1
}
```

### 3. Fund Deployer Account

Ensure your deployer account has sufficient ETH:
- **Minimum:** 0.5 ETH for gas
- **Recommended:** 1-2 ETH for safety
- **Check balance:** `npx hardhat run scripts/check-balance.ts --network mainnet`

### 4. Review Deployment Script

Review `scripts/deploy-mainnet.ts`:
- Verify safety checks are in place
- Confirm treasury address is correct
- Ensure base token address is correct
- Check buyback parameters

## Deployment Process

### Step 1: Deploy LXON Native Token

```bash
npx hardhat run scripts/deploy-mainnet.ts --network mainnet
```

**Expected Output:**
- Safety checks verification
- LXON Token deployment
- Base Token deployment (or use existing)
- Treasury setup
- Buyback contract deployment
- Configuration verification

### Step 2: Verify Deployment

```bash
npx hardhat run scripts/verify-tokenomics.ts --network mainnet
```

**Expected Verification:**
- Emission parameters (5,000 LXON/day)
- Burn fee (1%)
- Tiered staking (4 tiers)
- Buyback configuration
- Mint authorities
- Token supply

### Step 3: Verify on Etherscan

1. Check contract addresses on Etherscan
2. Verify contract source code
3. Confirm constructor parameters
4. Check contract is verified

### Step 4: Test with Small Amounts

Before full operations:
1. Test small token transfers
2. Test staking with small amounts
3. Test buyback with small amounts
4. Verify all operations work correctly

## Post-Deployment Tasks

### 1. Replace Mock USDC with Real USDC

**Current:** Mock USDC deployed for testing
**Required:** Replace with real USDC address

```solidity
// Real USDC on Ethereum Mainnet
address constant REAL_USDC = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;
```

### 2. Configure Multi-sig Treasury

**Current:** Deployer address (INSECURE)
**Required:** Gnosis Safe multi-sig

1. Create Gnosis Safe wallet
2. Add 3-5 owners
3. Set threshold to 2/3 or 3/5
4. Fund treasury with USDC/ETH
5. Update buyback contract treasury

### 3. Fund Treasury

**Required:** Sufficient funds for buyback operations
- **Minimum:** 100,000 USDC equivalent
- **Recommended:** 500,000 - 1,000,000 USDC
- **Funding source:** Multi-sig treasury

### 4. Set Up Monitoring

Implement monitoring for:
- Contract events
- Treasury balance
- Buyback executions
- Token supply changes
- Emergency situations

### 5. Emergency Preparedness

Prepare for emergencies:
- Pause mechanism ready
- Emergency stop procedures
- Recovery plans documented
- Team contact information
- Incident response plan

## Mainnet Contract Addresses

### Ethereum Mainnet
- **LXON Token:** (to be deployed)
- **Buyback Contract:** (to be deployed)
- **Base Token:** Use real USDC `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48`
- **Treasury:** (Gnosis Safe address)

## Security Best Practices

### 1. Key Management
- Use hardware wallets for all operations
- Never share private keys
- Rotate keys periodically
- Use different keys for different roles

### 2. Multi-sig Operations
- All treasury operations require multi-sig
- Critical contract changes require multi-sig
- Use Gnosis Safe for treasury management
- Set appropriate thresholds (2/3, 3/5)

### 3. Access Control
- Implement role-based access control
- Use time-locked operations for critical changes
- Monitor all contract interactions
- Set up alerts for suspicious activity

### 4. Gas Optimization
- Optimize contract gas usage
- Monitor gas costs
- Use gas price oracles
- Consider Layer 2 for high-frequency operations

## Monitoring and Maintenance

### Daily Monitoring
- Treasury balance
- Token supply changes
- Buyback executions
- Contract events

### Weekly Monitoring
- Gas cost analysis
- Performance metrics
- Security audit logs
- User feedback

### Monthly Monitoring
- Full security review
- Performance optimization
- Protocol upgrades
- Community feedback

## Emergency Procedures

### Contract Emergency
1. Pause contract operations
2. Assess the situation
3. Execute recovery plan
4. Communicate with community
5. Implement fixes

### Treasury Emergency
1. Freeze treasury operations
2. Secure remaining funds
3. Investigate the issue
4. Execute recovery procedures
5. Update security measures

## Cost Estimates

### Deployment Costs
- LXON Token deployment: ~0.1-0.2 ETH
- Buyback contract deployment: ~0.05-0.1 ETH
- Configuration transactions: ~0.01-0.02 ETH
- **Total:** ~0.2-0.3 ETH

### Operational Costs
- Daily emissions: ~0.001-0.005 ETH/day
- Buyback executions: ~0.01-0.05 ETH/execution
- Staking operations: ~0.001-0.003 ETH/operation
- **Monthly estimate:** ~0.1-0.5 ETH

## Legal and Compliance

### Considerations
- Consult with legal counsel
- Ensure compliance with local regulations
- Consider tax implications
- Implement KYC/AML if required
- Document all operations

## Support and Resources

### Documentation
- Contract documentation
- API documentation
- User guides
- Developer guides

### Community
- Discord/Telegram channels
- Twitter updates
- Blog posts
- Community calls

### Professional Support
- Security audits
- Legal counsel
- Tax advisors
- Technical support

## Deployment Checklist

### Pre-Deployment
- [ ] Security setup complete
- [ ] Infrastructure configured
- [ ] Treasury set up
- [ ] Contracts audited
- [ ] Testnet verified
- [ ] Gas optimized
- [ ] Emergency plans ready

### Deployment
- [ ] Environment configured
- [ ] Account funded
- [ ] Script reviewed
- [ ] Safety checks passed
- [ ] Deployment executed
- [ ] Contracts verified
- [ ] Etherscan verified

### Post-Deployment
- [ ] Mock USDC replaced
- [ ] Multi-sig configured
- [ ] Treasury funded
- [ ] Monitoring set up
- [ ] Testing completed
- [ ] Documentation updated
- [ ] Community notified

## Contact and Support

For mainnet deployment support:
- Technical issues: Contact development team
- Security concerns: Contact security team
- Emergency situations: Use emergency contact procedures
- General questions: Community channels

---

**Remember:** Mainnet deployment is irreversible. Take your time, verify everything, and proceed with caution.

**Last Updated:** August 26, 2026
