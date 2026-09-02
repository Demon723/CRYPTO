# LXON Multi-Sig Treasury Setup Guide (Gnosis Safe)

## 🔐 Why Multi-Sig Treasury?

A multi-signature treasury provides:
- **Security**: Requires multiple approvals for critical operations
- **Decentralization**: No single point of failure
- **Governance**: Shared control among trusted parties
- **Transparency**: All transactions are visible on-chain
- **Recovery**: Key recovery through other signers

## 📋 Prerequisites

1. **Ethereum Wallet** - MetaMask or similar
2. **ETH for Gas** - ~0.1-0.5 ETH for deployment
3. **Trusted Signers** - 3-5 trusted addresses
4. **Gnosis Safe Account** - https://app.safe.global

## 🚀 Step-by-Step Setup

### 1. Choose Signers

**Recommended Signer Configuration:**
- **3-of-5 Multi-Sig** (3 signatures required out of 5)
- **Signers should include:**
  - Project founder(s)
  - Technical lead
  - Community representative
  - Legal/compliance officer
  - External advisor

**Signer Requirements:**
- Each signer must have their own Ethereum wallet
- Signers should be geographically distributed
- Signers must have secure key storage (hardware wallets recommended)
- Signers should be available for timely approvals

### 2. Deploy Gnosis Safe

#### Option A: Via Gnosis Safe Web App (Recommended)

1. **Visit** https://app.safe.global
2. **Connect** your Ethereum wallet (MetaMask)
3. **Select Network:**
   - For testing: Sepolia testnet
   - For production: Ethereum mainnet or selected L2
4. **Click "Create new Safe"**
5. **Name your Safe:** "LXON Treasury"
6. **Add Signers:**
   - Add 3-5 trusted Ethereum addresses
   - Set threshold to 3 (requires 3 signatures)
7. **Review and Deploy**
8. **Confirm transaction** in your wallet
9. **Wait for deployment** (~5-10 minutes)
10. **Copy Safe address** for configuration

#### Option B: Via CLI (Advanced)

```bash
# Install Gnosis Safe CLI
npm install -g @gnosis.pm/safe-cli

# Configure
safe-cli --network mainnet init

# Create Safe
safe-cli --network mainnet create \
  --threshold 3 \
  --owners 0xAddress1,0xAddress2,0xAddress3,0xAddress4,0xAddress5 \
  --name "LXON Treasury"
```

### 3. Configure LXON Contracts with Multi-Sig

#### Update LXONNativeToken Contract

```solidity
// In constructor or via function call
function setMultiSigWallet(address _multiSigWallet) external onlyOwner {
    multiSigWallet = _multiSigWallet;
    multiSigEnabled = true;
    emit MultiSigWalletChanged(multiSigWallet, _multiSigWallet);
    emit MultiSigEnabled(true);
}
```

#### Update LXONBuybackBurn Contract

```solidity
// Update treasury to multi-sig address
function updateTreasury(address _newTreasury) external onlyOwner {
    treasury = _newTreasury;
}
```

### 4. Fund the Multi-Sig Treasury

#### Transfer LXON Tokens to Safe

```bash
# Using ethers.js
const tx = await token.transfer(safeAddress, amount);
await tx.wait();
```

#### Transfer USDC/Other Base Tokens

```bash
# Using ethers.js
const tx = await usdc.transfer(safeAddress, amount);
await tx.wait();
```

#### Transfer ETH for Gas

```bash
# Using ethers.js
const tx = await deployer.sendTransaction({
    to: safeAddress,
    value: ethers.parseEther("0.5") // 0.5 ETH for gas
});
await tx.wait();
```

### 5. Configure Safe Settings

#### Enable Required Modules

1. **Open Safe App** - https://app.safe.global
2. **Select your Safe**
3. **Go to Settings → Apps**
4. **Enable modules:**
   - **Safe Transaction Service** - For transaction tracking
   - **Compound/Aave** - For yield generation (optional)
   - **Oracle** - For price feeds (if needed)

#### Set Spending Limits

1. **Go to Settings → Spending Limits**
2. **Set limits for:**
   - **Token Allowances** - Limit token spending per period
   - **ETH Spending** - Limit ETH spending for gas
   - **Time Period** - Daily, weekly, monthly limits

#### Configure Signer Policies

1. **Go to Settings → Policies**
2. **Set policies:**
   - **Required Confirmations** - Keep at 3
   - **Execution Time** - Set reasonable execution windows
   - **Fallback** - Configure emergency procedures

### 6. Test Multi-Sig Operations

#### Test Transaction Flow

1. **Create Transaction** in Safe app
2. **Add transaction details** (recipient, amount, data)
3. **Submit for signatures**
4. **Signers approve** (3 of 5)
5. **Execute transaction** once threshold reached
6. **Verify on Etherscan**

#### Test Emergency Procedures

1. **Test owner removal** (if needed)
2. **Test threshold change** (if needed)
3. **Test module activation/deactivation**
4. **Document recovery procedures**

### 7. Integrate with LXON Operations

#### Buyback Operations

```javascript
// Buyback transaction via multi-sig
const buybackTx = await buyback.executeBuyback({
    from: safeAddress,
    value: ethers.parseUnits("1000", 18) // 1000 USDC
});
```

#### Treasury Management

```javascript
// Treasury operations require multi-sig approval
const transferTx = await token.transfer(recipient, amount);
```

#### Parameter Updates

```javascript
// Critical parameter changes require multi-sig
const updateTx = await token.updateBurnFee(newFee);
```

## 🔍 Security Best Practices

### Key Management
- **Use Hardware Wallets** - Ledger, Trezor for signers
- **Distribute Keys** - Store keys in different locations
- **Backup Keys** - Secure backup procedures
- **Key Rotation** - Regular key rotation schedule

### Operational Security
- **Transaction Monitoring** - Monitor all Safe transactions
- **Alert Systems** - Set up alerts for large transactions
- **Regular Audits** - Quarterly security audits
- **Access Reviews** - Regular access privilege reviews

### Governance
- **Signer Onboarding** - Clear process for adding/removing signers
- **Decision Making** - Documented decision-making process
- **Transparency** - Public reporting of treasury operations
- **Compliance** - Ensure regulatory compliance

## 📊 Monitoring & Reporting

### Transaction Monitoring

```javascript
// Monitor Safe transactions
const safeTransactions = await safeService.getTransactions(safeAddress);
console.log('Recent transactions:', safeTransactions);
```

### Balance Monitoring

```javascript
// Monitor treasury balances
const lxonBalance = await token.balanceOf(safeAddress);
const usdcBalance = await usdc.balanceOf(safeAddress);
console.log('LXON Balance:', ethers.formatEther(lxonBalance));
console.log('USDC Balance:', ethers.formatUnits(usdcBalance, 18));
```

### Event Monitoring

```javascript
// Monitor critical events
token.on('Transfer', (from, to, value) => {
    if (to === safeAddress) {
        console.log('Tokens received by treasury:', ethers.formatEther(value));
    }
});
```

## 🚨 Emergency Procedures

### Lost Signer Access

1. **Immediate Actions:**
   - Remove compromised signer from Safe
   - Add new signer
   - Update threshold if needed
   - Rotate all keys

### Compromised Keys

1. **Emergency Response:**
   - Pause all operations
   - Move funds to new Safe
   - Investigate breach
   - Notify stakeholders

### Dispute Resolution

1. **Governance Process:**
   - Document dispute
   - Vote on resolution
   - Execute decision via multi-sig
   - Update governance rules

## 📋 Deployment Checklist

- [ ] Select 3-5 trusted signers
- [ ] Deploy Gnosis Safe on target network
- [ ] Configure Safe settings (threshold, modules, limits)
- [ ] Update LXON contracts with Safe address
- [ ] Transfer initial treasury funds to Safe
- [ ] Test transaction flow with signers
- [ ] Set up monitoring and alerting
- [ ] Document emergency procedures
- [ ] Train signers on Safe operations
- [ ] Establish governance processes

## 🎯 Recommended Configuration

**For Production:**
- **Network:** Ethereum mainnet or selected L2
- **Signers:** 5 trusted addresses
- **Threshold:** 3 signatures required
- **Modules:** Transaction service, optional yield protocols
- **Limits:** Daily spending limits, monthly withdrawal limits

**For Testing:**
- **Network:** Sepolia testnet
- **Signers:** 3 trusted addresses
- **Threshold:** 2 signatures required
- **Modules:** Transaction service only
- **Limits:** Minimal limits for testing

## 📚 Additional Resources

- **Gnosis Safe Documentation:** https://docs.safe.global
- **Gnosis Safe GitHub:** https://github.com/safe-global/safe-core-sdk
- **Ethereum Multi-Sig Best Practices:** https://ethereum.org/en/developers/docs/standards/tokens/erc-20
- **Hardware Wallet Security:** https://blog.ledger.com/why-hardware-wallets-matter

## ⚠️ Important Notes

1. **Never share private keys** - Even with other signers
2. **Test thoroughly** - Test all operations on testnet first
3. **Keep backups** - Secure backups of all configuration
4. **Stay updated** - Keep Safe software updated
5. **Monitor regularly** - Regular monitoring of treasury operations
6. **Plan for succession** - Plan for signer replacement
7. **Legal compliance** - Ensure all operations are compliant
8. **Insurance** - Consider treasury insurance options
