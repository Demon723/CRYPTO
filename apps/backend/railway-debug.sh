#!/bin/bash
set -e

echo "=== Railway Debug Script ==="
echo ""

echo "1. Check Railway status"
echo "------------------------------"
cd /Users/adikamble/CRYPTO/apps/backend
railway status

echo ""
echo "2. Check Railway variables"
echo "------------------------------"
railway variables

echo ""
echo "3. Check for DATABASE_URL"
echo "------------------------------"
railway variables | grep DATABASE || echo "DATABASE_URL not found in Railway variables"

echo ""
echo "4. Check for REDIS"
echo "------------------------------"
railway variables | grep REDIS || echo "REDIS not found in Railway variables"

echo ""
echo "5. Check local .env"
echo "------------------------------"
grep -E "DATABASE_URL|REDIS_HOST|REDIS_PORT" .env || echo "No hardcoded DB/Redis in .env (good)"

echo ""
echo "=== Fix Instructions ==="
echo ""
echo "If DATABASE_URL is missing:"
echo "1. Go to https://railway.app"
echo "2. Open project: CRYPTO"
echo "3. Click '+ New' -> 'Database' -> 'PostgreSQL'"
echo "4. Wait for provisioning"
echo "5. Redeploy backend service"
echo ""
echo "If REDIS is missing:"
echo "1. Go to https://railway.app"
echo "2. Open project: CRYPTO"
echo "3. Click '+ New' -> 'Database' -> 'Redis'"
echo "4. Wait for provisioning"
echo "5. Redeploy backend service"
