# Dockerfile for LXON Blockchain Node Daemon on AWS ECS / Kubernetes / EC2
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package descriptors
COPY package.json tsconfig.json ./

# Install dependencies
RUN npm install --frozen-lockfile || npm install

# Copy source files
COPY src ./src

# Build TypeScript to dist
RUN npm run build

# ── Runtime Stage ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8545
ENV DATA_DIR=/data

# Create persistent storage directory
RUN mkdir -p /data && chown -R node:node /data

COPY package.json ./
COPY --from=builder /app/dist ./dist

USER node

EXPOSE 8545

# AWS ALB & ECS Healthcheck
HEALTHCHECK --interval=10s --timeout=5s --start-period=5s --retries=3   CMD wget --no-verbose --tries=1 --spider http://localhost:8545/health || exit 1

CMD ["node", "dist/node.js"]
