# LXON Tokenomics Testnet Deployment Guide (Free)

## 🚀 Free Testnet Deployment Strategy

Since mainnet deployment requires 0.1-0.2 ETH (~$50-100), we'll deploy on **Arbitrum Sepolia testnet** first, which is **completely free**.

**Benefits of Testnet Deployment:**
- ✅ Completely free (no real money needed)
- ✅ Test all functionality before mainnet
- ✅ Verify multi-sig setup
- ✅ Test tokenomics features
- ✅ Practice deployment process
- ✅ Ready for mainnet when funds available

**Testnet Network:**
- **Network:** Arbitrum Sepolia
- **Chain ID:** 421614
- **RPC:** https://sepolia-rollup.arbitrum.io/rpc
- **Explorer:** https://sepolia.arbiscan.io
- **Faucet:** Free ETH available

---

## 📋 Your Configuration (Testnet)

**Signer Addresses:**
- **Signer 1:** `0x7F715B7F78a7d1D63455F3e2Ec1fa31D516f9Ef3`
- **Signer 2:** `0x43410E73d2Ef4B2638BE10265e8BE3D2FDfFDc27`
- **Signer 3:** `0x936b266CF4d1819A038e626CD325D3Af9B97c23f`

**Configuration:**
- Network: Arbitrum Sepolia (Chain ID: 421614)
- Threshold: 2 of 3 signatures required
- Deployment Method: Gnosis Safe Web Interface

---

## 🚀 Step-by-Step Testnet Deployment

### Step 1: Connect MetaMask to Arbitrum Sepolia

1. **Open MetaMask**
   - Click the network dropdown
   - Select "Add Network" → "Add a network manually"
   - Enter Arbitrum Sepolia details:
     - Network Name: Arbitrum Sepolia
     - RPC URL: https://sepolia-rollup.arbitrum.io/rpc
     - Chain ID: 421614
     - Currency Symbol: ETH
     - Block Explorer URL: https://sepolia.arbiscan.io

2. **Verify Addresses**
   - Switch between your 3 MetaMask accounts
   - Verify the addresses match your configuration

### Step 2: Get Free Testnet ETH

**Option 1: Arbitrum Sepolia Faucet**
1. Visit https://faucet.quicknode.com/arbitrum/sepolia
2. Enter your wallet address (Signer 1): `0x7F715B7F78a7d1D63455F3e2Ec1fa31D516f9Ef3`
3. Solve CAPTCHA if required
4. Request testnet ETH (usually 0.1 ETH)
5. Wait for confirmation (~1-2 minutes)

**Option 2: Alchemy Sepolia Faucet**
1. Visit https://sepoliafaucet.com
2. Enter your wallet address
3. Request testnet ETH
4. Wait for confirmation

**Option 3: Multiple Faucets**
- Use multiple faucets to get more ETH
- Try https://faucet.sepolia.dev
- Try https://cloud.google.com/application/web3/faucet/ethereum/sepolia

**Verify Balance:**
- Check your MetaMask balance
- Should show 0.1+ ETH on Arbitrum Sepolia

### Step 3: Deploy Gnosis Safe on Testnet

1. **Visit Gnosis Safe**
   - Go to https://app.safe.global
   - Click "Create new Safe"

2. **Select Network**
   - Choose "Arbitrum Sepolia"

3. **Name Your Safe**
   - Enter name: "LXON Treasury Testnet Multi-Sig"

4. **Add Owners**
   - Add Signer 1: `0x7F715B7F78a7d1D63455F3e2Ec1fa31D516f9Ef3`
   - Add Signer 2: `0x43410E73d2Ef4B2638BE10265e8BE3D2FDfFDc27`
   - Add Signer 3: `0x936b266CF4d1819A038e626CD325D3Af9B97c23f`

5. **Set Threshold**
   - Set to "2 out of 3"

6. **Deploy**
   - Review configuration
   - Click "Create"
   - Confirm transaction in MetaMask
   - Wait for deployment (~2-5 minutes)

### Step 4: Deploy LXON Contracts on Testnet

1. **Update Environment Variables**
   ```bash
   # Add to .env file
   ARBITRUM_SEPOLIA_RPC_URL=https://sepolia-rollup.arbitrum.io/rpc
   MULTI_SIG_ADDRESS=[your_gnosis_safe_address]
   ```

2. **Deploy Contracts**
   ```bash
   npx hardhat run scripts/deploy-lxon-mainnet.ts --network arbitrumSepolia
   ```

3. **Verify Deployment**
   - Check contract addresses on Sepolia Arbiscan
   - Verify constructor parameters
   - Test basic operations

### Step 5: Test Multi-Sig Operations

1. **Create Test Transaction**
   - Use Gnosis Safe interface
   - Create a test transaction (send 0.001 ETH)
   - Sign with Signer 1
   - Sign with Signer 2
   - Execute transaction

2. **Verify Multi-Sig Works**
   - Confirm 2 signatures required
   - Test threshold enforcement
   - Verify all signers can sign

### Step 6: Test Tokenomics Features

1. **Test Token Operations**
   - Transfer tokens (test burn fee)
   - Stake tokens (test tiers)
   - Unstake tokens (test rewards)
   - Test emission schedule

2. **Test Buyback Mechanism**
   - Configure buyback parameters
   - Test manual burn
   - Verify buyback logic

---

## 📊 Testnet vs Mainnet Comparison

| Feature | Testnet (Free) | Mainnet (Paid) |
|---------|---------------|----------------|
| Cost | $0 | $50-100 |
| Network | Arbitrum Sepolia | Arbitrum Mainnet |
| Chain ID | 421614 | 42161 |
| ETH Value | Testnet ETH (free) | Real ETH ($3000+) |
| Explorer | Sepolia Arbiscan | Arbiscan |
| Purpose | Testing | Production |
| Security | Same code, test environment | Production security |

---

## 🎯 Testnet Benefits

**What You'll Accomplish:**
- ✅ Complete deployment process for free
- ✅ Test all smart contract functionality
- ✅ Verify multi-sig setup works
- ✅ Practice the deployment process
- ✅ Identify any issues before mainnet
- ✅ Save deployment configuration for mainnet
- ✅ Build confidence in the system

**What You'll Learn:**
- How Gnosis Safe deployment works
- How contract deployment works
- How multi-sig operations work
- Gas costs for each operation
- Potential issues to fix before mainnet

---

## 📝 Post-Testnet Planning

**After Successful Testnet Deployment:**

1. **Document Everything**
   - Save all contract addresses
   - Document gas costs
   - Note any issues found
   - Record successful procedures

2. **Prepare for Mainnet**
   - Same process, just different network
   - Need 0.1-0.2 ETH (~$50-100)
   - Use same configuration
   - Deploy when funds available

3. **Mainnet Deployment Options**
   - Save money and deploy later
   - Find funding sources
   - Consider crowdfunding
   - Use revenue from other projects

---

## 💡 Funding Options for Mainnet

**When Ready for Mainnet:**

**Low-Cost Options:**
- Save $50-100 over time
- Use revenue from other crypto projects
- Ask for community support
- Apply for grants

**Alternative Approaches:**
- Deploy on cheaper network (Polygon)
- Use single-signer initially (lower cost)
- Find sponsor/partner
- Use testnet for longer period

---

## 🚀 Next Steps

**Immediate (Free):**
1. Connect MetaMask to Arbitrum Sepolia
2. Get free testnet ETH from faucet
3. Deploy Gnosis Safe on testnet
4. Deploy contracts on testnet
5. Test all functionality

**Future (When Funds Available):**
1. Get 0.1-0.2 ETH for mainnet
2. Repeat deployment on Arbitrum mainnet
3. Launch production system

---

**Status:** ✅ **READY FOR FREE TESTNET DEPLOYMENT**

**Last Updated:** August 30, 2026
**Next Step:** Connect MetaMask to Arbitrum Sepolia and get free testnet ETH
**Estimated Time:** 30-60 minutes
**Estimated Cost:** $0 (completely free)
