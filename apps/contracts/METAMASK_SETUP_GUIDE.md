# LXON MetaMask Setup Guide

This guide shows how to configure MetaMask to work with LXON tokens on EVM-compatible blockchains.

## Supported Networks

LXON can be deployed on any EVM-compatible blockchain:
- Ethereum Mainnet
- Polygon (MATIC)
- Binance Smart Chain (BSC)
- Arbitrum
- Optimism
- Sepolia Testnet
- Custom Networks

## Quick Setup

### Option 1: Automatic Network Addition

The LXON trading interface will automatically prompt you to add the network when you connect your wallet.

### Option 2: Manual Network Addition

#### Ethereum Sepolia Testnet

```json
{
  "chainId": "0xaa36a7",
  "chainName": "Sepolia Testnet",
  "nativeCurrency": {
    "name": "Sepolia Ether",
    "symbol": "ETH",
    "decimals": 18
  },
  "rpcUrls": ["https://sepolia.infura.io/v3/YOUR_INFURA_KEY"],
  "blockExplorerUrls": ["https://sepolia.etherscan.io"]
}
```

#### Polygon Mainnet

```json
{
  "chainId": "0x89",
  "chainName": "Polygon Mainnet",
  "nativeCurrency": {
    "name": "MATIC",
    "symbol": "MATIC",
    "decimals": 18
  },
  "rpcUrls": ["https://polygon-rpc.com"],
  "blockExplorerUrls": ["https://polygonscan.com"]
}
```

#### Binance Smart Chain

```json
{
  "chainId": "0x38",
  "chainName": "BNB Smart Chain",
  "nativeCurrency": {
    "name": "BNB",
    "symbol": "BNB",
    "decimals": 18
  },
  "rpcUrls": ["https://bsc-dataseed.binance.org"],
  "blockExplorerUrls": ["https://bscscan.com"]
}
```

## Adding LXON Token to MetaMask

### Method 1: Automatic (Recommended)

1. Connect your wallet to the LXON trading interface
2. Click "Add LXON Token" button
3. Confirm in MetaMask

### Method 2: Manual

#### Ethereum Sepolia Testnet

- **Contract Address**: (From deployment output)
- **Token Symbol**: LXON
- **Token Decimal**: 18

#### Polygon Mainnet

- **Contract Address**: (From deployment output)
- **Token Symbol**: LXON
- **Token Decimal**: 18

## Deployment Instructions

### Deploy on Sepolia Testnet

```bash
# Set environment variables
export PRIVATE_KEY=your_private_key
export SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY

# Deploy
npx hardhat run scripts/deploy-evm-compatible.ts --network sepolia
```

### Deploy on Polygon Mainnet

```bash
# Set environment variables
export PRIVATE_KEY=your_private_key
export POLYGON_RPC_URL=https://polygon-rpc.com

# Deploy
npx hardhat run scripts/deploy-evm-compatible.ts --network polygon
```

### Deploy on BSC

```bash
# Set environment variables
export PRIVATE_KEY=your_private_key
export BSC_RPC_URL=https://bsc-dataseed.binance.org

# Deploy
npx hardhat run scripts/deploy-evm-compatible.ts --network bsc
```

## Hardhat Configuration

Update your `hardhat.config.ts` to include the desired networks:

```typescript
import { HardhatUserConfig } from 'hardhat/config';

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.26',
  },
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || '',
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    polygon: {
      url: process.env.POLYGON_RPC_URL || '',
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    bsc: {
      url: process.env.BSC_RPC_URL || '',
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    arbitrum: {
      url: process.env.ARBITRUM_RPC_URL || '',
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    optimism: {
      url: process.env.OPTIMISM_RPC_URL || '',
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
};

export default config;
```

## Trading Interface

The updated trading interface automatically:
- Detects your wallet
- Adds the correct network
- Adds the LXON token
- Enables swapping

Visit the trading interface and click "Connect Wallet" to get started.

## Security Notes

1. **Never share your private key**
2. **Only use official MetaMask extension**
3. **Verify contract addresses on Etherscan**
4. **Test on testnet before mainnet**
5. **Keep your seed phrase secure**

## Troubleshooting

### Network Not Adding

- Ensure you're using the correct chain ID
- Check RPC URL is accessible
- Try adding network manually in MetaMask settings

### Token Not Adding

- Verify contract address is correct
- Check you're on the correct network
- Ensure token is ERC20 compliant

### Transaction Failing

- Check you have enough native tokens for gas
- Verify contract addresses
- Check network congestion

## Support

For issues with MetaMask setup:
- Check MetaMask support documentation
- Verify network configuration
- Review deployment logs
- Contact support@lxon.network

---

**Status**: LXON is now fully compatible with MetaMask and all EVM-compatible wallets! 🦊
