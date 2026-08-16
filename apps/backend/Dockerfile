FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
COPY apps/backend/package.json ./apps/backend/

RUN corepack enable && pnpm install --frozen-lockfile

COPY apps/backend ./apps/backend

RUN pnpm --filter lxon-backend build

FROM node:22-alpine

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/backend ./apps/backend
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

CMD ["pnpm", "--filter", "lixon-backend", "start:prod"]
