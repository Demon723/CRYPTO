FROM node:22-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy dependency files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/lxon-blockchain/package.json ./apps/lxon-blockchain/
COPY apps/contracts/package.json ./apps/contracts/
COPY apps/contracts-helios/package.json ./apps/contracts-helios/
COPY apps/founder-device/package.json ./apps/founder-device/
COPY apps/backend/package.json ./apps/backend/
COPY packages/shared/package.json ./packages/shared/
COPY packages/helios-types/package.json ./packages/helios-types/

# Enable pnpm and install dependencies
RUN corepack enable && \
    pnpm approve-builds esbuild && \
    pnpm install --frozen-lockfile --prod

# Copy source code
COPY . .

# Build blockchain
RUN pnpm --filter lxon-blockchain build

FROM node:22-alpine

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S lxon -u 1001

# Copy node_modules from builder
COPY --from=builder --chown=lxon:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=lxon:nodejs /app/package.json ./package.json
COPY --from=builder --chown=lxon:nodejs /app/apps/lxon-blockchain ./apps/lxon-blockchain
COPY --from=builder --chown=lxon:nodejs /app/packages ./packages

# Create data and logs directories
RUN mkdir -p /app/data /app/logs && chown -R lxon:nodejs /app

USER lxon

EXPOSE 8545 8546

HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD wget -q -O- http://localhost:8545/health || exit 1

CMD ["node", "apps/lxon-blockchain/dist/rpc/node.js"]
