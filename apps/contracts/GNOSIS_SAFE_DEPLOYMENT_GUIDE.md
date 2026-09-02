# Gnosis Safe Deployment Guide - 3 Signers on Arbitrum Mainnet

## 🔐 Selected Wallet Addresses (User's Existing MetaMask)

**Signer Addresses:**
- **Signer 1:** `0x7F715B7F78a7d1D63455F3e2Ec1fa31D516f9Ef3`
- **Signer 2:** `0x43410E73d2Ef4B2638BE10265e8BE3D2FDfFDc27`
- **Signer 3:** `0x936b266CF4d1819A038e626CD325D3Af9B97c23f`

**Configuration:**
- Network: Arbitrum Mainnet (Chain ID: 42161)
- Threshold: 2 of 3 signatures required
- Deployment Method: Gnosis Safe Web Interface

---

## 📋 Pre-Deployment Checklist

**Before proceeding:**
- [ ] All 3 signer addresses verified in MetaMask
- [ ] Wallet has ETH for deployment costs (~0.1-0.2 ETH)
- [ ] MetaMask connected to Arbitrum mainnet
- [ ] Gnosis Safe web interface accessible

**⚠️ SECURITY WARNING:**
- Never share private keys or seed phrases
- Ensure MetaMask is secured with strong password
- For production, consider using hardware wallets instead of software wallets

---

## 🚀 Deployment Steps (Web Interface)

### Step 1: Connect Wallet to Arbitrum Mainnet

1. **Open MetaMask**
   - Click the network dropdown
   - Select "Add Network" → "Add a network manually"
   - Enter Arbitrum Mainnet details:
     - Network Name: Arbitrum One
     - RPC URL: https://arb1.arbitrum.io/rpc
     - Chain ID: 42161
     - Currency Symbol: ETH
     - Block Explorer URL: https://arbiscan.io

2. **Verify Addresses**
   - Switch between your 3 MetaMask accounts
   - Verify the addresses match:
     - Signer 1: `0x7F715B7F78a7d1D63455F3e2Ec1fa31D516f9Ef3`
     - Signer 2: `0x43410E73d2Ef4B2638BE10265e8BE3D2FDfFDc27`
     - Signer 3: `0x936b266CF4d1819A038e626CD325D3Af9B97c23f`

3. **Fund Wallet**
   - Ensure at least one wallet has 0.1-0.2 ETH for deployment costs
   - Transfer ETH to Signer 1 address: `0x7F715B7F78a7d1D63455F3e2Ec1fa31D516f9Ef3`

### Step 2: Deploy Gnosis Safe

1. **Visit Gnosis Safe**
   - Go to https://app.safe.global
   - Click "Create new Safe"

2. **Select Network**
   - Choose "Arbitrum One" (Arbitrum Mainnet)

3. **Name Your Safe**
   - Enter name: "LXON Treasury Multi-Sig"

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

### Step 3: Verify Deployment

1. **Check Safe Address**
   - Once deployed, note the Safe address
   - Verify on Arbiscan: https://arbiscan.io

2. **Test Multi-Sig**
   - Create a test transaction (e.g., send 0.001 ETH to yourself)
   - Sign with Signer 1
   - Sign with Signer 2
   - Execute transaction
   - Verify it executes successfully

### Step 4: Fund Multi-Sig

1. **Transfer ETH to Safe**
   - Transfer 0.1 ETH to the Safe address for operations
   - This will be used for gas fees for contract deployments

2. **Verify Balance**
   - Check Safe balance on Gnosis Safe interface
   - Ensure ETH is available for operations

---

## 📝 Post-Deployment Configuration

**Save This Information:**
- **Safe Address:** [To be filled after deployment]
- **Signer 1:** `0x7F715B7F78a7d1D63455F3e2Ec1fa31D516f9Ef3`
- **Signer 2:** `0x43410E73d2Ef4B2638BE10265e8BE3D2FDfFDc27`
- **Signer 3:** `0x936b266CF4d1819A038e626CD325D3Af9B97c23f`
- **Threshold:** 2 of 3
- **Network:** Arbitrum Mainnet (42161)

**Update Deployment Scripts:**
- Add Safe address to environment variables
- Update deployment scripts to use Safe as owner
- Configure contract parameters

---

## 🔒 Security Best Practices

**Key Management:**
- Store master mnemonic in secure password manager
- Consider using hardware wallet for production
- Never share mnemonic or private keys
- Regular security audits of key storage

**Multi-Sig Operations:**
- Always require 2 signatures for critical operations
- Document all multi-sig transactions
- Regular review of Safe activity
- Emergency procedures for lost keys

**Future Upgrades:**
- Consider expanding to 5 signers for additional security
- Implement time-locked operations for large transactions
- Add governance token voting for community input

---

## 🚀 Next Steps After Gnosis Safe Deployment

1. **Update Deployment Configuration**
   - Add Safe address to `.env` file
   - Modify deployment scripts to use Safe as owner

2. **Deploy LXON Contracts**
   - Deploy LXON Native Token with Safe as owner
   - Deploy Base Token
   - Deploy Buyback and Burn contract
   - Transfer ownership to Safe

3. **Configure Monitoring**
   - Set up transaction monitoring for Safe
   - Configure balance alerts
   - Set up event monitoring

4. **Launch**
   - Prepare community announcement
   - Execute launch strategy
   - Monitor initial operations

---

## 📞 Troubleshooting

**Deployment Fails:**
- Check wallet has sufficient ETH
- Verify network is Arbitrum Mainnet
- Check RPC connection
- Try again with higher gas limit

**Transaction Stuck:**
- Check gas price
- Verify network congestion
- Use higher gas price if needed

**Multi-Sig Issues:**
- Verify all signer addresses are correct
- Check threshold is set to 2
- Test with small transaction first

---

**Status:** ⏳ **READY FOR GNOSIS SAFE DEPLOYMENT**

**Last Updated:** August 30, 2026
**Next Step:** Deploy Gnosis Safe on Arbitrum Mainnet using web interface
**Estimated Time:** 15-30 minutes
**Estimated Cost:** 0.1-0.2 ETH (~$50-100)
