# Mainnet Security Setup Guide

This guide provides step-by-step instructions for completing the critical security prerequisites for mainnet deployment.

## Task 1: Set up Infura/Alchemy Account for Mainnet RPC

### Option A: Infura Setup

1. **Create Infura Account**
   - Go to https://infura.io
   - Click "Sign Up" and create an account
   - Verify your email address

2. **Create New Project**
   - Navigate to dashboard
   - Click "Create New Project"
   - Name it "LXON Mainnet"
   - Select "Ethereum" as network
   - Click "Create"

3. **Get Project ID**
   - Open your project
   - Copy the "Project ID"
   - This will be your `INFURA_API_KEY`

4. **Get Mainnet Endpoint**
   - In your project, go to "Endpoints"
   - Select "Ethereum" → "Mainnet"
   - Copy the HTTPS endpoint URL
   - Format: `https://mainnet.infura.io/v3/YOUR_PROJECT_ID`

### Option B: Alchemy Setup

1. **Create Alchemy Account**
   - Go to https://www.alchemy.com
   - Click "Sign Up" and create an account
   - Verify your email address

2. **Create New App**
   - Navigate to dashboard
   - Click "Create App"
   - Name it "LXON Mainnet"
   - Select "Ethereum" as chain
   - Select "Mainnet" as network
   - Click "Create App"

3. **Get API Key**
   - Open your app
   - Copy the "API Key"
   - This will be your `ALCHEMY_API_KEY`

4. **Get Mainnet Endpoint**
   - In your app, copy the HTTPS endpoint URL
   - Format: `https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY`

### Configure in .env

```bash
# For Infura
MAINNET_RPC_URL=https://mainnet.infura.io/v3/YOUR_PROJECT_ID
INFURA_API_KEY=YOUR_PROJECT_ID

# For Alchemy
MAINNET_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY
```

---

## Task 2: Create Gnosis Safe Multi-Sig Treasury

### Prerequisites
- MetaMask or other Web3 wallet installed
- At least 3 trusted wallet addresses (owners)
- ETH for gas fees (~0.01 ETH)

### Step-by-Step Setup

1. **Access Gnosis Safe**
   - Go to https://app.safe.global
   - Connect your wallet (MetaMask)
   - Ensure you're on Ethereum Mainnet

2. **Create New Safe**
   - Click "Create new Safe"
   - Select "Ethereum Mainnet" as network
   - Name your Safe (e.g., "LXON Treasury")
   - Click "Continue"

3. **Configure Owners**
   - Add at least 3 owner addresses
   - These should be trusted team members or hardware wallets
   - Recommended: 3-5 owners
   - Click "Continue"

4. **Set Threshold**
   - Choose confirmation threshold
   - Recommended: 2/3 or 3/5
   - This means 2 out of 3 owners must approve transactions
   - Click "Continue"

5. **Review and Deploy**
   - Review all settings
   - Click "Create"
   - Confirm transaction in your wallet
   - Wait for deployment (1-2 minutes)

6. **Copy Safe Address**
   - Once deployed, copy the Safe address
   - This will be your `TREASURY_ADDRESS`

### Fund the Treasury

1. **Send ETH to Treasury**
   - Send 0.1-0.5 ETH for gas fees
   - From your wallet to the Safe address

2. **Send USDC to Treasury**
   - Get USDC address: `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48`
   - Send 100,000 - 1,000,000 USDC to Safe
   - This will be used for buyback operations

### Configure in .env

```bash
TREASURY_ADDRESS=0xYourGnosisSafeAddress
```

---

## Task 3: Configure .env with Real Credentials

### Security Best Practices

1. **Never commit .env to git**
   - Ensure `.env` is in `.gitignore`
   - Never share your private key
   - Use environment-specific .env files

2. **Use Hardware Wallet**
   - Export private key from hardware wallet
   - Store securely (password manager, encrypted file)
   - Never store in plain text

3. **Generate Deployment Key**
   ```bash
   # Generate new account
   npx hardhat account generate
   
   # Or use existing wallet
   # Export private key from MetaMask/hardware wallet
   ```

### .env Configuration Template

```bash
# ⚠️  SECURITY WARNING ⚠️
# Never commit this file to version control
# Keep your private key secure at all times

# Deployer Private Key (from hardware wallet or generated)
PRIVATE_KEY=your_actual_private_key_here

# Mainnet RPC URL (from Infura or Alchemy)
MAINNET_RPC_URL=https://mainnet.infura.io/v3/YOUR_PROJECT_ID

# Infura API Key
INFURA_API_KEY=YOUR_PROJECT_ID

# Etherscan API Key (for contract verification)
ETHERSCAN_API_KEY=your_etherscan_api key

# Gnosis Safe Treasury Address
TREASURY_ADDRESS=0xYourGnosisSafeAddress
```

### How to Get Etherscan API Key

1. **Create Etherscan Account**
   - Go to https://etherscan.io
   - Click "Sign Up" and create account
   - Verify email

2. **Get API Key**
   - Navigate to API Keys section
   - Click "Add"
   - Name it "LXON Deployment"
   - Copy the API Key

---

## Task 4: Complete Professional Security Audit

### Recommended Audit Firms

1. **CertiK**
   - Website: https://www.certik.com
   - Specialization: Smart contract security
   - Cost: $5,000 - $50,000+
   - Timeline: 2-6 weeks

2. **Trail of Bits**
   - Website: https://www.trailofbits.com
   - Specialization: Security auditing
   - Cost: $10,000 - $100,000+
   - Timeline: 4-8 weeks

3. **OpenZeppelin**
   - Website: https://www.openzeppelin.com
   - Specialization: Smart contract security
   - Cost: $15,000 - $75,000+
   - Timeline: 3-6 weeks

4. **ConsenSys Diligence**
   - Website: https://consensys.net/diligence
   - Specialization: Ethereum security
   - Cost: $20,000 - $100,000+
   - Timeline: 4-8 weeks

### Audit Process

1. **Preparation**
   - Gather all contract files
   - Prepare documentation
   - Create test suite
   - Document architecture

2. **Selection**
   - Choose audit firm based on budget and timeline
   - Contact firm for quote
   - Sign agreement

3. **Audit Execution**
   - Firm reviews code
   - Identifies vulnerabilities
   - Provides recommendations
   - May require multiple rounds

4. **Remediation**
   - Fix identified issues
   - Re-submit for verification
   - Obtain audit report

5. **Publication**
   - Publish audit report
   - Add to documentation
   - Share with community

### Self-Audit Checklist

Before professional audit, complete this self-audit:

#### Code Review
- [ ] No hardcoded private keys
- [ ] No unchecked return values
- [ ] No reentrancy vulnerabilities
- [ ] No integer overflow/underflow
- [ ] Proper access control
- [ ] Safe math operations
- [ ] Emergency stop mechanisms

#### Testing
- [ ] Unit tests for all functions
- [ ] Integration tests
- [ ] Edge case testing
- [ ] Gas optimization tests
- [ ] Security scenario tests

#### Documentation
- [ ] NatSpec comments complete
- [ ] Architecture documented
- [ ] Security considerations documented
- [ ] Emergency procedures documented

### Audit Report Template

Once audit is complete, you should receive:
- Executive summary
- Vulnerability findings (critical, high, medium, low)
- Code review findings
- Recommendations
- Remediation steps
- Final audit certificate

---

## Deployment Readiness Checklist

### Infrastructure ✅
- [x] Mainnet deployment script created
- [x] Security guide created
- [ ] Infura/Alchemy account set up
- [ ] RPC endpoint configured
- [ ] Etherscan API key obtained
- [ ] .env configured with credentials

### Security ✅
- [x] Deployment guide created
- [ ] Hardware wallet obtained
- [ ] Private key secured
- [ ] Gnosis Safe created
- [ ] Treasury funded
- [ ] Multi-sig configured

### Audit ✅
- [x] Self-audit checklist created
- [ ] Professional audit firm selected
- [ ] Audit contract signed
- [ ] Audit completed
- [ ] Issues remediated
- [ ] Audit report obtained

### Testing ✅
- [x] Testnet deployment successful
- [x] Tokenomics verified on testnet
- [x] Burn fee tested
- [x] Staking tested
- [x] Buyback tested
- [ ] Additional testnet scenarios

### Documentation ✅
- [x] User guide created
- [x] Deployment guide created
- [x] Mainnet setup guide created
- [ ] Audit report added
- [ ] Emergency procedures documented
- [ ] Community communication plan

---

## Post-Setup Verification

Once all tasks are complete, verify:

1. **Network Configuration**
   ```bash
   npx hardhat run scripts/check-network.ts --network mainnet
   ```

2. **Account Balance**
   ```bash
   npx hardhat run scripts/check-balance.ts --network mainnet
   ```

3. **Treasury Setup**
   - Verify Gnosis Safe is operational
   - Check treasury balance
   - Test multi-sig transaction

4. **Configuration**
   - Verify .env is not committed
   - Check all credentials are correct
   - Test RPC connection

---

## Cost Estimates

### Infrastructure Setup
- Infura/Alchemy: Free tier available, paid tiers from $50/month
- Gnosis Safe: Free to create, gas fees for deployment (~$10-20)
- Treasury funding: 100,000+ USDC + 0.5 ETH

### Security Audit
- Basic audit: $5,000 - $15,000
- Comprehensive audit: $20,000 - $50,000
- Premium audit: $50,000 - $100,000+

### Deployment Costs
- Contract deployment: ~$50-200 in gas
- Configuration: ~$10-50 in gas
- Initial operations: ~$20-100 in gas

---

## Timeline Estimate

### Setup Tasks
- Infura/Alchemy setup: 1-2 hours
- Gnosis Safe creation: 1-2 hours
- .env configuration: 30 minutes
- Treasury funding: 1-2 hours

### Audit Process
- Firm selection: 1-2 days
- Contract signing: 1-3 days
- Audit execution: 2-6 weeks
- Remediation: 1-2 weeks
- Final report: 1 week

**Total Setup Time:** 1 day (excluding audit)
**Total Audit Time:** 4-8 weeks

---

## Support Resources

### Infura Support
- Documentation: https://docs.infura.io
- Support: https://infura.io/support

### Alchemy Support
- Documentation: https://docs.alchemy.com
- Support: https://www.alchemy.com/support

### Gnosis Safe Support
- Documentation: https://help.safe.global
- Support: https://safe.global/support

### Audit Firms
- Contact each firm directly for quotes and timelines

---

## Next Steps After Setup

Once all setup tasks are complete:

1. **Verify Configuration**
   - Test RPC connection
   - Verify account access
   - Check treasury setup

2. **Run Pre-Deployment Tests**
   - Execute deployment script in test mode
   - Verify all safety checks
   - Test with small amounts

3. **Execute Mainnet Deployment**
   - Run deployment script
   - Monitor gas costs
   - Verify contract addresses

4. **Post-Deployment Verification**
   - Verify on Etherscan
   - Test all functions
   - Monitor initial operations

---

**Remember:** These setup tasks are critical for mainnet security. Take your time and complete each step thoroughly before proceeding with deployment.

**Last Updated:** August 26, 2026
