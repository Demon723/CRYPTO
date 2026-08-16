FROM node:22-alpine AS base

WORKDIR /app

# Copy dependency files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/block-explorer/package.json ./apps/block-explorer/

# Enable pnpm and install dependencies
RUN corepack enable && \
    pnpm install --frozen-lockfile

# Copy source code and build
COPY . .
RUN pnpm --filter block-explorer build

# Production image
FROM node:22-alpine

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S lxon -u 1001

# Copy from builder
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/apps/block-explorer/package.json ./package.json
COPY --from=base /app/apps/block-explorer/.next ./.next
COPY --from=base /app/apps/block-explorer/public ./public

USER lxon

EXPOSE 3000

ENV NODE_ENV production
ENV PORT 3000

HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD wget -q -O- http://localhost:3000 || exit 1

CMD ["node_modules/.bin/next", "start"]
