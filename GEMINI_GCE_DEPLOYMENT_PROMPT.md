# Gemini Prompt for GCE AMM Deployment

**Copy and paste this prompt into Gemini to deploy the AMM contract on Google Cloud:**

---

I need to deploy the SimpleSwap AMM contract to my Google Cloud Platform instance where the LXON blockchain is running. The git repository has been updated with the new AMM contract and deployment scripts.

## Context:
- **Git Repository**: https://github.com/Demon723/CRYPTO.git
- **Latest Commit**: 553fd38 - "Add SimpleSwap AMM contract and deployment infrastructure"
- **LXON Token Address**: 0x7A0F16bE284ad1F7bF158668704C6Ca9e44f2D00 (already deployed)
- **Deployment Account**: 0x14c870D65A513d3e01e8D0Bfd4115979a9cB6976
- **Private Key**: 0xb61156c1ec13e33b775e5f7bfb1054ed640cbe71472f6dcf0060e778db4824f8

## What's New in the Repository:
- **SimpleSwap.sol**: Simplified AMM contract for LXON token trading
- **deploy-swap-production.ts**: Deployment script for AMM contract
- **deploy-amm-gce.sh**: Shell script for GCE deployment
- **verify-deployment.ts**: Script to verify deployed contracts

## Current Setup:
- LXON blockchain node is running on GCE instance
- LXON token contract is already deployed at 0x7A0F16bE284ad1F7bF158668704C6Ca9e44f2D00
- Blockchain RPC endpoint is available at http://localhost:8545 on the GCE instance

## Required Steps:

### 1. SSH into GCE Instance
- Use Google Cloud Console SSH or gcloud compute ssh
- Instance name: lxon-blockchain-node
- Zone: asia-south-1 (or the zone where your instance is located)

### 2. Pull Latest Changes
```bash
cd /path/to/LXON
git pull origin main
```

### 3. Deploy AMM Contract
```bash
cd /path/to/LXON
./deploy-amm-gce.sh
```

This script will:
- Create .env file with deployment credentials
- Install dependencies if needed
- Compile contracts
- Deploy SimpleSwap AMM contract
- Save deployment information

### 4. Add Liquidity to Trading Pool
After AMM deployment, I need to add initial liquidity:
- Provide LXON tokens to the pool
- Provide native tokens (satoshis) to the pool
- This enables trading between LXON and native tokens

### 5. Test Trading Functionality
- Test swap operations
- Verify price calculations
- Ensure AMM is working correctly

## AMM Contract Details:
- **Contract Name**: SimpleSwap
- **Trading Pair**: LXON ↔ Native Token (satoshis)
- **Fee Rate**: 0.3% (30/10000)
- **Formula**: Constant product (x * y = k)
- **Features**: Add/remove liquidity, swap tokens, price quotes

## Please Provide:
1. Exact commands to SSH into the GCE instance
2. Step-by-step commands to pull latest changes
3. Commands to deploy the AMM contract
4. How to add liquidity to the trading pool
5. Commands to test the swap functionality
6. Troubleshooting steps if deployment fails
7. How to verify the AMM is working correctly

## Important Notes:
- The blockchain node should be running on port 8545
- The deployment script uses localhost:8545 as RPC endpoint
- Make sure the LXON blockchain node is running before deployment
- The deployment account should have sufficient native tokens for gas fees
- The LXON token contract must be accessible at the specified address

Please give me a complete, actionable guide with all the commands I need to run on the GCE instance to deploy the AMM contract and enable trading.
