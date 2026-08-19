# Railway Frontend Migration Tutorial

## Problem
The frontend and backend are currently in separate Railway projects:
- **SYNEX BACKEND project**: Backend service + PostgreSQL + Redis
- **synex project**: Frontend service only (no database access)

This causes the NO_SOCKET error because the backend cannot access the database when called from the frontend in a different project.

## Solution
Move the frontend service to the SYNEX BACKEND project so both services can access the same databases.

## Step-by-Step Instructions

### Step 1: Delete Frontend from Current Project

1. Go to Railway dashboard: https://railway.com
2. Navigate to the **"synex"** project
3. Find the **"synex"** service (frontend)
4. Click on the service
5. Go to **Settings** tab
6. Scroll down to **Danger Zone**
7. Click **"Delete Service"**
8. Confirm deletion

### Step 2: Add Frontend to SYNEX BACKEND Project

1. Navigate to the **"SYNEX BACKEND"** project
2. Click **"New Service"** or **"+"** button
3. Select **"Deploy from GitHub repo"**
4. Select your repository: `Demon723/CRYPTO`
5. Configure the service:
   - **Name**: `frontend`
   - **Root Directory**: `apps/frontend`
   - **Build Command**: `pnpm run build`
   - **Start Command**: `npm run start`
6. Click **"Deploy"**

### Step 3: Configure Environment Variables

1. After deployment, click on the new **frontend** service
2. Go to **Variables** tab
3. Add the following variables:

```bash
NEXT_PUBLIC_API_URL=https://synex-47.up.railway.app/api/v1
NEXT_PUBLIC_WS_URL=wss://synex-47.up.railway.app
NEXT_PUBLIC_APP_URL=https://<new-frontend-url>.up.railway.app
NEXTAUTH_URL=https://<new-frontend-url>.up.railway.app
NEXTAUTH_SECRET=<generate with: openssl rand -hex 32>
```

4. Replace `<new-frontend-url>` with the actual frontend URL after deployment

### Step 4: Update Backend CORS

1. Navigate to the **SYNEX** service (backend) in SYNEX BACKEND project
2. Go to **Variables** tab
3. Update `CORS_ORIGIN` to include the new frontend URL:

```bash
CORS_ORIGIN=http://localhost:3000,https://<new-frontend-url>.up.railway.app
```

### Step 5: Link Services (Optional but Recommended)

1. In the SYNEX BACKEND project, go to the frontend service
2. Click **Settings** tab
3. Under **Dependencies**, add the **Postgres** and **Redis** services
4. This ensures proper service discovery and connection

### Step 6: Test the Application

1. Wait for both services to redeploy
2. Open the frontend URL in your browser
3. Try to register a new account
4. Check that the registration succeeds

## Verification

To verify the migration was successful:

1. Check Railway dashboard - both services should be in **SYNEX BACKEND** project
2. Frontend should be able to call backend API without CORS errors
3. Backend should be able to connect to PostgreSQL without NO_SOCKET errors
4. Registration should work properly

## Troubleshooting

### Frontend not building
- Check that `pnpm` is available in the build environment
- Verify the build command: `pnpm run build`
- Check build logs for errors

### CORS errors
- Verify `CORS_ORIGIN` includes the frontend URL
- Check that the frontend URL is HTTPS (required for production)
- Ensure both services are in the same project

### Database connection errors
- Verify PostgreSQL service is running in SYNEX BACKEND project
- Check that DATABASE_URL is available to backend service
- Ensure services are properly linked

### Environment variables not working
- Verify variable names match exactly (case-sensitive)
- Check that NEXT_PUBLIC_ variables are set for frontend
- Ensure variables are set in the correct environment (production)

## Alternative: CLI Method

If you prefer using the Railway CLI:

```bash
# Navigate to frontend directory
cd /Users/adikamble/CRYPTO/apps/frontend

# Unlink from current project
railway unlink

# Link to SYNEX BACKEND project
railway link

# Select SYNEX BACKEND project
# Select production environment
# Skip service selection (will create new service)

# Deploy
railway up

# Set environment variables
railway variables set NEXT_PUBLIC_API_URL=https://synex-47.up.railway.app/api/v1
railway variables set NEXT_PUBLIC_WS_URL=wss://synex-47.up.railway.app
railway variables set NEXTAUTH_SECRET=$(openssl rand -hex 32)
```

## Summary

After completing this migration:
- ✅ Frontend and backend in same Railway project
- ✅ Both services share same PostgreSQL and Redis databases
- ✅ CORS properly configured between services
- ✅ Registration and authentication should work
- ✅ NO_SOCKET errors resolved
