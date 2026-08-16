# LXON Cryptocurrency Program

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

LXON is a cryptocurrency program implementing a high-throughput blockchain simulation engine, smart contracts, and shared crypto utilities.

## Architecture

### Blockchain Engine (`apps/lxon-blockchain`)
- Block-STM optimistic parallel execution engine
- MonadDB asynchronous trie storage engine
- RISCV zkVM prover stack with recursive SNARK compression
- MonadBFT consensus with Narwhal mempool
- WASM hotswap runtime
- Oracle price feeds
- Token execution engine with staking and governance

### Smart Contracts (`apps/contracts`)
- LXON token (ERC20 + governance + storage rent)
- Staking and revenue distribution
- Hardhat-based development and testing

### Helios Physical-Bound Tokens (`apps/contracts-helios`)
- ERC721 NFTs bound to NFC chip public keys
- Token Bound Accounts (ERC-6551) for premium coins
- Amex-style card registry with Luhn checksum
- Tap-to-pay via chip-signed transactions
- Founder-gated lifecycle: activate, freeze, deactivate
- Foundry-based development and testing

### Shared Types (`packages/shared`)
- Common TypeScript types and utilities
- Zod-based validation schemas

### Helios Types (`packages/helios-types`)
- Helios-specific TypeScript types
- Card number generation and validation
- Tap-to-pay payload builders
- Zod validation schemas

## Quick Start

### Prerequisites
- Node.js 20+
- pnpm 9+
- Foundry (for Helios contracts)

### Installation

```bash
cd /Users/adikamble/LXON/LXON
pnpm install
```

### Usage

```bash
# Run blockchain performance benchmarks
pnpm demo

# Build all packages
pnpm build

# Compile Hardhat smart contracts
pnpm build:contracts

# Compile Helios Foundry contracts
pnpm build:contracts-helios

# Run blockchain tests
pnpm test:blockchain

# Run Hardhat contract tests
pnpm test:contracts

# Run Helios Foundry tests
pnpm test:contracts-helios

# Run CLI with help
pnpm cli
```

## Documentation

- [API Documentation](docs/API.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Security Design](docs/SECURITY_DESIGN.md)
- [Whitepaper](docs/WHITEPAPER.md)
- [Helios Integration Guide](apps/contracts-helios/INTEGRATION_GUIDE.md)
- [Helios Premium Guide](apps/contracts-helios/PREMIUM_GUIDE.md)
- [Helios README](apps/contracts-helios/README.md)

## License

MIT
