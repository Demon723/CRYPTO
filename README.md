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

### Shared Types (`packages/shared`)
- Common TypeScript types and utilities
- Zod-based validation schemas

## Quick Start

### Prerequisites
- Node.js 20+
- pnpm 9+

### Installation

```bash
cd /Users/adikamble/LXON/CRYPTO
pnpm install
```

### Usage

```bash
# Run blockchain performance benchmarks
pnpm demo

# Build all packages
pnpm build

# Compile smart contracts
pnpm build:contracts

# Run blockchain tests
pnpm test:blockchain

# Run contract tests
pnpm test:contracts

# Run CLI with help
pnpm cli
```

## Documentation

- [API Documentation](docs/API.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Security Design](docs/SECURITY_DESIGN.md)
- [Whitepaper](docs/WHITEPAPER.md)

## License

MIT
