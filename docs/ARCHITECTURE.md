# LXON Architecture

## System Overview

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend  │────▶│   Backend   │────▶│  Database   │
│  (Next.js)  │◀────│   (NestJS)  │◀────│  (SQLite/   │
│   Port 3000 │     │   Port 4000 │     │ PostgreSQL) │
└─────────────┘     └─────────────┘     └─────────────┘
                          │
                          ▼
                   ┌─────────────┐
                   │    Redis    │
                   │  (Cache)    │
                   └─────────────┘
```

## Backend Architecture

### Modules
- **Auth** - Authentication & authorization (JWT)
- **Users** - User management
- **Wallets** - Wallet management & embedded wallets
- **Portfolio** - Portfolio aggregation & risk scoring
- **AI** - AI assistant, transaction parsing, analysis
- **Governance** - Proposal & voting system
- **Analytics** - Portfolio analytics & metrics
- **Tokens** - Token search & utility
- **Transactions** - Transaction history & execution
- **Alerts** - Price & event alerts
- **Staking** - Staking positions & rewards
- **Subscriptions** - Subscription management
- **Referrals** - Referral program
- **Scanner** - Smart contract analysis
- **NFTs** - NFT tracking
- **Developer API** - API key management
- **WebSocket** - Real-time updates
- **Health** - Health checks
- **Monitoring** - System metrics

### Database Schema
- User
- Wallet (supports EOA and Embedded)
- TokenBalance
- Transaction
- Alert
- StakingPosition
- Subscription
- Referral
- Nft
- ApiKey
- Message (AI chat)

### Key Services
- **EmbeddedWalletService** - Deterministic wallet generation with shard recovery
- **TransactionBuilderService** - Natural language transaction parsing
- **RiskService** - AI-powered risk scoring
- **GovernanceService** - On-chain governance simulation
- **AnalyticsService** - Portfolio analytics & metrics
- **WebsocketGateway** - Socket.IO real-time communication

## Frontend Architecture

### Pages
- `/` - Landing page
- `/login` - Login
- `/register` - Registration
- `/dashboard` - Main dashboard
- `/wallets` - Wallet management
- `/portfolio` - Portfolio view
- `/ai` - AI assistant
- `/governance` - Governance
- `/analytics` - Analytics
- `/tokens` - Token research
- `/transactions` - Transaction history
- `/staking` - Staking
- `/alerts` - Alerts
- `/settings` - Settings

### State Management
- React Context (Auth)
- TanStack Query (server state)
- Local state (UI state)

### Real-time
- WebSocket connection via `LXONWebSocket` client
- Auto-reconnect with exponential backoff

## Security
- JWT authentication with refresh tokens
- Password hashing (bcrypt)
- Rate limiting
- CORS configuration
- Helmet security headers
- Input validation
- SQL injection prevention (Prisma)

## Scalability
- Modular NestJS architecture
- Database connection pooling
- Redis caching layer
- Horizontal scaling ready
- Docker containerization
