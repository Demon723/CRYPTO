# Helios Protocol — Smart Contracts (v3)

> **Physical possession = Digital ownership = Cryptographic access = Premium identity.**

Complete smart contract suite for Helios: a phygital object platform where physical acrylic coins bonded to NFC chips control on-chain NFTs that serve as real-world access keys — with a premium tier that functions as an American Express-style card + hardware wallet.

## What's New in v3

### Premium Tier: "The Helios Card"
Only **Genesis (tier 0)** and **Supernova (tier 4)** coins receive premium features:

1. **Unique Card Number** — Amex-style `H-XXXX-XXXX-XXXX-X` engraved on the coin, registered on-chain with Luhn checksum
2. **Registered Cardholder** — KYC-verified identity hash linked to the coin (privacy-preserving)
3. **ERC-6551 Token Bound Account** — A smart contract wallet owned by the NFT, created on activation
4. **Tap-to-Pay** — Chip-signature-required transaction execution from the TBA. The physical coin IS the hardware wallet.

Standard tiers (Solar, Main Sequence, Red Giant) remain collectible art + access keys without financial utility.

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  HeliosPBTv3    │────▶│ HeliosChipRegistry│◄────│ HeliosFactory   │
│  (ERC-721 PBT   │     │  (Root of Trust)  │     │ (Protocol Layer)│
│   + Key + Card  │     └──────────────────┘     └─────────────────┘
│   + Wallet)     │              │
└─────────────────┘              │
         │                       │
         ▼                       ▼
┌─────────────────┐     ┌──────────────────┐
│ HeliosRenderer  │     │ HeliosCardRegistry│
│ (On-chain SVG)  │     │ (Card numbers,    │
└─────────────────┘     │  KYC hashes)      │
                        └──────────────────┘
                                 │
                                 ▼
                        ┌──────────────────┐
                        │ HeliosTBAccount   │
                        │ (ERC-6551 wallet  │
                        │  for premium)     │
                        └──────────────────┘
```

## Contracts

### `HeliosPBTv3.sol`
The main contract. All v2 features plus:
- **Premium gating:** `onlyPremium` modifier restricts card + TBA + tap-to-pay to Genesis/Supernova
- **TBA creation:** `_createTBA()` deploys a minimal proxy clone on activation (premium only)
- **`tapToPay()`:** Chip-verified transaction execution from the token's TBA
- **`tapToPayBatch()`:** Multi-transaction execution with one chip signature
- **`registerCardholder()`:** Founder-only cardholder registration via `HeliosCardRegistry`
- **`depositToTBA()`:** Anyone can fund a premium coin's wallet

### `HeliosCardRegistry.sol`
Generates unique card numbers and stores cardholder identity hashes.
- Card format: `H-XXXX-XXXX-XXXX-X` (Amex-style with Luhn checksum)
- Privacy-preserving: Only nameHash and kycHash stored on-chain
- One card per token, forever

### `HeliosTBAccount.sol`
ERC-6551 Token Bound Account implementation.
- Holds ETH, ERC-20s, NFTs
- Executes transactions via `execute()` and `executeBatch()`
- Only callable by authorized executors (the HeliosPBTv3 contract)

### `HeliosChipRegistry.sol` / `HeliosRenderer.sol` / `HeliosFactory.sol`
Unchanged from v2. See previous docs.

## Quick Start

### Prerequisites
- [Foundry](https://book.getfoundry.sh/)

### Setup
```bash
forge install OpenZeppelin/openzeppelin-contracts
export PRIVATE_KEY=0x...
export TREASURY=0x...
```

### Deploy v3
```bash
forge script script/DeployV3.s.sol:DeployHeliosV3 \
  --rpc-url $RPC_URL \
  --broadcast \
  --verify \
  -vvvv
```

### Test
```bash
forge test -vvv
```

## Premium User Flow

### Activation & Onboarding (Founder + User)
```
Founder mints Genesis coin to user
    │
    ▼
[Token is INACTIVE]
    │
    ▼
Founder activate(tokenId)
    │
    ▼
[Token is ACTIVE] + [TBA auto-created] (premium only)
    │
    ▼
Founder registerCardholder(tokenId, nameHash, kycHash)
    │
    ▼
[Card number generated: H-3746-8291-0547-2]
    │
    ▼
Coin ships to user with card number laser-engraved
    │
    ▼
User taps coin → bindWallet() → [Wallet bound]
    │
    ▼
User deposits ETH to TBA → [Coin is now a hardware wallet]
```

### Tap to Pay (User)
```
User wants to pay merchant
    │
    ▼
User taps coin → chip signs PAY message
    │
    ▼
tapToPay() verifies chip signature
    │
    ▼
TBA.execute() sends ETH to merchant
    │
    ▼
Emit TapToPay()
```

## Gas Estimates (Base L2)

| Operation | Gas | Cost @ $0.01 gwei |
|-----------|-----|-------------------|
| `mint()` | ~195,000 | ~$0.004 |
| `activate()` (premium) | ~180,000 | ~$0.004 |
| `activate()` (standard) | ~35,000 | ~$0.001 |
| `registerCardholder()` | ~85,000 | ~$0.002 |
| `bindWallet()` | ~85,000 | ~$0.002 |
| `tapToPay()` | ~120,000 | ~$0.003 |
| `depositToTBA()` | ~45,000 | ~$0.001 |
| `isKeyValid()` (view) | ~12,000 | Free |

## Security Model

| Threat | Mitigation |
|--------|-----------|
| Unauthorized status change | `onlyFounder` modifier |
| Stolen coin used to pay | Founder freeze → tapToPay blocked |
| Sold coin still has TBA funds | Binding auto-clears; new owner must rebind |
| Counterfeit premium coin | Deactivation destroys card + TBA utility |
| Replay attack | Unique nonce per signature |
| Front-running | Signature includes recipient + chainId |
| Non-premium accessing premium features | `onlyPremium` modifier on all premium functions |

## Documentation

| File | Audience |
|------|----------|
| `README.md` | This file — overview for developers |
| `INTEGRATION_GUIDE.md` | dApp developers building on Helios Key |
| `PREMIUM_GUIDE.md` | Premium cardholders (Genesis/Supernova owners) |

## License

MIT — See individual file headers.
