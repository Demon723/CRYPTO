# Synex Deployment Guide

Deploy Synex to Railway (backend) and Vercel (frontend).

## Prerequisites

- Railway CLI installed
- Vercel CLI installed
- GitHub repo connected to Railway and Vercel

## 1. Backend Deployment (Railway)

### 1.1 Install Railway CLI

```bash
# macOS/Linux
curl -fsSL https://railway.app/install.sh | sh

# Verify
railway --version
```

### 1.2 Login and Link Project

```bash
cd /Users/adikamble/CRYPTO
railway login
railway init
```

### 1.3 Add PostgreSQL Plugin

```bash
railway add -p postgres
```

### 1.4 Add Redis Plugin

```bash
railway add -p redis
```

### 1.5 Set Environment Variables

```bash
railway variables set NODE_ENV=production
railway variables set PORT=4000
railway variables set JWT_SECRET=$(openssl rand -hex 32)
railway variables set JWT_REFRESH_SECRET=$(openssl rand -hex 32)
railway variables set SYNEX_OWNER_KEY=8075c0e4d8e34d9d04f502dbaab7acecd5c01faae2ac4e3ac3db0ee24b156bbe
railway variables set CORS_ORIGIN=https://your-frontend-domain.vercel.app
```

### 1.6 Configure Service Settings

In Railway dashboard:
1. Go to your backend service
2. Settings → Build & Deploy
3. Set **Service Root** to: `apps/backend`
4. Set **Builder** to: `Dockerfile`
5. Set **Dockerfile Path** to: `apps/backend/Dockerfile`
6. Set **Start Command** to: `node dist/main`

### 1.7 Deploy

```bash
railway up
```

### 1.8 Run Migrations

```bash
railway run npx prisma migrate deploy
```

### 1.9 Verify Backend

```bash
# Get backend URL
railway open

# Test health endpoint
curl https://your-backend.up.railway.app/health
```

---

## 2. Frontend Deployment (Vercel)

### 2.1 Install Vercel CLI

```bash
npm install -g vercel
```

### 2.2 Login

```bash
vercel login
```

### 2.3 Set Environment Variables

```bash
cd /Users/adikamble/CRYPTO/apps/frontend

vercel env add NEXT_PUBLIC_API_URL production
# Enter: https://your-backend.up.railway.app/api/v1

vercel env add NEXT_PUBLIC_WS_URL production
# Enter: wss://your-backend.up.railway.app

vercel env add NEXT_PUBLIC_APP_URL production
# Enter: https://your-frontend.vercel.app

vercel env add NEXTAUTH_URL production
# Enter: https://your-frontend.vercel.app

vercel env add NEXTAUTH_SECRET production
# Enter: $(openssl rand -hex 32)
```

### 2.4 Deploy

```bash
vercel --prod
```

### 2.5 Verify Frontend

```bash
vercel open
```

---

## 3. Post-Deployment Checklist

### 3.1 Update CORS

```bash
railway variables set CORS_ORIGIN=https://your-frontend.vercel.app
```

### 3.2 Test Endpoints

```bash
# Health check
curl https://your-backend.up.railway.app/health

# Register test user
curl -X POST https://your-backend.up.railway.app/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'

# Login
curl -X POST https://your-backend.up.railway.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'
```

### 3.3 Test Frontend

Open `https://your-frontend.vercel.app` and verify:
- Landing page loads
- Registration works
- Login works
- Dashboard loads with data

---

## 4. Custom Domains (Optional)

### Backend (Railway)

```bash
railway domain add api.yourdomain.com
```

### Frontend (Vercel)

```bash
vercel domains add yourdomain.com
vercel domains add www.yourdomain.com
```

---

## 5. Monitoring

### Railway Logs

```bash
railway logs
```

### Vercel Logs

```bash
vercel logs
```

### Database

```bash
# Connect to PostgreSQL
railway connect postgres

# Run Prisma Studio
railway run npx prisma studio
```

---

## 6. Troubleshooting

### Build Fails with pnpm Error

Railway is using pnpm from root. Fix:
1. Railway Dashboard → Settings → Builder → Dockerfile
2. Dockerfile Path: `apps/backend/Dockerfile`

### Database Connection Fails

```bash
# Check DATABASE_URL is set
railway variables

# Verify PostgreSQL is running
railway status
```

### Migrations Fail

```bash
# Reset and reapply
railway run npx prisma migrate reset
railway run npx prisma migrate deploy
```

### Frontend Can't Reach Backend

Verify `NEXT_PUBLIC_API_URL` in Vercel matches Railway backend URL.

---

## 7. Quick Reference

| Service | URL Pattern | CLI |
|---------|-------------|-----|
| Railway Backend | `https://[project]-[service].up.railway.app` | `railway` |
| Vercel Frontend | `https://[project].vercel.app` | `vercel` |
| PostgreSQL | Via Railway plugin | `railway connect postgres` |
| Redis | Via Railway plugin | `railway connect redis` |

---

## 8. Environment Variables Summary

### Railway (Backend)

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `PORT` | `4000` |
| `DATABASE_URL` | Auto-set by PostgreSQL plugin |
| `REDIS_HOST` | Auto-set by Redis plugin |
| `REDIS_PORT` | Auto-set by Redis plugin |
| `JWT_SECRET` | Generate with `openssl rand -hex 32` |
| `JWT_REFRESH_SECRET` | Generate with `openssl rand -hex 32` |
| `SYNEX_OWNER_KEY` | `8075c0e4d8e34d9d04f502dbaab7acecd5c01faae2ac4e3ac3db0ee24b156bbe` |
| `CORS_ORIGIN` | Your Vercel frontend URL |

### Vercel (Frontend)

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | Your Railway backend URL + `/api/v1` |
| `NEXT_PUBLIC_WS_URL` | Your Railway backend URL (wss://) |
| `NEXT_PUBLIC_APP_URL` | Your Vercel frontend URL |
| `NEXTAUTH_URL` | Your Vercel frontend URL |
| `NEXTAUTH_SECRET` | Generate with `openssl rand -hex 32` |
