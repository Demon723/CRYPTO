FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/lxon-blockchain/package.json ./apps/lxon-blockchain/
COPY apps/contracts/package.json ./apps/contracts/
COPY apps/contracts-helios/package.json ./apps/contracts-helios/
COPY apps/founder-device/package.json ./apps/founder-device/
COPY apps/backend/package.json ./apps/backend/
COPY packages/shared/package.json ./packages/shared/
COPY packages/helios-types/package.json ./packages/helios-types/

RUN corepack enable && pnpm approve-builds esbuild && pnpm install --frozen-lockfile

COPY . .

RUN pnpm run build

FROM node:22-alpine

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/apps ./apps
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/cli.ts ./cli.ts

EXPOSE 8545 8546

CMD ["pnpm", "cli", "node"]
