# LXON Deployment Scripts Guide

**Version**: 1.0.0  
**Date**: 2024  
**Purpose**: Guide for using LXON deployment scripts

---

## 📋 Available Deployment Scripts

### Core Deployment Scripts

#### 1. deploy-lxon-decentralized.ts (Existing)
**Purpose**: Deploy LXONDecentralized, LXONDAO, LXONVesting together

**Usage**:
```bash
npx hardhat run scripts/deploy-lxon-decentralized.ts --network <network>
```

**Environment Variables**: None required (uses deployer account)

**What it does**:
- Deploys LXONDecentralized token contract
- Deploys LXONDAO with timelock controller
- Deploys LXONVesting contract
- Configures initial roles
- Saves deployment addresses

#### 2. deploy-lxon-vesting.ts (NEW)
**Purpose**: Deploy LXONVesting contract separately

**Usage**:
```bash
export LXON_TOKEN_ADDRESS=0x...
npx hardhat run scripts/deploy-lxon-vesting.ts --network <network>
```

**Environment Variables**:
- `LXON_TOKEN_ADDRESS`: Address of LXONDecentralized contract

**What it does**:
- Deploys LXONVesting contract
- Links to LXONDecentralized token
- Verifies vesting parameters

#### 3. deploy-lxon-dex.ts (NEW)
**Purpose**: Deploy LXONAMM (Native DEX) contract

**Usage**:
```bash
npx hardhat run scripts/deploy-lxon-dex.ts --network <network>
```

**Environment Variables**: None required

**What it does**:
- Deploys LXONAMM contract
- Sets initial fee rate
- Configures factory parameters

### Configuration Scripts

#### 4. configure-roles.ts (NEW)
**Purpose**: Configure governance and security roles

**Usage**:
```bash
export LXON_DECENTRALIZED_ADDRESS=0x...
export LXON_DAO_ADDRESS=0x...
export EMERGENCY_MULTISIG_ADDRESS=0x...
npx hardhat run scripts/configure-roles.ts --network <network>
```

**Environment Variables**:
- `LXON_DECENTRALIZED_ADDRESS`: Address of LXONDecentralized contract
- `LXON_DAO_ADDRESS`: Address of LXONDAO contract
- `EMERGENCY_MULTISIG_ADDRESS`: Address of emergency multisig (optional, defaults to deployer)

**What it does**:
- Grants GOVERNANCE_ROLE to DAO
- Grants EMITTER_ROLE to DAO
- Grants PAUSER_ROLE to emergency multisig
- Grants MINTER_ROLE to DAO
- Grants EMERGENCY_ROLE to emergency multisig

#### 5. add-council-members.ts (NEW)
**Purpose**: Add technical council members

**Usage**:
```bash
export LXON_DECENTRALIZED_ADDRESS=0x...
export COUNCIL_MEMBERS=0x...,0x...,0x...
npx hardhat run scripts/add-council-members.ts --network <network>
```

**Environment Variables**:
- `LXON_DECENTRALIZED_ADDRESS`: Address of LXONDecentralized contract
- `COUNCIL_MEMBERS`: Comma-separated list of council member addresses (optional)

**What it does**:
- Grants TECHNICAL_COUNCIL_ROLE to council members
- Sets council member status
- Verifies council configuration

#### 6. configure-emergency.ts (NEW)
**Purpose**: Configure emergency multisig

**Usage**:
```bash
export LXON_DECENTRALIZED_ADDRESS=0x...
export EMERGENCY_MEMBERS=0x...,0x...,0x...
npx hardhat run scripts/configure-emergency.ts --network <network>
```

**Environment Variables**:
- `LXON_DECENTRALIZED_ADDRESS`: Address of LXONDecentralized contract
- `EMERGENCY_MEMBERS`: Comma-separated list of emergency member addresses (optional)

**What it does**:
- Grants EMERGENCY_ROLE to emergency members
- Sets emergency admin status
- Configures emergency parameters (72h notice, 80% approval)

#### 7. transfer-governance.ts (NEW)
**Purpose**: Transfer governance to DAO

**Usage**:
```bash
export LXON_DECENTRALIZED_ADDRESS=0x...
export LXON_DAO_ADDRESS=0x...
npx hardhat run scripts/transfer-governance.ts --network <network>
```

**Environment Variables**:
- `LXON_DECENTRALIZED_ADDRESS`: Address of LXONDecentralized contract
- `LXON_DAO_ADDRESS`: Address of LXONDAO contract

**What it does**:
- Transfers DEFAULT_ADMIN_ROLE to DAO
- Revokes DEFAULT_ADMIN_ROLE from deployer
- Verifies governance transfer
- Confirms DAO control

### Testing Scripts

#### 8. check-balance.ts (NEW)
**Purpose**: Check account balance

**Usage**:
```bash
npx hardhat run scripts/check-balance.ts --network <network>
```

**Environment Variables**: None required

**What it does**:
- Checks deployer account balance
- Displays network information
- Useful for pre-deployment verification

#### 9. create-test-proposal.ts (NEW)
**Purpose**: Create test governance proposal

**Usage**:
```bash
export LXON_DAO_ADDRESS=0x...
export LXON_DECENTRALIZED_ADDRESS=0x...
npx hardhat run scripts/create-test-proposal.ts --network <network>
```

**Environment Variables**:
- `LXON_DAO_ADDRESS`: Address of LXONDAO contract
- `LXON_DECENTRALIZED_ADDRESS`: Address of LXONDecentralized contract

**What it does**:
- Creates test governance proposal
- Returns proposal ID
- For testing governance functionality

#### 10. vote-test-proposal.ts (NEW)
**Purpose**: Vote on test governance proposal

**Usage**:
```bash
export LXON_DAO_ADDRESS=0x...
export PROPOSAL_ID=123
export VOTE_OPTION=1
npx hardhat run scripts/vote-test-proposal.ts --network <network>
```

**Environment Variables**:
- `LXON_DAO_ADDRESS`: Address of LXONDAO contract
- `PROPOSAL_ID`: ID of proposal to vote on
- `VOTE_OPTION`: 0=Against, 1=For, 2=Abstain (default: 1)

**What it does**:
- Casts vote on proposal
- Displays voting power
- Shows current vote counts

#### 11. test-council-veto.ts (NEW)
**Purpose**: Test technical council veto

**Usage**:
```bash
export LXON_DECENTRALIZED_ADDRESS=0x...
export PROPOSAL_ID=0x...
export VETO_REASON="Test veto"
npx hardhat run scripts/test-council-veto.ts --network <network>
```

**Environment Variables**:
- `LXON_DECENTRALIZED_ADDRESS`: Address of LXONDecentralized contract
- `PROPOSAL_ID`: ID of proposal to veto
- `VETO_REASON`: Reason for veto (optional)

**What it does**:
- Tests technical council veto power
- Requires council member account
- Veto can block harmful proposals

---

## 🚀 Deployment Workflow

### Testnet Deployment Workflow

#### Step 1: Check Balance
```bash
npx hardhat run scripts/check-balance.ts --network sepolia
```

#### Step 2: Deploy Core Contracts
```bash
npx hardhat run scripts/deploy-lxon-decentralized.ts --network sepolia
```

#### Step 3: Deploy DEX
```bash
npx hardhat run scripts/deploy-lxon-dex.ts --network sepolia
```

#### Step 4: Configure Roles
```bash
export LXON_DECENTRALIZED_ADDRESS=0x...
export LXON_DAO_ADDRESS=0x...
export EMERGENCY_MULTISIG_ADDRESS=0x...
npx hardhat run scripts/configure-roles.ts --network sepolia
```

#### Step 5: Add Council Members
```bash
export LXON_DECENTRALIZED_ADDRESS=0x...
export COUNCIL_MEMBERS=0x...,0x...,0x...
npx hardhat run scripts/add-council-members.ts --network sepolia
```

#### Step 6: Configure Emergency
```bash
export LXON_DECENTRALIZED_ADDRESS=0x...
export EMERGENCY_MEMBERS=0x...,0x...,0x...
npx hardhat run scripts/configure-emergency.ts --network sepolia
```

#### Step 7: Test Governance
```bash
export LXON_DAO_ADDRESS=0x...
export LXON_DECENTRALIZED_ADDRESS=0x...
npx hardhat run scripts/create-test-proposal.ts --network sepolia

export LXON_DAO_ADDRESS=0x...
export PROPOSAL_ID=123
export VOTE_OPTION=1
npx hardhat run scripts/vote-test-proposal.ts --network sepolia
```

#### Step 8: Transfer Governance (After Testing)
```bash
export LXON_DECENTRALIZED_ADDRESS=0x...
export LXON_DAO_ADDRESS=0x...
npx hardhat run scripts/transfer-governance.ts --network sepolia
```

### Mainnet Deployment Workflow

Same as testnet, but use `--network mainnet` instead of `--network sepolia`.

---

## 📝 Environment Configuration

### Create .env File

```bash
# Hardhat configuration
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
MAINNET_RPC_URL=https://mainnet.infura.io/v3/YOUR_PROJECT_ID
PRIVATE_KEY=your_private_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key_here

# Contract addresses (set after deployment)
LXON_DECENTRALIZED_ADDRESS=0x...
LXON_DAO_ADDRESS=0x...
LXON_VESTING_ADDRESS=0x...
LXON_AMM_ADDRESS=0x...

# Governance configuration
EMERGENCY_MULTISIG_ADDRESS=0x...
COUNCIL_MEMBERS=0x...,0x...,0x...
EMERGENCY_MEMBERS=0x...,0x...,0x...

# Testing
PROPOSAL_ID=123
VOTE_OPTION=1
VETO_REASON="Test veto"
```

---

## 🔧 Troubleshooting

### Issue: Private Key Not Set
**Error**: `PRIVATE_KEY environment variable not set`

**Solution**:
```bash
export PRIVATE_KEY=your_private_key_here
```

### Issue: Contract Address Not Set
**Error**: `LXON_DECENTRALIZED_ADDRESS environment variable not set`

**Solution**:
```bash
export LXON_DECENTRALIZED_ADDRESS=0x...
```

### Issue: Insufficient Balance
**Error**: Transaction reverted or insufficient funds

**Solution**:
```bash
npx hardhat run scripts/check-balance.ts --network <network>
```

Get more ETH from faucet (testnet) or purchase ETH (mainnet).

### Issue: Role Not Granted
**Error**: Account doesn't have required role

**Solution**:
- Verify account has DEFAULT_ADMIN_ROLE
- Check role configuration
- Revoke and re-grant role if needed

---

## 📊 Script Status

| Script | Status | Purpose |
|--------|--------|---------|
| deploy-lxon-decentralized.ts | ✅ Existing | Core deployment |
| deploy-lxon-vesting.ts | ✅ NEW | Vesting deployment |
| deploy-lxon-dex.ts | ✅ NEW | DEX deployment |
| configure-roles.ts | ✅ NEW | Role configuration |
| add-council-members.ts | ✅ NEW | Council setup |
| configure-emergency.ts | ✅ NEW | Emergency setup |
| transfer-governance.ts | ✅ NEW | Governance transfer |
| check-balance.ts | ✅ NEW | Balance check |
| create-test-proposal.ts | ✅ NEW | Proposal creation |
| vote-test-proposal.ts | ✅ NEW | Proposal voting |
| test-council-veto.ts | ✅ NEW | Council veto test |

---

## 🎯 Best Practices

1. **Always check balance before deployment**
2. **Use environment variables for sensitive data**
3. **Test on testnet before mainnet**
4. **Verify contracts on Etherscan**
5. **Keep backup of deployment addresses**
6. **Use multisig for critical roles**
7. **Test governance before transferring**
8. **Monitor transactions during deployment**

---

## 📞 Support

For issues with deployment scripts:
- Check error messages carefully
- Verify environment variables
- Review contract addresses
- Check network configuration
- Contact support@lxon.network

---

**Status**: All deployment scripts ready for use!