# Polygon Mainnet Deployment Guide

## 🎯 Overview

Deploy LXON tokenomics to Polygon mainnet - low gas fees, established ecosystem, fast transactions.

**Network Details:**
- **Network:** Polygon Mainnet
- **Chain ID:** 137
- **Currency:** MATIC
- **Gas Cost:** $1-5 total deployment
- **RPC URL:** https://polygon-rpc.com
- **Block Explorer:** https://polygonscan.com

---

## 📋 Prerequisites

### 1. Wallet Setup
- MetaMask wallet installed
- One of your 3 MetaMask addresses with MATIC
- **Recommended Address:** `0x7F715B7F78a7d1D63455F3e2Ec1fa31D516f9Ef3`

### 2. Required MATIC
- **Total Cost:** ~1-2 MATIC ($1-5 USD)
- **Breakdown:**
  - Gnosis Safe deployment: ~0.1 MATIC
  - LXON Token deployment: ~0.3 MATIC
  - Base Token deployment: ~0.2 MATIC
  - Buyback contract: ~0.2 MATIC
  - Buffer: ~0.2 MATIC

### 3. Environment Variables
Ensure `.env` file contains:
```env
PRIVATE_KEY=your_private_key_here
POLYGON_RPC_URL=https://polygon-rpc.com
POLYGONSCAN_API_KEY=your_polygonscan_api_key
```

---

## 🚀 Step-by-Step Deployment

### Step 1: Configure MetaMask for Polygon

1. **Add Polygon Network to MetaMask:**
   - Network Name: Polygon Mainnet
   - RPC URL: https://polygon-rpc.com
   - Chain ID: 137
   - Currency Symbol: MATIC
   - Block Explorer: https://polygonscan.com

2. **Import/Select Wallet:**
   - Use address: `0x7F715B7F78a7d1D63455F3e2Ec1fa31D516f9Ef3`
   - Ensure wallet has 1-2 MATIC

### Step 2: Get MATIC

**Option A: Buy on Exchange**
- Buy MATIC on Binance, Coinbase, or other exchange
- Transfer to your wallet address
- **Cost:** Exchange fees + gas

**Option B: Use Bridge**
- Bridge ETH from Ethereum to Polygon
- Use Polygon Bridge: https://bridge.polygon.technology
- **Cost:** Ethereum gas fees (~$5-10)

**Option C: Use Faucet (if available)**
- Check Polygon faucets for test MATIC
- Limited availability for mainnet

### Step 3: Deploy Gnosis Safe on Polygon

**Option A: Use Safe Web App**
1. Go to: https://app.safe.global/welcome
2. Select "Polygon" network
3. Click "Create new Safe"
4. Add your 3 signers:
   - `0x7F715B7F78a7d1D63455F3e2Ec1fa31D516f9Ef3`
   - `0x43410E73d2Ef4B2638BE10265e8BE3D2FDfFDc27`
   - `0x936b266CF4d1819A038e626CD325D3Af9B97c23f`
5. Set threshold: 2-of-3
6. Pay deployment fee (~0.1 MATIC)
7. Save the Safe address

**Option B: Use CLI**
```bash
npm install -g @safe-global/safe-cli
safe-cli --polygon
```

### Step 4: Update Deployment Script

Update `scripts/deploy-lxon-mainnet.ts` with Polygon Safe address:
```typescript
const multiSigAddress = "YOUR_POLYGON_SAFE_ADDRESS";
```

### Step 5: Deploy Contracts to Polygon

```bash
# Navigate to contracts directory
cd /Users/adikamble/LXON/LXON/apps/contracts

# Deploy to Polygon
npx hardhat run scripts/deploy-lxon-mainnet.ts --network polygon

# Save the deployed addresses
```

### Step 6: Verify Contracts on Polygonscan

```bash
# Verify LXON Token
npx hardhat verify --network polygon <LXON_ADDRESS> <MULTISIG_ADDRESS>

# Verify Base Token
npx hardhat verify --network polygon <BASE_TOKEN_ADDRESS>

# Verify Buyback Contract
npx hardhat verify --network polygon <BUYBACK_ADDRESS> <LXON_ADDRESS> <BASE_TOKEN_ADDRESS> <MULTISIG_ADDRESS>
```

---

## ✅ Post-Deployment Verification

### 1. Check Contract Status
```bash
# Check LXON Token balance
npx hardhat run scripts/check-balance.ts --network polygon

# Test basic functionality
npx hardhat run scripts/test-polygon-deployment.ts --network polygon
```

### 2. Verify on Polygonscan
- Visit: https://polygonscan.com
- Search for your contract addresses
- Verify contract code is verified
- Check deployment transactions

### 3. Test Multi-Sig
- Go to Safe app: https://app.safe.global
- Connect to Polygon network
- Verify all signers can connect
- Test a simple transaction

---

## 🔧 Polygon-Specific Considerations

### Gas Optimization
- Polygon has very low gas fees
- Use standard gas settings
- No need for aggressive gas optimization

### Block Time
- Polygon block time: ~2 seconds
- Faster confirmations than Ethereum
- Transactions confirm quickly

### Bridge Integration
- Consider integrating with Polygon Bridge
- Enable cross-chain functionality
- Future: Bridge to/from Ethereum

---

## 📊 Deployment Cost Breakdown

| Step | Cost (MATIC) | Cost (USD) |
|------|-------------|------------|
| Gnosis Safe | 0.1 | $0.05 |
| LXON Token | 0.3 | $0.15 |
| Base Token | 0.2 | $0.10 |
| Buyback Contract | 0.2 | $0.10 |
| Verification | 0.1 | $0.05 |
| Buffer | 0.2 | $0.10 |
| **Total** | **1.1** | **$0.55** |

*Note: Prices are estimates and may vary based on gas prices*

---

## 🛡️ Security Checklist

Before deploying to mainnet:

- [ ] Double-check contract addresses
- [ ] Verify multi-sig signers are correct
- [ ] Ensure threshold is 2-of-3
- [ ] Test on local network first
- [ ] Review deployment script
- [ ] Have backup of private keys
- [ ] Verify environment variables
- [ ] Check wallet has sufficient MATIC

---

## 🔄 Troubleshooting

### Issue: Insufficient MATIC
**Solution:** Buy more MATIC on exchange or bridge from Ethereum

### Issue: Transaction failed
**Solution:** Check gas price, increase gas limit, retry

### Issue: Contract verification failed
**Solution:** Check constructor arguments, try manual verification on Polygonscan

### Issue: Multi-sig not working
**Solution:** Verify all signers added correctly, check network selection

---

## 📝 Post-Deployment Tasks

1. **Document Addresses**
   - Save all deployed contract addresses
   - Update documentation
   - Share with team

2. **Fund Treasury**
   - Transfer initial MATIC to multi-sig
   - Fund buyback operations
   - Set up automated funding

3. **Monitor Network**
   - Set up monitoring tools
   - Track token metrics
   - Monitor gas usage

4. **Community Launch**
   - Announce deployment
   - Provide documentation
   - Set up support channels

---

## 🎉 Success Criteria

Deployment is successful when:
- ✅ All contracts deployed without errors
- ✅ Contracts verified on Polygonscan
- ✅ Multi-sig treasury operational
- ✅ Basic token functionality tested
- ✅ Gas costs within budget ($1-5)
- ✅ All addresses documented

---

## 📞 Support Resources

- **Polygon Docs:** https://docs.polygon.technology
- **Polygonscan:** https://polygonscan.com
- **Safe Docs:** https://docs.safe.global
- **Hardhat Docs:** https://hardhat.org/docs

---

**Last Updated:** September 2, 2026
**Network:** Polygon Mainnet (Chain ID: 137)
**Estimated Cost:** $0.55 - $2.00
**Difficulty:** Medium
