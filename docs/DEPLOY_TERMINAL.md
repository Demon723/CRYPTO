# Synex Terminal Deployment Guide

## Prerequisites

- Node.js 20+ installed
- npm installed
- Railway account
- Vercel account
- GitHub repo connected

---

## Fix npm Permission Error First

If you got `EACCES: permission denied` when installing global packages:

### Option A: Use sudo (quick fix)
```bash
sudo npm install -g @railway/cli
sudo npm install -g vercel
```

### Option B: Fix npm permissions (permanent fix)
```bash
mkdir -p ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.zshrc
source ~/.zshrc

# Now install without sudo
npm install -g @railway/cli
npm install -g vercel
```

---

## Step 1: Deploy Backend to Railway

### 1.1 Install Railway CLI
```bash
npm install -g @railway/cli
```

### 1.2 Login
```bash
cd /Users/adikamble/CRYPTO
railway login
```

### 1.3 Initialize Project
```bash
railway init
# Choose: "Create a new project"
# Name: synex
```

### 1.4 Add Plugins
```bash
railway add -p postgres
railway add -p redis
```

### 1.5 Set Environment Variables
```bash
railway variables set NODE_ENV=production
railway variables set PORT=4000
railway variables set JWT_SECRET=$(openssl rand -hex 32)
railway variables set JWT_REFRESH_SECRET=$(openssl rand -hex 32)
railway variables set SYNEX_OWNER_KEY=8075c0e4d8e34d9d04f502dbaab7acecd5c01faae2ac4e3ac3db0ee24b156bbe
railway variables set CORS_ORIGIN=https://your-frontend.vercel.app
```

### 1.6 Configure Build Settings
In Railway dashboard:
1. Go to your backend service
2. Settings > Build & Deploy
3. Service Root: `apps/backend`
4. Builder: `Dockerfile`
5. Dockerfile Path: `apps/backend/Dockerfile`
6. Start Command: `node dist/main`

### 1.7 Deploy
```bash
railway up
```

### 1.8 Run Migrations
```bash
railway run npx prisma migrate deploy
```

### 1.9 Verify
```bash
railway open
curl https://your-backend.up.railway.app/health
```

---

## Step 2: Deploy Frontend to Vercel

### 2.1 Install Vercel CLI
```bash
npm install -g vercel
```

### 2.2 Login
```bash
cd /Users/adikamble/CRYPTO/apps/frontend
vercel login
```

### 2.3 Set Environment Variables
```bash
# Replace with your actual Railway backend URL
BACKEND_URL="https://synex-backend-production.up.railway.app"

vercel env add NEXT_PUBLIC_API_URL production "$BACKEND_URL/api/v1"
vercel env add NEXT_PUBLIC_WS_URL production "wss://$(echo $BACKEND_URL | sed 's/https:\\/\\//')"
vercel env add NEXT_PUBLIC_APP_URL production "https://your-frontend.vercel.app"
vercel env add NEXTAUTH_URL production "https://your-frontend.vercel.app"
vercel env add NEXTAUTH_SECRET production "$(openssl rand -hex 32)"
```

### 2.4 Deploy
```bash
vercel --prod
```

### 2.5 Verify
```bash
vercel open
```

---

## Step 3: Post-Deployment

### Update CORS
```bash
cd /Users/adikamble/CRYPTO
railway variables set CORS_ORIGIN=https://your-frontend.vercel.app
```

### Test Backend
```bash
# Health check
curl https://your-backend.up.railway.app/health

# Register test user
curl -X POST https://your-backend.up.railway.app/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'
```

### Monitor Logs
```bash
# Railway logs
railway logs

# Vercel logs
vercel logs
```

---

## Troubleshooting

| Error | Solution |
|-------|----------|
| `EACCES: permission denied` | Use sudo or fix npm permissions (see above) |
| `command not found: railway` | Run `npm install -g @railway/cli` |
| `command not found: vercel` | Run `npm install -g vercel` |
| Build fails with pnpm | Railway Dashboard > Builder: Dockerfile > Path: `apps/backend/Dockerfile` |
| DB connection fails | Check `DATABASE_URL` is set by PostgreSQL plugin |
| Migrations fail | `railway run npx prisma migrate reset` then `railway run npx prisma migrate deploy` |

---

## Quick Reference

| Variable | Where | Value |
|----------|-------|-------|
| `DATABASE_URL` | Railway (auto) | PostgreSQL plugin |
| `REDIS_HOST` | Railway (auto) | Redis plugin |
| `JWT_SECRET` | Railway | `openssl rand -hex 32` |
| `SYNEX_OWNER_KEY` | Railway | `8075c0e4d8e34d9d04f502dbaab7acecd5c01faae2ac4e3ac3db0ee24b156bbe` |
| `NEXT_PUBLIC_API_URL` | Vercel | Railway backend + `/api/v1` |
| `NEXTAUTH_SECRET` | Vercel | `openssl rand -hex 32` |
