# LXON Helios Integration Guide

## Overview

LXON has integrated the Helios Physical-Bound Token (PBT) protocol to bridge physical acrylic coins with on-chain digital assets. This guide covers how the Helios modules fit into the LXON ecosystem.

## Module Map

| LXON Path | Helios Source | Purpose |
|-----------|---------------|---------|
| `apps/contracts-helios/` | Helios v3 contracts | Foundry-based Solidity contracts |
| `packages/helios-types/` | Helios TypeScript SDK | Types, validators, and utilities |
| `apps/wallet/` | Extends Helios wallet flow | Wallet binding and tap-to-pay UI |
| `apps/block-explorer/` | Helios event indexing | Token status, card registry, TBA tracking |
| `apps/monitoring/` | Helios metrics | Chip activity, premium deposits, tap counts |

## Smart Contract Integration

### HeliosPBTv3
- Located in: `apps/contracts-helios/src/HeliosPBTv3.sol`
- LXON-specific: Uses `0.8.26` instead of `0.8.20`
- Events emitted:
  - `Tapped` — tap count updates
  - `Activated`, `Frozen`, `Deactivated` — founder lifecycle
  - `WalletBound`, `WalletRebound` — NFC binding
  - `TBACreated` — premium token wallet deployment
  - `CardholderRegistered` — premium identity linking
  - `TapToPay` — chip-verified payments
  - `PremiumDeposit` — TBA funding

### HeliosCardRegistry
- Located in: `apps/contracts-helios/src/HeliosCardRegistry.sol`
- Generates Amex-style card numbers: `H-XXXX-XXXX-XXXX-X`
- Luhn checksum validation
- Privacy-preserving: stores `nameHash` and `kycHash` only

### HeliosTBAccount
- Located in: `apps/contracts-helios/src/HeliosTBAccount.sol`
- ERC-6551 Token Bound Account
- Owned by the NFT, not the user
- Executes transactions only via authorized executors

### HeliosChipRegistry
- Located in: `apps/contracts-helios/src/HeliosChipRegistry.sol`
- Maps chip public keys to token IDs
- Verifies chip signatures for all physical-bound actions

### HeliosRenderer
- Located in: `apps/contracts-helios/src/HeliosRenderer.sol`
- On-chain SVG metadata generation
- Token traits: tier, tap count, premium status

## TypeScript Integration

### Package: `@lxon/helios-types`

```typescript
import {
  isPremiumTier,
  tierLabel,
  generateCardNumber,
  validateCardNumber,
  TokenState,
  Cardholder,
  TokenStatus
} from '@lxon/helios-types';
```

### Key Utilities

| Utility | Purpose |
|---------|---------|
| `isPremiumTier(tier)` | Returns `true` for Genesis (0) and Supernova (4) |
| `tierLabel(tier)` | Human-readable tier name |
| `generateCardNumber(tokenId, tier)` | Creates `H-XXXX-XXXX-XXXX-X` with Luhn checksum |
| `validateCardNumber(cardNumber)` | Validates Amex-style format + checksum |
| `parseTapToPayMessage(...)` | Builds chip signing payload |

### Validation Schemas

```typescript
import { CardNumberSchema, TokenStateSchema, CardholderSchema } from '@lxon/helios-types';

const card = CardNumberSchema.parse('H-3746-8291-0547-2');
const state = TokenStateSchema.parse({
  tokenId: 1,
  tapCount: 0,
  lastTapTime: Date.now(),
  tier: 0,
  minted: true,
  status: 'ACTIVE',
  boundWallet: '0x...',
  boundAt: Date.now(),
  tba: '0x...',
  isPremium: true,
});
```

## API Endpoints (Planned)

### Wallet & Binding

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/pbt/bind-wallet` | Bind wallet to token via chip signature |
| `POST` | `/api/v1/pbt/unbind-wallet` | Unbind wallet |
| `GET` | `/api/v1/pbt/key/:wallet` | Check if wallet has valid key |
| `POST` | `/api/v1/pbt/use-key` | Use key for access action |

### Premium Features

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/pbt/cardholder/register` | Register cardholder (founder only) |
| `GET` | `/api/v1/pbt/cardholder/:tokenId` | Get cardholder info |
| `POST` | `/api/v1/pbt/tba/deposit` | Deposit ETH to TBA |
| `POST` | `/api/v1/pbt/tap-to-pay` | Execute chip-signed payment |

### Founder Controls

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/pbt/founder/activate` | Activate token |
| `POST` | `/api/v1/pbt/founder/freeze` | Freeze token |
| `POST` | `/api/v1/pbt/founder/deactivate` | Permanently deactivate token |

## Event Indexing for Block Explorer

Index these Helios events:

```typescript
const HELIOS_EVENTS = {
  Tapped: 'Token tap count update',
  Activated: 'Token activated by founder',
  Frozen: 'Token frozen by founder',
  Deactivated: 'Token permanently deactivated',
  WalletBound: 'Wallet bound to token',
  WalletRebound: 'Wallet rebound to new address',
  TBACreated: 'Token Bound Account deployed',
  CardholderRegistered: 'Premium cardholder registered',
  TapToPay: 'Chip-signed payment executed',
  PremiumDeposit: 'ETH deposited to TBA'
} as const;
```

## Security Considerations

| Threat | Mitigation |
|--------|-----------|
| Stolen coin used as key | Founders can freeze instantly |
| Sold coin still works as key | Binding auto-clears on transfer |
| Counterfeit coin | Deactivation destroys utility permanently |
| Replay attack | Unique nonce per signature |
| Front-running | Signature includes recipient + chainId |
| Non-premium accessing premium features | `onlyPremium` modifier on all premium functions |

## Deployment

### Prerequisites
- Foundry installed
- ETH for mainnet deployment

### Environment Variables
```bash
export PRIVATE_KEY=0x...
export MAINNET_RPC=https://eth-mainnet.g.alchemy.com/v2/$ALCHEMY_API_KEY
export ETHERSCAN_API_KEY=...
export ALCHEMY_API_KEY=...
```

### Deploy to Testnet
```bash
cd apps/contracts-helios
forge script script/DeployV3.s.sol:DeployHeliosV3 \
  --rpc-url $RPC_URL \
  --broadcast \
  --verify \
  -vvvv
```

### Deploy to Mainnet
```bash
forge script script/DeployV3.s.sol:DeployHeliosV3 \
  --rpc-url $MAINNET_RPC \
  --broadcast \
  --verify \
  -vvvv
```

## Next Steps

1. **Backend Integration**: Add Helios event indexing to NestJS backend
2. **Wallet UI**: Implement tap-to-bind and tap-to-pay flows in React app
3. **Block Explorer**: Add coin status, TBA balance, and card number lookup
4. **Monitoring**: Add chip activity metrics and premium deposit tracking
5. **Testing**: Run Foundry tests and integrate with existing Hardhat suite
6. **Security Audit**: Full audit of Helios contracts before mainnet

## References

- [Helios README](apps/contracts-helios/README.md)
- [Helios Integration Guide](apps/contracts-helios/INTEGRATION_GUIDE.md)
- [Helios Premium Guide](apps/contracts-helios/PREMIUM_GUIDE.md)
- [LXON Architecture](docs/ARCHITECTURE.md)
- [LXON Security Design](docs/SECURITY_DESIGN.md)
