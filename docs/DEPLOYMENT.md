# Synex Deployment Guide

## Prerequisites
- Node.js 20+
- Docker & Docker Compose
- PostgreSQL (for production)
- Redis (for production)

## Environment Setup

1. Clone the repository
2. Copy environment files:
   ```bash
   cp apps/backend/.env.example apps/backend/.env
   cp apps/frontend/.env.example apps/frontend/.env.local
   ```

3. Update environment variables with production values

## Docker Deployment

### Quick Start
```bash
docker-compose up -d
```

### Services
- Backend: http://localhost:4000
- Frontend: http://localhost:3000
- Redis: localhost:6379

## Manual Deployment

### Backend
```bash
cd apps/backend
npm install
npm run build
npm run start:prod
```

### Frontend
```bash
cd apps/frontend
npm install
npm run build
npm run start
```

## Database Migrations
```bash
cd apps/backend
npx prisma migrate deploy
npx prisma generate
```

## Production Checklist
- [ ] Set strong JWT_SECRET
- [ ] Configure PostgreSQL DATABASE_URL
- [ ] Set up Redis for caching and sessions
- [ ] Configure CORS_ORIGIN for production domain
- [ ] Set up SSL/TLS certificates
- [ ] Configure email service (SMTP)
- [ ] Set up monitoring and logging
- [ ] Configure rate limiting
- [ ] Set up database backups
- [ ] Configure CDN for static assets
