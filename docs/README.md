# Synex - AI-Powered Crypto Operating System

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

Synex is an AI-powered crypto operating system that helps you track assets, analyze transactions, and manage your crypto portfolio with advanced AI features.

## Features

### Core Features
- Multi-wallet support (MetaMask, WalletConnect, Coinbase, Embedded)
- Portfolio tracking and analytics
- Real-time price alerts
- Transaction history and analysis

### AI Features
- Natural language transaction parsing
- Portfolio analysis and insights
- Smart contract analysis
- Scam detection
- Risk scoring

### Advanced Features
- LXON chain integration
- Embedded wallets with shard recovery
- Governance voting
- Token staking and rewards
- Revenue sharing
- WebSocket real-time updates
- Developer API with key management

## Tech Stack

### Backend
- NestJS
- Prisma ORM
- SQLite (dev) / PostgreSQL (prod)
- Redis (caching)
- Socket.IO (WebSocket)
- Swagger/OpenAPI

### Frontend
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- shadcn/ui
- Wagmi/RainbowKit (Web3)

## Quick Start

### Prerequisites
- Node.js 20+
- pnpm 9+

### Installation

1. Clone the repository
```bash
git clone https://github.com/your-org/synex.git
cd synex
```

2. Install dependencies
```bash
pnpm install
```

3. Set up environment variables
```bash
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env.local
```

4. Run database setup
```bash
pnpm db:generate
pnpm db:push
```

5. Start development servers
```bash
pnpm dev
```

6. Open http://localhost:3000

## Docker

```bash
docker compose -f infrastructure/docker/docker-compose.yml up -d
```

## Documentation

- [API Documentation](docs/API.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Architecture](docs/ARCHITECTURE.md)

## Testing

```bash
# Backend tests
pnpm --filter backend test

# Frontend tests
pnpm --filter frontend test
```

## License

MIT
