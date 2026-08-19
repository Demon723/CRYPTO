FROM node:22-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy dependency files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/shared/package.json ./packages/shared/
COPY packages/helios-types/package.json ./packages/helios-types/

# Enable pnpm and install dependencies
RUN corepack enable && \
    pnpm install --frozen-lockfile --prod

# Copy source code
COPY . .

# Build backend
RUN pnpm --filter lxon-backend build

FROM node:22-alpine

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S lxon -u 1001

# Install runtime dependencies
RUN apk add --no-cache tini

# Copy node_modules from builder
COPY --from=builder --chown=lxon:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=lxon:nodejs /app/package.json ./package.json
COPY --from=builder --chown=lxon:nodejs /app/apps/backend/dist ./dist
COPY --from=builder --chown=lxon:nodejs /app/apps/backend/package.json ./

USER lxon

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD wget -q -O- http://localhost:4000/api/v1/health || exit 1

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/main.js"]
