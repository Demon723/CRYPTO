# LXON Wallet Bridge

Cross-chain bridge for transferring LXON and supported tokens between chains.

## Supported Chains

- Ethereum (1)
- Optimism (10)
- Arbitrum One (42161)
- Polygon (137)
- BNB Smart Chain (56)
- Avalanche (43114)
- LXON (199)

## Supported Tokens

- LXON
- ETH
- USDC
- USDT
- WBTC
- MATIC
- BNB
- AVAX

## Architecture

```
Sender → Lock on Source Chain → Validator Confirmation → Mint on Destination Chain → Recipient
```

### Components

1. **Bridge Contracts**: Lock/mint/burn logic on each chain
2. **Validators**: Confirm cross-chain transfers
3. **Relayer**: Monitor source chain and relay messages
4. **Bridge Service**: Core business logic
5. **Bridge UI**: User interface in wallet app
6. **Bridge API**: Backend endpoints

## API Endpoints

```
GET    /bridge/chains          - Get supported chains
GET    /bridge/tokens          - Get supported tokens
POST   /bridge/transfer        - Initiate bridge transfer
GET    /bridge/transfer/:id    - Get transfer status
GET    /bridge/history/:addr   - Get transfer history
POST   /bridge/estimate-fee    - Estimate transfer fee
```

## Usage

```typescript
import { bridgeService } from '@lxon/bridge';

// Estimate fee
const fee = await bridgeService.estimateFee(199, 1, '100');

// Initiate transfer
const transfer = await bridgeService.initiateTransfer({
  fromChainId: 199,
  toChainId: 1,
  tokenSymbol: 'LXON',
  amount: '10',
  sender: '0x...',
  recipient: '0x...',
});

// Check status
const status = await bridgeService.getTransferStatus(transfer.id);

// Get history
const history = bridgeService.getTransferHistory('0x...');
```

## Security

- Multi-signature validator requirements
- Minimum confirmation blocks before minting
- Emergency pause mechanism
- Transfer limits and fee structure
- Reentrancy protection

## Deployment

1. Deploy `LXONBridge.sol` on each supported chain
2. Configure cross-chain bridge addresses
3. Set up validator nodes
4. Configure relayer endpoints
5. Run validator and relayer services
