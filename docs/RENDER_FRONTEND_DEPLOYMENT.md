# Render Frontend Deployment Tutorial

## Overview
Deploy the frontend to Render while keeping the backend on Railway. This provides a good alternative to moving services between Railway projects.

## Prerequisites
- Render account (free tier available)
- GitHub repository access
- Railway backend already deployed at `https://synex-47.up.railway.app`

## Step-by-Step Instructions

### Step 1: Prepare Render Account

1. Go to https://render.com
2. Sign up or log in
3. Connect your GitHub account
4. Authorize Render to access your repositories

### Step 2: Create New Web Service

1. Click **"New +"** button in Render dashboard
2. Select **"Web Service"**
3. Choose your repository: `Demon723/CRYPTO`
4. Configure the service:

**Basic Settings:**
- **Name**: `synex-frontend`
- **Region**: Choose closest to your users (e.g., Oregon, Frankfurt)
- **Branch**: `main`

**Build & Deploy Settings:**
- **Runtime**: `Node`
- **Build Command**: `cd apps/frontend && pnpm install && pnpm run build`
- **Start Command**: `cd apps/frontend && npm run start`

**Advanced Settings:**
- **Root Directory**: Leave empty (we'll handle this in build command)
- **Instance Type**: `Free` (or `Standard` for better performance)

### Step 3: Configure Environment Variables

After creating the service, go to **Environment** tab and add:

```bash
# Backend API URLs
NEXT_PUBLIC_API_URL=https://synex-47.up.railway.app/api/v1
NEXT_PUBLIC_WS_URL=wss://synex-47.up.railway.app

# Frontend URL (update after deployment)
NEXT_PUBLIC_APP_URL=https://synex-frontend.onrender.com
NEXTAUTH_URL=https://synex-frontend.onrender.com

# NextAuth Secret
NEXTAUTH_SECRET=<generate with: openssl rand -hex 32>

# Node version (optional, defaults to latest)
NODE_VERSION=20
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -hex 32
```

### Step 4: Update Railway Backend CORS

1. Go to Railway dashboard: https://railway.com
2. Navigate to **SYNEX BACKEND** project
3. Select the **SYNEX** service (backend)
4. Go to **Variables** tab
5. Update `CORS_ORIGIN` to include Render domain:

```bash
CORS_ORIGIN=http://localhost:3000,https://synex-frontend.onrender.com
```

6. Railway will automatically redeploy the backend with new CORS settings

### Step 5: Deploy and Test

1. Render will automatically deploy on push to main branch
2. Wait for deployment to complete (check Render dashboard)
3. Open the deployed URL: `https://synex-frontend.onrender.com`
4. Test registration functionality
5. Check browser console for any errors

### Step 6: Update Frontend Environment Variables (if needed)

If Render assigns a different URL than expected:

1. Check the actual URL in Render dashboard
2. Update `NEXT_PUBLIC_APP_URL` and `NEXTAUTH_URL` in Render environment variables
3. Update `CORS_ORIGIN` in Railway backend variables
4. Redeploy both services

## Custom Domain (Optional)

### Step 1: Add Custom Domain in Render

1. Go to your web service in Render
2. Click **"Custom Domains"**
3. Click **"Add Custom Domain"**
4. Enter your domain (e.g., `synex.yourdomain.com`)

### Step 2: Update DNS

1. Add CNAME record in your DNS provider:
   - **Name**: `synex` (or your subdomain)
   - **Type**: `CNAME`
   - **Value**: `synex-frontend.onrender.com`

### Step 3: Update Environment Variables

1. Update `NEXT_PUBLIC_APP_URL` in Render
2. Update `NEXTAUTH_URL` in Render  
3. Update `CORS_ORIGIN` in Railway backend

## Troubleshooting

### Build Fails

**Issue:** Build command fails
**Solution:**
- Check build logs in Render dashboard
- Verify pnpm is installed (Render supports pnpm)
- Try using npm instead: `npm install && npm run build`

### Environment Variables Not Working

**Issue:** API calls fail or wrong URL used
**Solution:**
- Verify `NEXT_PUBLIC_` prefix is used for frontend variables
- Check that variables are set in correct environment (production)
- Redeploy after changing environment variables

### CORS Errors

**Issue:** Browser shows CORS errors
**Solution:**
- Verify Railway backend `CORS_ORIGIN` includes Render URL
- Check that Render URL uses HTTPS
- Ensure both services are running

### Database Connection Errors

**Issue:** Backend can't connect to database
**Solution:**
- This shouldn't affect Render frontend (backend is on Railway)
- Verify Railway backend has PostgreSQL service
- Check Railway backend logs for database errors

### Slow Performance

**Issue:** Frontend loads slowly
**Solution:**
- Upgrade to paid Render instance (Standard or Pro)
- Enable caching in Next.js
- Optimize images and assets

## Comparison: Render vs Railway

### Render Advantages:
- Free tier with generous limits
- Better Next.js support out of the box
- Easy custom domain setup
- Good documentation
- Separate from Railway (redundancy)

### Railway Advantages:
- Both services in same project (simpler management)
- Shared database access
- Built-in service discovery
- Easier local development with Railway CLI

## Current Architecture

```
┌─────────────────┐         ┌─────────────────┐
│   Render        │         │   Railway        │
│   Frontend      │────────▶│   Backend        │
│   (Next.js)     │  HTTPS  │   (NestJS)       │
│                 │         │                 │
│ onrender.com    │         │ up.railway.app   │
└─────────────────┘         └─────────────────┘
                                    │
                                    ▼
                            ┌─────────────────┐
                            │   Railway       │
                            │   PostgreSQL    │
                            │   Redis         │
                            └─────────────────┘
```

## Verification Checklist

- [ ] Frontend deployed successfully on Render
- [ ] Environment variables configured correctly
- [ ] Railway backend CORS updated with Render URL
- [ ] Registration works end-to-end
- [ ] API calls succeed without CORS errors
- [ ] WebSocket connections work (if applicable)
- [ ] Custom domain configured (if desired)

## Cost Considerations

**Render Free Tier:**
- 750 hours/month usage
- 512MB RAM
- Shared CPU
- Good for development/low traffic

**Render Standard ($7/month):**
- 512MB RAM
- Dedicated CPU
- Better performance
- Recommended for production

**Railway Backend:**
- $5/month for backend service
- Free tier for PostgreSQL (500MB)
- Free tier for Redis (25MB)

## Summary

Using Render for frontend and Railway for backend provides:
- ✅ Separation of concerns
- ✅ Better Next.js support
- ✅ Cost-effective (both have free tiers)
- ✅ Reliable CORS configuration
- ✅ Database access through Railway backend

The key is proper CORS configuration on Railway backend to allow requests from Render frontend.
