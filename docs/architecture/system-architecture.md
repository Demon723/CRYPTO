# Architecture Documentation

## System Overview

Synex is a production-ready AI-powered crypto operating system built with a modern, scalable architecture.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Load Balancer / Nginx                 │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
┌───────▼────────┐          ┌────────▼────────┐
│  Next.js       │          │  Next.js       │
│  Frontend      │          │  Frontend      │
│  (Replicas)    │          │  (Replicas)    │
└───────┬────────┘          └────────┬────────┘
        │                             │
        └──────────────┬──────────────┘
                       │
              ┌────────▼────────┐
              │  NestJS API     │
              │  Gateway        │
              └────────┬────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
   ┌────▼────┐   ┌────▼────┐   ┌────▼────┐
   │ Module  │   │ Module  │   │ Module  │
   │ Auth    │   │ Wallets │   │ AI      │
   └────┬────┘   └────┬────┘   └────┬────┘
        │              │              │
        └──────────────┼──────────────┘
                       │
              ┌────────▼────────┐
              │   PostgreSQL    │
              │   (Primary)     │
              └─────────────────┘
                       │
              ┌────────▼────────┐
              │      Redis      │
              │  (Cache + Pub/Sub) │
              └─────────────────┘
                       │
              ┌────────▼────────┐
              │  BullMQ         │
              │  (Job Queue)    │
              └─────────────────┘
```

## Backend Architecture

### Module Structure

```
src/
├── modules/
│   ├── auth/                 # Authentication & authorization
│   ├── users/                # User management
│   ├── wallets/              # Wallet management
│   ├── portfolio/            # Portfolio analytics
│   ├── transactions/         # Transaction history
│   ├── ai/                   # AI chat & analysis
│   ├── scanner/              # Smart contract analyzer
│   ├── alerts/               # Alert system
│   ├── notifications/        # Notification system
│   ├── subscriptions/        # Subscription management
│   ├── payments/             # Payment processing
│   ├── tokens/               # Token research
│   ├── nfts/                 # NFT management
│   ├── staking/              # Staking functionality
│   ├── governance/           # DAO governance
│   ├── referral/             # Referral system
│   ├── watchlist/            # Watchlist management
│   ├── analytics/            # Analytics & metrics
│   └── developer-api/        # Developer API
├── common/
│   ├── modules/              # Shared modules (Prisma, Redis, Logger, HTTP)
│   ├── decorators/           # Custom decorators
│   ├── guards/               # Route guards
│   ├── interceptors/         # Response interceptors
│   ├── filters/              # Exception filters
│   ├── pipes/                # Validation pipes
│   └── utils/                # Utility functions
└── config/                   # Configuration files
```

### Key Design Patterns

1. **Module Pattern**: Each feature is encapsulated in its own module with clear boundaries
2. **Repository Pattern**: Prisma ORM provides data access abstraction
3. **Service Layer**: Business logic is separated from controllers
4. **DTO Pattern**: Data transfer objects for validation
5. **Guard Pattern**: Authentication and authorization via guards
6. **Interceptor Pattern**: Cross-cutting concerns (logging, caching)
7. **Event-Driven**: Redis pub/sub for real-time updates

### Authentication Flow

```
Client → JWT Token → Protected Route → Guard → Controller → Service
                                    ↓
                              Validate JWT
                                    ↓
                              Attach User
                                    ↓
                              Continue
```

## Frontend Architecture

### Directory Structure

```
src/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Auth pages (login, register)
│   ├── (dashboard)/         # Dashboard pages
│   ├── api/                 # API routes
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page
│   └── providers.tsx        # Context providers
├── components/
│   ├── ui/                  # Reusable UI components
│   ├── layout/              # Layout components
│   └── providers/           # Context providers
├── lib/
│   ├── api-client.ts        # Axios instance
│   ├── hooks/               # Custom React hooks
│   └── utils/               # Utility functions
├── stores/                  # Zustand stores
├── types/                   # TypeScript types
└── styles/                  # Global styles
```

### State Management

- **Server State**: TanStack Query (React Query)
- **Client State**: Zustand
- **Form State**: React Hook Form + Zod
- **URL State**: Next.js Router

## Database Schema

### Core Entities

- **User**: User accounts and profiles
- **Wallet**: Connected wallets
- **Transaction**: Transaction history
- **TokenBalance**: Token holdings
- **Nft**: NFT holdings
- **Chat/Message**: AI conversations
- **Alert**: User alerts
- **Notification**: In-app notifications
- **Subscription**: Subscription plans
- **Payment**: Payment records
- **StakingPosition**: Staking positions
- **GovernanceVote**: Governance votes
- **ApiKey**: Developer API keys
- **Watchlist**: Token watchlists

## Caching Strategy

1. **Redis Cache**: Frequently accessed data (user profiles, token prices)
2. **HTTP Cache**: Static assets and API responses
3. **Database Indexes**: Optimized queries for common filters
4. **CDN**: Frontend static assets

## Security

- Helmet.js for security headers
- CORS configuration
- Rate limiting (express-rate-limit)
- Input validation (class-validator)
- SQL injection prevention (Prisma parameterized queries)
- XSS protection
- CSRF protection
- JWT with refresh tokens
- Secure, HttpOnly cookies
- Password hashing (bcrypt)

## Scalability

- Horizontal scaling via Kubernetes
- Database connection pooling
- Redis clustering for cache
- BullMQ for background jobs
- CDN for static assets
- Database read replicas (future)

## Monitoring

- Winston logging
- Health checks (/health)
- Metrics endpoint (/metrics)
- Request/response logging
- Error tracking
- Performance monitoring (future: Prometheus + Grafana)
