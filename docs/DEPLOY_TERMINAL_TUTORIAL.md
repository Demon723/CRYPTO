# CRYPTO Deployment Terminal Tutorial

This guide walks you through deploying the CRYPTO monorepo from the terminal using multiple deployment options.

## Deployment Options

1. **Docker Compose** (Recommended for local/staging)
2. **Railway + Vercel** (Recommended for production)
3. **Manual deployment** (For custom infrastructure)

Choose the option that best fits your needs.

---

## Option 1: Docker Compose Deployment (Local/Staging)

### Prerequisites

- Docker Desktop installed and running
- Docker Compose installed

```bash
docker --version
docker-compose --version
```

### Quick Start

```bash
cd /Users/adikamble/CRYPTO
docker-compose -f infrastructure/docker/docker-compose.yml up -d
```

This will start:
- PostgreSQL database
- Redis cache
- Backend API (port 4000)
- Frontend (port 3000)
- Nginx reverse proxy (ports 80/443)

### Environment Setup

Create `.env` files:

```bash
# Backend .env
cp apps/backend/.env.example apps/backend/.env

# Frontend .env.local
cp apps/frontend/.env.example apps/frontend/.env.local
```

### Database Initialization

```bash
docker-compose -f infrastructure/docker/docker-compose.yml exec backend npx prisma migrate deploy
```

### View Logs

```bash
docker-compose -f infrastructure/docker/docker-compose.yml logs -f
```

### Stop Services

```bash
docker-compose -f infrastructure/docker/docker-compose.yml down
```

---

## Option 2: Railway + Vercel Deployment (Production)

### Prerequisites

- Node.js 20+
- pnpm (project uses pnpm, not npm)
- Git
- A Railway account
- A Vercel account

Verify the tools:

```bash
node -v
pnpm -v
git --version
```

### Install pnpm (if not installed)

```bash
npm install -g pnpm
```

### Install deployment CLIs

```bash
npm install -g @railway/cli
npm install -g vercel
```

Verify installation:

```bash
railway --version
vercel --version
```

### Log in to the services

```bash
cd /Users/adikamble/CRYPTO
railway login
vercel login
```

### Deploy the backend to Railway

#### Initialize the Railway project

```bash
cd /Users/adikamble/CRYPTO
railway init
```

Choose the option to create a new project and give it a name such as `crypto`.

#### Add PostgreSQL and Redis

```bash
railway add
```

Choose the PostgreSQL and Redis services from the list when prompted.

#### Set backend environment variables

```bash
railway variables set NODE_ENV=production
railway variables set PORT=4000
railway variables set JWT_SECRET=$(openssl rand -hex 32)
railway variables set JWT_REFRESH_SECRET=$(openssl rand -hex 32)
railway variables set SYNEX_OWNER_KEY=8075c0e4d8e34d9d04f502dbaab7acecd5c01faae2ac4e3ac3db0ee24b156bbe
```

Railway will automatically inject PostgreSQL and Redis connection values.

#### Configure Railway build settings

In the Railway dashboard:

1. Open your backend service
2. Go to Settings > Build & Deploy
3. Set:
   - Service Root: `apps/backend`
   - Builder: `Dockerfile`
   - Dockerfile Path: `apps/backend/Dockerfile`
   - Start Command: `node dist/main`

#### Deploy the backend

```bash
railway up
```

#### Run Prisma migrations

```bash
railway run npx prisma migrate deploy
```

#### Verify the backend

```bash
railway open
curl https://your-backend-url.up.railway.app/health
```

### Deploy the frontend to Vercel

#### Set frontend environment variables

Replace the example URL below with the Railway backend URL you received.

```bash
cd /Users/adikamble/CRYPTO/apps/frontend

BACKEND_URL="https://your-backend-url.up.railway.app"

vercel env add NEXT_PUBLIC_API_URL production "$BACKEND_URL/api/v1"
vercel env add NEXT_PUBLIC_WS_URL production "wss://$(echo "$BACKEND_URL" | sed 's/https:\/\//')"
vercel env add NEXT_PUBLIC_APP_URL production "https://your-frontend-url.vercel.app"
vercel env add NEXTAUTH_URL production "https://your-frontend-url.vercel.app"
vercel env add NEXTAUTH_SECRET production "$(openssl rand -hex 32)"
```

#### Deploy the frontend

```bash
vercel --prod
```

#### Verify the frontend

```bash
vercel open
```

### Final CORS update

After the frontend URL is known, update the backend CORS origin:

```bash
cd /Users/adikamble/CRYPTO
railway variables set CORS_ORIGIN=https://your-frontend-url.vercel.app
```

---

## Option 3: Manual Deployment (Custom Infrastructure)

### Prerequisites

- PostgreSQL 16+
- Redis 7+
- Node.js 20+
- pnpm

### Local Development Setup

#### Install dependencies

```bash
cd /Users/adikamble/CRYPTO
pnpm install
```

#### Start PostgreSQL and Redis

```bash
# macOS with Homebrew
brew services start postgresql@16
brew services start redis

# Or use Docker
docker-compose -f infrastructure/docker/docker-compose.yml up -d postgres redis
```

#### Setup database

```bash
cd apps/backend
cp .env.example .env
# Edit .env with your database credentials
pnpm run db:push
```

#### Start backend

```bash
cd apps/backend
pnpm run dev
```

Backend will be available at http://localhost:4000

#### Start frontend

```bash
cd apps/frontend
cp .env.example .env.local
# Edit .env.local with your backend URL
pnpm run dev
```

Frontend will be available at http://localhost:3000

---

## Environment Variables Reference

### Backend (.env)

```bash
NODE_ENV=development
PORT=4000
HOST=0.0.0.0
API_PREFIX=api/v1

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/cryptomind?schema=public
DIRECT_URL=postgresql://postgres:postgres@localhost:5432/cryptomind?schema=public

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_REFRESH_EXPIRES_IN=30d

# CORS
CORS_ORIGIN=http://localhost:3000

# Blockchain RPCs
ETHEREUM_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/your-api-key
POLYGON_RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/your-api-key
BSC_RPC_URL=https://bsc-dataseed.binance.org/
```

### Frontend (.env.local)

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:4000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Useful Commands

### Development

```bash
# Install dependencies
pnpm install

# Start all services
pnpm run dev

# Start backend only
cd apps/backend && pnpm run dev

# Start frontend only
cd apps/frontend && pnpm run dev

# Database operations
cd apps/backend
pnpm run db:push
pnpm run db:studio
pnpm run db:seed
```

### Railway

```bash
railway logs
railway status
railway run npx prisma db pull
railway run npx prisma generate
railway variables ls
```

### Vercel

```bash
vercel logs
vercel env ls
vercel inspect
```

### Docker

```bash
# Start all services
docker-compose -f infrastructure/docker/docker-compose.yml up -d

# View logs
docker-compose -f infrastructure/docker/docker-compose.yml logs -f

# Stop services
docker-compose -f infrastructure/docker/docker-compose.yml down

# Restart specific service
docker-compose -f infrastructure/docker/docker-compose.yml restart backend
```

---

## Troubleshooting

### `command not found: pnpm`

```bash
npm install -g pnpm
```

### `command not found: railway`

```bash
npm install -g @railway/cli
```

### `command not found: vercel`

```bash
npm install -g vercel
```

### PostgreSQL connection issues

```bash
# Check if PostgreSQL is running
brew services list

# Start PostgreSQL
brew services start postgresql@16

# Check connection
psql -U postgres -d cryptomind
```

### Redis connection issues

```bash
# Check if Redis is running
brew services list

# Start Redis
brew services start redis

# Check connection
redis-cli ping
```

### Build fails in Railway

Make sure Railway uses:
- Service Root: `apps/backend`
- Dockerfile Path: `apps/backend/Dockerfile`

### Database connection issues

Check that the PostgreSQL plugin is attached and that Railway has injected `DATABASE_URL` and `DIRECT_URL`.

### CORS errors in the browser

Ensure `CORS_ORIGIN` matches the deployed frontend domain exactly.

### TypeScript compilation errors

```bash
cd apps/backend
pnpm run typecheck
```

### Linting errors

```bash
cd apps/backend
pnpm run lint
```

---

## Quick Deployment Summary

### Docker Compose (Quickest)

```bash
cd /Users/adikamble/CRYPTO
docker-compose -f infrastructure/docker/docker-compose.yml up -d
docker-compose -f infrastructure/docker/docker-compose.yml exec backend npx prisma migrate deploy
```

### Railway + Vercel (Production)

```bash
cd /Users/adikamble/CRYPTO
railway login
railway init
railway add
# select PostgreSQL and Redis from the interactive prompt
railway variables set NODE_ENV=production
railway variables set PORT=4000
railway variables set JWT_SECRET=$(openssl rand -hex 32)
railway variables set JWT_REFRESH_SECRET=$(openssl rand -hex 32)
railway variables set SYNEX_OWNER_KEY=8075c0e4d8e34d9d04f502dbaab7acecd5c01faae2ac4e3ac3db0ee24b156bbe
railway up
railway run npx prisma migrate deploy
# Then deploy frontend to Vercel with backend URL
```

### Local Development

```bash
cd /Users/adikamble/CRYPTO
pnpm install
brew services start postgresql@16
brew services start redis
cd apps/backend
cp .env.example .env
pnpm run db:push
pnpm run dev
# In another terminal
cd apps/frontend
cp .env.example .env.local
pnpm run dev
```

---

## Security Notes

- Never commit `.env` files to version control
- Use strong, randomly generated secrets for production
- Rotate secrets regularly
- Enable HTTPS in production
- Set up proper CORS origins
- Use environment-specific configurations
- Monitor logs for suspicious activity
- Keep dependencies updated
