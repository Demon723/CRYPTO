# Mainnet Deployment Checklist

Complete this checklist before deploying LXON to Polygon mainnet.

## ✅ Pre-Deployment Checklist

### 1. Smart Contract Readiness

- [ ] **Code Review Completed**
  - [ ] All contracts reviewed for security vulnerabilities
  - [ ] Gas optimization verified
  - [ ] No TODO comments or debug code
  - [ ] All functions have proper visibility modifiers
  - [ ] No hardcoded addresses or values

- [ ] **Testing Completed**
  - [ ] Unit tests passing (>90% coverage)
  - [ ] Integration tests passing
  - [ ] Manual testing on testnet completed
  - [ ] Edge cases tested
  - [ ] Reentrancy attacks tested
  - [ ] Overflow/underflow tested

- [ ] **Security Audit**
  - [ ] Professional security audit performed (recommended)
  - [ ] Slither scan completed
  - [ ] Mythril analysis completed
  - [ ] Known vulnerabilities addressed
  - [ ] Emergency pause functionality tested

### 2. Infrastructure Readiness

- [ ] **AWS EC2 Instance**
  - [ ] Instance launched and accessible (IP: 100.53.231.95)
  - [ ] SSH access working
  - [ ] Security group configured (ports 22, 80, 443, 8545, 8080)
  - [ ] Sufficient disk space (50GB+)
  - [ ] Instance type suitable for production (t3.small or higher)

- [ ] **Environment Setup**
  - [ ] Node.js installed (v20+)
  - [ ] npm installed
  - [ ] Hardhat installed
  - [ ] PM2 installed
  - [ ] Nginx installed
  - [ ] Git configured

- [ ] **Domain & SSL**
  - [ ] Domain name purchased (optional but recommended)
  - [ ] DNS configured to point to EC2 IP
  - [ ] SSL certificate obtained (Let's Encrypt)
  - [ ] HTTPS working

### 3. Wallet & Funding

- [ ] **Deployer Wallet**
  - [ ] Wallet created for deployment
  - [ ] Private key secured (never committed)
  - [ ] Wallet funded with sufficient MATIC for gas
  - [ ] Minimum 10 MATIC recommended for Polygon deployment

- [ ] **Liquidity Funding**
  - [ ] MATIC for initial liquidity pool (1 MATIC minimum)
  - [ ] LXON tokens for initial liquidity (10,000 LXON minimum)
  - [ ] Token sale funding (1,000,000 LXON)

- [ ] **Emergency Funds**
  - [ ] Additional MATIC for emergency operations
  - [ ] Multi-sig wallet configured (recommended)
  - [ ] Emergency pause address set

### 4. Configuration Files

- [ ] **Environment Variables**
  - [ ] `.env` file created with correct values
  - [ ] `POLYGON_RPC_URL` set to https://polygon-rpc.com
  - [ ] `CHAIN_ID` set to 137
  - [ ] `PRIVATE_KEY` set (never committed)
  - [ ] `DEPLOYER_ADDRESS` set
  - [ ] Token configuration correct
  - [ ] Liquidity configuration correct
  - [ ] Token sale configuration correct

- [ ] **Hardhat Configuration**
  - [ ] Polygon network configured in `hardhat.config.ts`
  - [ ] RPC URL correct
  - [ ] Chain ID correct (137)
  - [ ] Gas price configuration set

- [ ] **Trading Interface**
  - [ ] Contract addresses updated in `trading-interface.html`
  - [ ] RPC URL updated
  - [ ] Chain ID updated
  - [ ] Native currency updated (MATIC)
  - [ ] MetaMask integration tested

### 5. Deployment Scripts

- [ ] **Deployment Scripts Ready**
  - [ ] `deploy-evm-compatible.ts` exists and tested
  - [ ] `deploy-token-sale.ts` exists and tested
  - [ ] `add-native-liquidity.ts` exists and tested
  - [ ] All scripts compile without errors

- [ ] **Monitoring Scripts**
  - [ ] `monitor-ecosystem.ts` exists
  - [ ] `test-token-sale.ts` exists
  - [ ] Health check script created

### 6. Documentation

- [ ] **User Documentation**
  - [ ] User guide created
  - [ ] MetaMask setup guide created
  - [ ] Trading instructions created
  - [ ] FAQ created

- [ ] **Technical Documentation**
  - [ ] API documentation created
  - [ ] Contract documentation created
  - [ ] Deployment guide created
  - [ ] Troubleshooting guide created

### 7. Security Measures

- [ ] **Access Control**
  - [ ] Only owner can call critical functions
  - [ ] Multi-sig for large transfers
  - [ ] Time-locks for governance changes
  - [ ] Emergency pause functionality

- [ ] **Monitoring**
  - [ ] Monitoring system set up
  - [ ] Alerts configured
  - [ ] Log aggregation configured
  - [ ] Error tracking configured

### 8. Legal & Compliance

- [ ] **Legal Review**
  - [ ] Token sale terms reviewed
  - [ ] Privacy policy created
  - [ ] Terms of service created
  - [ ] Disclaimer added

- [ ] **Regulatory Compliance**
  - [ ] KYC/AML requirements assessed
  - [ ] Tax implications understood
  - [ ] Jurisdiction requirements met

## ✅ Deployment Readiness Check

### Before Starting Deployment

```bash
# 1. Verify AWS instance is accessible
ssh -i lxon-deployer2.pem ubuntu@100.53.231.95

# 2. Verify Node.js version
node --version  # Should be v20+

# 3. Verify npm version
npm --version

# 4. Verify Hardhat installation
npx hardhat --version

# 5. Verify PM2 installation
pm2 --version

# 6. Verify Git configuration
git config --list

# 7. Test network connectivity
curl https://polygon-rpc.com
```

### Environment Variables Check

```bash
# On AWS instance, verify .env file exists
cat apps/contracts/.env

# Should contain:
# POLYGON_RPC_URL=https://polygon-rpc.com
# CHAIN_ID=137
# PRIVATE_KEY=your_actual_private_key
# DEPLOYER_ADDRESS=your_deployer_address
# TOKEN_NAME=LXON
# TOKEN_SYMBOL=LXON
# INITIAL_SUPPLY=100000000000000000000000000
# INITIAL_LIQUIDITY_TOKEN=10000000000000000000000
# INITIAL_LIQUIDITY_NATIVE=1000000000000000000
# SALE_DURATION=2592000
# TOKEN_PRICE=100000000000000
# SALE_CAP=1000000000000000000000000
```

### Wallet Balance Check

```bash
# Check deployer wallet MATIC balance
npx hardhat run scripts/check-balance.ts --network polygon

# Should have at least 10 MATIC for deployment
```

### Contract Compilation Check

```bash
# On AWS instance
cd apps/contracts
npx hardhat compile

# Should compile without errors
```

## ⚠️ Critical Warnings

### DO NOT Deploy If:

- ❌ Private key is committed to git
- ❌ Environment variables are not set
- ❌ Wallet has insufficient funds
- ❌ Contracts have not been tested
- ❌ Security audit not completed
- ❌ Emergency controls not tested
- ❌ Monitoring not set up
- ❌ Documentation not ready

### STOP Deployment If:

- ❌ Any test fails during deployment
- ❌ Gas costs are unexpectedly high
- ❌ Contract addresses are not saved
- ❌ Verification fails on block explorer
- ❌ Any security concern arises

## ✅ Deployment Steps (After Checklist Complete)

1. **SSH into AWS instance**
   ```bash
   ssh -i lxon-deployer2.pem ubuntu@100.53.231.95
   ```

2. **Navigate to contracts directory**
   ```bash
   cd /var/www/lxon/apps/contracts
   ```

3. **Load environment variables**
   ```bash
   export $(cat .env | grep -v '^#' | xargs)
   ```

4. **Deploy to Polygon mainnet**
   ```bash
   npx hardhat run scripts/deploy-evm-compatible.ts --network polygon
   ```

5. **Verify deployment**
   ```bash
   cat deployments/137-evm-ecosystem.json
   ```

6. **Add liquidity**
   ```bash
   npx hardhat run scripts/add-native-liquidity.ts --network polygon
   ```

7. **Deploy token sale**
   ```bash
   npx hardhat run scripts/deploy-token-sale.ts --network polygon
   ```

8. **Verify on Polygonscan**
   - Check contract addresses
   - Verify source code
   - Monitor initial transactions

9. **Update trading interface**
   - Update contract addresses
   - Test MetaMask connection
   - Verify trading functionality

10. **Start monitoring**
    ```bash
    pm2 start ecosystem.config.js
    pm2 save
    ```

## 📊 Post-Deployment Verification

- [ ] All contracts deployed successfully
- [ ] Contract addresses saved and verified
- [ ] Liquidity pool created
- [ ] Token sale active
- [ ] Trading interface working
- [ ] MetaMask connection working
- [ ] Monitoring active
- [ ] No errors in logs
- [ ] Gas costs reasonable
- [ ] Block explorer verification complete

## 🚨 Emergency Rollback Plan

If deployment fails:

1. **Stop all services**
   ```bash
   pm2 stop all
   ```

2. **Revert to previous commit**
   ```bash
   git reset --hard <previous-commit-hash>
   ```

3. **Redeploy**
   ```bash
   ./deploy.sh
   ```

4. **Verify rollback**
   ```bash
   npx hardhat run scripts/monitor-ecosystem.ts --network polygon
   ```

## 📝 Deployment Log

**Deployment Date:** _______________

**Deployer:** _______________

**Wallet Address:** _______________

**Contract Addresses:**
- LXON Token: _______________
- SimpleSwap: _______________
- Token Sale: _______________

**Transaction Hashes:**
- Token Deployment: _______________
- Swap Deployment: _______________
- Token Sale Deployment: _______________
- Liquidity Addition: _______________

**Gas Costs:**
- Total MATIC spent: _______________
- USD equivalent: _______________

**Notes:**
_________________

**Issues Encountered:**
_________________

**Resolution:**
_________________

---

**Status:** Checklist Complete - Ready for Deployment ✅
