#!/bin/bash
set -e

echo "=== Synex Deployment Script ==="
echo ""

command -v node >/dev/null 2>&1 || { echo "Node.js is required but not installed."; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "npm is required but not installed."; exit 1; }

echo "Step 1: Install Railway CLI"
echo "------------------------------"
if ! command -v railway >/dev/null 2>&1; then
    npm install -g @railway/cli || {
        echo "Failed to install Railway CLI globally. Try: sudo npm install -g @railway/cli"
        exit 1
    }
else
    echo "Railway CLI already installed"
fi

echo ""
echo "Step 2: Install Vercel CLI"
echo "------------------------------"
if ! command -v vercel >/dev/null 2>&1; then
    npm install -g vercel || {
        echo "Failed to install Vercel CLI globally. Try: sudo npm install -g vercel"
        exit 1
    }
else
    echo "Vercel CLI already installed"
fi

echo ""
echo "Step 3: Verify CLIs"
echo "------------------------------"
railway --version
vercel --version

echo ""
echo "Step 4: Deploy Backend to Railway"
echo "------------------------------"
cd /Users/adikamble/CRYPTO

echo "Logging into Railway..."
railway login

echo ""
echo "Initializing Railway project..."
railway init

echo ""
echo "Adding PostgreSQL..."
railway add -p postgres

echo ""
echo "Adding Redis..."
railway add -p redis

echo ""
echo "Setting environment variables..."
railway variables set NODE_ENV=production
railway variables set PORT=4000
railway variables set JWT_SECRET=$(openssl rand -hex 32)
railway variables set JWT_REFRESH_SECRET=$(openssl rand -hex 32)
railway variables set SYNEX_OWNER_KEY=8075c0e4d8e34d9d04f502dbaab7acecd5c01faae2ac4e3ac3db0ee24b156bbe

echo ""
echo "Deploying backend..."
railway up

echo ""
echo "Running database migrations..."
railway run npx prisma migrate deploy

echo ""
echo "Backend deployed successfully!"
echo "Backend URL: $(railway status --json | grep -o 'https://[^"]*' | head -1)"

echo ""
echo "Step 5: Deploy Frontend to Vercel"
echo "------------------------------"
cd /Users/adikamble/CRYPTO/apps/frontend

echo "Logging into Vercel..."
vercel login

echo ""
echo "Setting environment variables..."
read -p "Enter your Railway backend URL (e.g., https://synex-backend-production.up.railway.app): " BACKEND_URL

vercel env add NEXT_PUBLIC_API_URL production "$BACKEND_URL/api/v1"
vercel env add NEXT_PUBLIC_WS_URL production "wss://$(echo "$BACKEND_URL" | sed 's/https:\/\//')"
vercel env add NEXT_PUBLIC_APP_URL production
echo "Enter your frontend URL (e.g., https://synex-frontend.vercel.app):"
read -r FRONTEND_URL
vercel env add NEXTAUTH_URL production "$FRONTEND_URL"
vercel env add NEXTAUTH_SECRET production "$(openssl rand -hex 32)"

echo ""
echo "Deploying frontend..."
vercel --prod

echo ""
echo "=========================================="
echo "Deployment Complete!"
echo "=========================================="
echo ""
echo "Backend: $BACKEND_URL"
echo "Frontend: $FRONTEND_URL"
echo ""
echo "Next steps:"
echo "1. Update CORS on Railway: railway variables set CORS_ORIGIN=$FRONTEND_URL"
echo "2. Test the application"
echo "3. Run 'railway logs' to monitor backend"
echo "4. Run 'vercel logs' to monitor frontend"
