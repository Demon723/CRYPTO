# Development Guide

## Getting Started

### Prerequisites

- Node.js >= 20.0.0
- pnpm >= 9.0.0
- PostgreSQL >= 16
- Redis >= 7
- Docker & Docker Compose (optional)

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/your-org/synex.git
cd synex
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Configure environment**
```bash
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env.local
```

Edit the `.env` files with your configuration.

4. **Start databases**
```bash
docker compose -f infrastructure/docker/docker-compose.yml up -d postgres redis
```

5. **Run database migrations**
```bash
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

6. **Start development servers**
```bash
pnpm dev
```

## Backend Development

### Project Structure

```
apps/backend/
├── src/
│   ├── modules/           # Feature modules
│   ├── common/            # Shared code
│   ├── config/            # Configuration
│   └── main.ts            # Entry point
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Database seed
├── test/                  # Tests
└── package.json
```

### Creating a New Module

1. Generate module structure:
```bash
nest g module modules/feature-name
nest g service modules/feature-name
nest g controller modules/feature-name
```

2. Define entities in `entities/`
3. Create DTOs in `dto/`
4. Implement business logic in service
5. Define routes in controller
6. Register module in `app.module.ts`

### Database Migrations

```bash
# Generate migration
pnpm --filter backend db:migrate --name migration_name

# Apply migrations
pnpm --filter backend db:migrate

# Reset database
pnpm --filter backend db:push
```

### Running Tests

```bash
# Unit tests
pnpm --filter backend test

# E2E tests
pnpm --filter backend test:e2e

# Coverage
pnpm --filter backend test:cov
```

## Frontend Development

### Project Structure

```
apps/frontend/
├── src/
│   ├── app/               # Next.js App Router
│   ├── components/        # React components
│   ├── lib/               # Utilities
│   ├── stores/            # State management
│   └── types/             # TypeScript types
├── public/                # Static assets
└── package.json
```

### Creating a New Page

1. Create page in `src/app/(dashboard)/page-name/page.tsx`
2. Add route to sidebar navigation
3. Use existing UI components from `src/components/ui/`

### State Management

- **Server State**: TanStack Query for API data
- **Client State**: Zustand for global state
- **Forms**: React Hook Form + Zod validation

### Styling

- Tailwind CSS for utility classes
- CSS variables for theming
- shadcn/ui for component styling

## Smart Contract Development

### Project Structure

```
apps/contracts/
├── contracts/             # Solidity contracts
├── scripts/               # Deployment scripts
├── test/                  # Contract tests
├── hardhat.config.ts      # Hardhat configuration
└── package.json
```

### Compile Contracts

```bash
pnpm --filter contracts compile
```

### Run Tests

```bash
pnpm --filter contracts test
```

### Deploy Locally

```bash
pnpm --filter contracts node  # Start local node
pnpm --filter contracts deploy:local  # Deploy contracts
```

## Code Style

### TypeScript

- Strict mode enabled
- Explicit return types for functions
- No `any` types unless absolutely necessary

### NestJS

- Use decorators appropriately
- Dependency injection for services
- DTOs for validation
- Guards for authorization

### React/Next.js

- Functional components with hooks
- Server components by default
- Client components only when needed
- TypeScript for all components

### Git Workflow

1. Create feature branch from `develop`
2. Make changes with descriptive commits
3. Push and create PR
4. Wait for CI/CD checks
5. Merge after approval

## Debugging

### Backend

```bash
# Debug mode
pnpm --filter backend start:debug

# Logs
tail -f logs/application.log
```

### Frontend

```bash
# React DevTools
npm install -g @react-devtools/core

# Next.js debug mode
NODE_OPTIONS='--inspect' pnpm --filter frontend dev
```

## Performance Tips

1. Use database indexes for frequent queries
2. Cache frequently accessed data in Redis
3. Implement pagination for list endpoints
4. Use image optimization in Next.js
5. Minimize bundle size with code splitting

## Security Checklist

- [ ] Input validation on all endpoints
- [ ] Authentication on protected routes
- [ ] Rate limiting enabled
- [ ] CORS configured correctly
- [ ] Secrets in environment variables
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CSRF protection
- [ ] Secure cookies
- [ ] Helmet security headers
