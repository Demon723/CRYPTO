# Deployment Guide

## Prerequisites

- Docker & Docker Compose
- Kubernetes cluster (for production)
- Domain name with DNS configured
- SSL certificate (Let's Encrypt recommended)
- Environment variables configured

## Quick Deployment with Docker

### 1. Clone and Configure

```bash
git clone https://github.com/your-org/synex.git
cd synex
```

### 2. Configure Environment

```bash
# Backend
cp apps/backend/.env.example apps/backend/.env

# Frontend
cp apps/frontend/.env.example apps/frontend/.env.local
```

### 3. Start Services

```bash
docker compose -f infrastructure/docker/docker-compose.yml up -d
```

### 4. Run Migrations

```bash
docker compose exec backend pnpm db:migrate
docker compose exec backend pnpm db:seed
```

### 5. Verify

```bash
curl http://localhost/health
curl http://localhost/api/v1/health
```

## Production Deployment

### Option 1: Docker Compose (Small Scale)

```bash
# Set production environment variables
export NODE_ENV=production
export DATABASE_URL=postgresql://...
export JWT_SECRET=...

# Start services
docker compose -f infrastructure/docker/docker-compose.yml up -d

# View logs
docker compose logs -f
```

### Option 2: Kubernetes (Production Scale)

1. **Create namespace**
```bash
kubectl apply -f infrastructure/k8s/namespace.yaml
```

2. **Create secrets**
```bash
kubectl create secret generic synex-secrets \
  --from-literal=database-url=postgresql://... \
  --from-literal=jwt-secret=... \
  -n synex
```

3. **Deploy applications**
```bash
kubectl apply -f infrastructure/k8s/
```

4. **Verify deployment**
```bash
kubectl get pods -n synex
kubectl get services -n synex
kubectl get ingress -n synex
```

### Option 3: Vercel + Railway

**Frontend (Vercel)**:
1. Connect GitHub repository
2. Set root directory to `apps/frontend`
3. Add environment variables
4. Deploy

**Backend (Railway)**:
1. Connect GitHub repository
2. Set root directory to `apps/backend`
3. Add environment variables
4. Deploy

## Environment Variables

### Backend

```env
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://...
REDIS_HOST=redis
REDIS_PORT=6379
JWT_SECRET=...
JWT_REFRESH_SECRET=...
OPENAI_API_KEY=...
ETHERSCAN_API_KEY=...
```

### Frontend

```env
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.synex.ai/api/v1
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=...
NEXT_PUBLIC_ETHEREUM_RPC_URL=...
```

## SSL/TLS Configuration

### Using Let's Encrypt with Cert-Manager

```bash
# Install cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Create ClusterIssuer
kubectl apply -f infrastructure/k8s/cert-manager.yaml
```

### Using Nginx with SSL

```bash
# Copy SSL certificates
cp /path/to/certs/*.pem infrastructure/docker/ssl/

# Update nginx.conf with your domain
# Restart nginx
docker compose restart nginx
```

## Database Management

### Backups

```bash
# Backup PostgreSQL
docker compose exec postgres pg_dump -U postgres synex > backup.sql

# Restore
docker compose exec -T postgres psql -U postgres synex < backup.sql
```

### Migrations

```bash
# Production migrations
docker compose exec backend pnpm db:migrate
```

## Monitoring

### Health Checks

```bash
# Application health
curl https://synex.ai/health

# Database health
curl https://synex.ai/api/v1/health
```

### Logs

```bash
# Docker logs
docker compose logs -f backend
docker compose logs -f frontend

# Kubernetes logs
kubectl logs -f deployment/backend -n synex
```

## Scaling

### Horizontal Scaling

```bash
# Scale backend
kubectl scale deployment/backend --replicas=5 -n synex

# Scale frontend
kubectl scale deployment/frontend --replicas=3 -n synex
```

### Database Scaling

- Read replicas for read-heavy workloads
- Connection pooling (PgBouncer)
- Database partitioning for large tables

## Updates

### Rolling Update

```bash
# Build new image
docker build -t synex/backend:latest ./apps/backend

# Deploy
kubectl set image deployment/backend backend=synex/backend:latest -n synex

# Monitor rollout
kubectl rollout status deployment/backend -n synex
```

## Troubleshooting

### Common Issues

1. **Database connection refused**
   - Check PostgreSQL is running
   - Verify DATABASE_URL
   - Check network connectivity

2. **Redis connection failed**
   - Check Redis is running
   - Verify REDIS_HOST and REDIS_PORT

3. **JWT token errors**
   - Verify JWT_SECRET is set
   - Check token expiration

4. **CORS errors**
   - Verify CORS_ORIGIN includes frontend URL
   - Check browser console for details
