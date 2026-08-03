# Railway Deployment Guide

## Prerequisites
- Railway account
- Railway PostgreSQL plugin attached to your backend service
- Environment variables configured (see below)

## Setup Steps

### 1. Create Backend Service
In Railway, create a new service and connect your GitHub repo.

### 2. Configure Service Root
Set the service root directory to: `apps/backend`

### 3. Environment Variables
Add these in Railway dashboard under Variables:

```
NODE_ENV=production
PORT=4000
DATABASE_URL=${{Postgres.DATABASE_URL}}
DIRECT_URL=${{Postgres.DATABASE_URL}}
REDIS_HOST=${{Redis.REDIS_HOST}}
REDIS_PORT=${{Redis.REDIS_PORT}}
REDIS_PASSWORD=${{Redis.REDIS_PASSWORD}}
JWT_SECRET=<generate-a-secure-random-string>
JWT_REFRESH_SECRET=<generate-another-secure-random-string>
SYNEX_OWNER_KEY=<generate-a-secure-random-string>
CORS_ORIGIN=https://your-frontend-domain.com
```

### 4. Build Settings
Railway should auto-detect the Dockerfile at `apps/backend/Dockerfile`.

If using Nixpacks instead of Dockerfile, set:
- Build Command: `npm run build`
- Start Command: `node dist/main`

### 5. Deploy
Push to your branch. Railway will:
1. Build the Docker image
2. Run `npm run build` (NestJS compilation)
3. Start with `node dist/main`

### 6. Run Migrations
After first deploy, run migrations:
```bash
railway run npx prisma migrate deploy
```

Or add a Railway script:
```bash
npx prisma migrate deploy && node dist/main
```

## Troubleshooting

### Build fails with native module errors
The Dockerfile installs `python3`, `make`, `g++` for native Node modules like `bcrypt`.

### Port already in use
Ensure `PORT` env var is set (Railway sets this automatically).

### Database connection fails
Ensure PostgreSQL plugin is attached and `DATABASE_URL` is set.

### Health check failing
Health endpoint is at `/health` (excluded from API prefix).
