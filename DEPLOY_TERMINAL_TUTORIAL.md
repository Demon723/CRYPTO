# Synex Deployment Terminal Tutorial

This guide walks you through deploying the Synex monorepo from the terminal using Railway for the backend and Vercel for the frontend.

## 1. Prerequisites

Make sure these are installed and available in your terminal:

- Node.js 20+
- npm
- Git
- A Railway account
- A Vercel account

Verify the tools:

```bash
node -v
npm -v
git --version
```

If npm gives permission errors, fix it first:

```bash
mkdir -p ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.zshrc
source ~/.zshrc
```

---

## 2. Install deployment CLIs

```bash
npm install -g @railway/cli
npm install -g vercel
```

Verify installation:

```bash
railway --version
vercel --version
```

---

## 3. Log in to the services

```bash
cd /Users/adikamble/CRYPTO
railway login
vercel login
```

---

## 4. Deploy the backend to Railway

### 4.1 Initialize the Railway project

```bash
cd /Users/adikamble/CRYPTO
railway init
```

Choose the option to create a new project and give it a name such as `synex`.

### 4.2 Add PostgreSQL and Redis

Use the interactive Railway add flow for the services you want:

```bash
railway add
```

Then choose the PostgreSQL and Redis services from the list when prompted.

If your Railway CLI version does not show the service list, use the interactive menu and select the plugin/service entries manually.

### 4.3 Set backend environment variables

```bash
railway variables set NODE_ENV=production
railway variables set PORT=4000
railway variables set JWT_SECRET=$(openssl rand -hex 32)
railway variables set JWT_REFRESH_SECRET=$(openssl rand -hex 32)
railway variables set SYNEX_OWNER_KEY=8075c0e4d8e34d9d04f502dbaab7acecd5c01faae2ac4e3ac3db0ee24b156bbe
```

Railway will automatically inject PostgreSQL and Redis connection values such as `DATABASE_URL`, `DIRECT_URL`, `REDIS_HOST`, and `REDIS_PORT` for the attached plugins.

### 4.4 Configure Railway build settings

In the Railway dashboard:

1. Open your backend service.
2. Go to Settings > Build & Deploy.
3. Set:
   - Service Root: `apps/backend`
   - Builder: `Dockerfile`
   - Dockerfile Path: `apps/backend/Dockerfile`
   - Start Command: `node dist/main`

### 4.5 Deploy the backend

```bash
railway up
```

### 4.6 Run Prisma migrations

```bash
railway run npx prisma migrate deploy
```

### 4.7 Verify the backend

```bash
railway open
curl https://your-backend-url.up.railway.app/health
```

You should receive a health response from the API.

---

## 5. Deploy the frontend to Vercel

### 5.1 Set frontend environment variables

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

### 5.2 Deploy the frontend

```bash
vercel --prod
```

### 5.3 Verify the frontend

```bash
vercel open
```

---

## 6. Final CORS update

After the frontend URL is known, update the backend CORS origin:

```bash
cd /Users/adikamble/CRYPTO
railway variables set CORS_ORIGIN=https://your-frontend-url.vercel.app
```

---

## 7. Useful commands

### Railway

```bash
railway logs
railway status
railway run npx prisma db pull
railway run npx prisma generate
```

### Vercel

```bash
vercel logs
vercel env ls
```

---

## 8. Troubleshooting

### `command not found: railway`

```bash
npm install -g @railway/cli
```

### `command not found: vercel`

```bash
npm install -g vercel
```

### Build fails in Railway

Make sure Railway uses:

- Service Root: `apps/backend`
- Dockerfile Path: `apps/backend/Dockerfile`

### Database connection issues

Check that the PostgreSQL plugin is attached and that Railway has injected `DATABASE_URL` and `DIRECT_URL`.

### CORS errors in the browser

Ensure `CORS_ORIGIN` matches the deployed frontend domain exactly.

---

## 9. Quick deployment summary

```bash
cd /Users/adikamble/CRYPTO
railway login
railway init
railway add -p postgres
railway add -p redis
railway variables set NODE_ENV=production
railway variables set PORT=4000
railway variables set JWT_SECRET=$(openssl rand -hex 32)
railway variables set JWT_REFRESH_SECRET=$(openssl rand -hex 32)
railway variables set SYNEX_OWNER_KEY=8075c0e4d8e34d9d04f502dbaab7acecd5c01faae2ac4e3ac3db0ee24b156bbe
railway up
railway run npx prisma migrate deploy
```

Then deploy the frontend to Vercel using the backend URL and the `NEXT_PUBLIC_API_URL` environment variable.
