# LXON Tokenomics Production Deployment Guide

## 🚀 Production Deployment to Arbitrum Mainnet

### Prerequisites

- [ ] Security audit completed
- [ ] All critical/high issues addressed
- [ ] Audit certificate obtained
- [ ] Multi-sig treasury deployed
- [ ] Production environment configured
- [ ] Mainnet ETH for deployment
- [ ] Monitoring systems ready
- [ ] Emergency procedures documented

### Network Configuration

**Target Network:** Arbitrum Mainnet
- **Chain ID:** 42161
- **RPC URL:** https://arb1.arbitrum.io/rpc
- **Explorer:** https://arbiscan.io/
- **Native Token:** ETH

### Deployment Checklist

#### Phase 1: Pre-Deployment (1-2 days)

**Environment Setup**
- [ ] Configure production `.env` file
- [ ] Verify RPC endpoint connectivity
- [ ] Check deployer wallet balance (need ~0.5-1 ETH)
- [ ] Verify private key security
- [ ] Set up monitoring dashboards
- [ ] Configure alerting systems

**Contract Verification**
- [ ] Verify contract code matches audited version
- [ ] Verify constructor parameters
- [ ] Verify deployment script configuration
- [ ] Test deployment on local fork
- [ ] Verify gas estimates

**Multi-Sig Setup**
- [ ] Deploy Gnosis Safe on Arbitrum mainnet
- [ ] Configure 3-5 trusted signers
- [ ] Set threshold to 3 signatures
- [ ] Fund multi-sig with ETH for operations
- [ ] Test multi-sig operations

#### Phase 2: Deployment (1 day)

**Step 1: Deploy LXON Native Token**
```bash
cd /Users/adikamble/LXON/LXON/apps/contracts

# Deploy to Arbitrum mainnet
npx hardhat run scripts/deploy-lxon-mainnet.ts --network arbitrum
```

**Expected Output:**
- LXON Token address
- Base Token address
- Buyback and Burn address
- Treasury address
- Gas cost: ~0.1-0.3 ETH

**Step 2: Verify Deployment**
```bash
# Verify contracts on Arbiscan
# Check contract addresses
# Verify constructor parameters
# Confirm contract initialization
```

**Step 3: Configure Multi-Sig**
```bash
# Update LXON contract with multi-sig address
# Update Buyback contract with multi-sig treasury
# Transfer ownership to multi-sig
# Verify multi-sig controls
```

**Step 4: Fund Treasury**
```bash
# Transfer initial treasury funds to multi-sig
# Configure buyback parameters
# Test buyback execution
# Verify treasury operations
```

#### Phase 3: Post-Deployment (1-2 days)

**Verification**
- [ ] Verify all contracts deployed correctly
- [ ] Verify contract addresses on explorer
- [ ] Verify constructor parameters
- [ ] Test basic operations (transfer, stake, etc.)
- [ ] Verify multi-sig functionality
- [ ] Verify treasury operations

**Monitoring Setup**
- [ ] Set up transaction monitoring
- [ ] Configure balance alerts
- [ ] Set up event monitoring
- [ ] Configure anomaly detection
- [ ] Set up notification systems

**Documentation**
- [ ] Document deployment addresses
- [ ] Document deployment parameters
- [ ] Create operator manual
- [ ] Document emergency procedures
- [ ] Update public documentation

### Deployment Script Configuration

**Environment Variables (.env)**
```bash
# Arbitrum Mainnet
ARBITRUM_RPC_URL=https://arb1.arbitrum.io/rpc
PRIVATE_KEY=your_private_key_here

# Multi-Sig Configuration
MULTI_SIG_ADDRESS=your_gnosis_safe_address

# Treasury Configuration
TREASURY_ADDRESS=your_multi_sig_address
INITIAL_TREASURY_AMOUNT=1000000
```

**Hardhat Configuration**
```typescript
arbitrum: {
  url: process.env.ARBITRUM_RPC_URL || 'https://arb1.arbitrum.io/rpc',
  accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
  chainId: 42161,
  timeout: 300_000 // 5 minutes for mainnet
}
```

### Gas Cost Estimates

**Contract Deployment:**
- LXON Native Token: ~0.05-0.1 ETH
- ERC20Mock (Base Token): ~0.02-0.05 ETH
- Buyback and Burn: ~0.03-0.08 ETH
- Configuration transactions: ~0.01-0.02 ETH
- **Total Deployment:** ~0.1-0.25 ETH

**Operations:**
- Transfer: ~0.0001 ETH
- Stake: ~0.0002 ETH
- Unstake: ~0.0002 ETH
- Buyback: ~0.0003 ETH

**Recommended Budget:** 1-2 ETH for deployment + operations

### Security Considerations

**Pre-Deployment:**
- Use hardware wallet for deployer key
- Verify contract bytecode matches audited version
- Test on local fork before mainnet
- Have emergency rollback plan
- Set up monitoring before deployment

**During Deployment:**
- Monitor transaction status
- Verify gas prices are reasonable
- Confirm contract addresses
- Check for any errors
- Have team on standby

**Post-Deployment:**
- Verify all functions work correctly
- Monitor for unusual activity
- Set up alerts for critical events
- Document all addresses and parameters
- Prepare incident response plan

### Rollback Procedures

**If Deployment Fails:**
1. Stop all operations
2. Identify failure point
3. Fix the issue
4. Re-deploy to new addresses
5. Update configuration
6. Verify new deployment

**If Critical Bug Found:**
1. Pause contract operations (if possible)
2. Assess impact
3. Prepare fix
4. Coordinate with multi-sig
5. Deploy fix
6. Migrate users (if needed)

### Monitoring Configuration

**Key Metrics to Monitor:**
- Total supply
- Daily emission
- Total burned
- Total staked
- Treasury balance
- Transaction volume
- Gas costs
- Error rates

**Alert Thresholds:**
- Treasury balance < 10% of initial
- Daily emission deviation > 5%
- Unusual transaction patterns
- Failed transactions > 1%
- Gas costs > 2x normal

**Monitoring Tools:**
- Arbiscan API
- Custom monitoring scripts
- Alerting systems (PagerDuty, Slack, etc.)
- Dashboard analytics

### Verification Steps

**Contract Verification:**
1. Check contract addresses on Arbiscan
2. Verify contract source code
3. Verify constructor parameters
4. Check contract initialization
5. Verify multi-sig integration

**Functional Testing:**
1. Test token transfer
2. Test staking operations
3. Test burn fee application
4. Test buyback execution
5. Test multi-sig operations

**Integration Testing:**
1. Test contract interactions
2. Test external integrations
3. Test monitoring systems
4. Test alerting systems
5. Test emergency procedures

### Post-Deployment Tasks

**Immediate (24 hours):**
- [ ] Monitor all transactions
- [ ] Verify all functions work
- [ ] Check for any errors
- [ ] Verify treasury operations
- [ ] Test multi-sig controls

**Short-term (1 week):**
- [ ] Optimize gas usage
- [ ] Improve monitoring
- [ ] Update documentation
- [ ] Train operators
- [ ] Set up regular audits

**Long-term (1 month):**
- [ ] Review performance
- [ ] Optimize operations
- [ ] Update security measures
- [ ] Plan upgrades
- [ ] Prepare for scaling

### Emergency Contacts

**Technical Team:**
- Lead Developer: [Name, Email, Phone]
- Smart Contract Engineer: [Name, Email, Phone]
- DevOps Engineer: [Name, Email, Phone]

**Security Team:**
- Security Lead: [Name, Email, Phone]
- Audit Firm Contact: [Name, Email, Phone]

**Management:**
- Project Manager: [Name, Email, Phone]
- Executive Sponsor: [Name, Email, Phone]

### Success Criteria

**Deployment Success:**
- [ ] All contracts deployed without errors
- [ ] All contracts verified on explorer
- [ ] All functions working correctly
- [ ] Multi-sig operational
- [ ] Treasury configured
- [ ] Monitoring active

**Operational Success:**
- [ ] No critical bugs found
- [ ] Gas costs within estimates
- [ ] No unusual activity
- [ ] All alerts working
- [ ] Team trained
- [ ] Documentation complete

### Timeline

**Pre-Deployment:** 1-2 days
**Deployment:** 1 day
**Post-Deployment:** 1-2 days
**Total:** 3-5 days

### Cost Summary

**Deployment Costs:**
- Gas fees: 0.1-0.25 ETH
- Multi-sig setup: 0.01-0.05 ETH
- Treasury funding: Variable
- **Total:** 0.11-0.3 ETH + treasury

**Operational Costs:**
- Monthly gas: 0.01-0.05 ETH
- Monitoring tools: $50-200/month
- **Total:** $100-500/month

### Next Steps

1. **Complete Security Audit**
   - Address all findings
   - Obtain audit certificate
   - Update contracts if needed

2. **Deploy Multi-Sig Treasury**
   - Deploy Gnosis Safe
   - Configure signers
   - Fund treasury

3. **Execute Production Deployment**
   - Follow this guide
   - Monitor deployment
   - Verify operations

4. **Launch Operations**
   - Activate monitoring
   - Train team
   - Begin operations

---

**Last Updated:** August 28, 2026
**Version:** 1.0
**Status:** Ready for Production
