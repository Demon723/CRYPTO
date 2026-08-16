FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
COPY apps/block-explorer/package.json ./apps/block-explorer/

RUN corepack enable && pnpm install --frozen-lockfile

COPY apps/block-explorer ./apps/block-explorer

RUN pnpm --filter lxon-block-explorer build

FROM nginx:alpine

COPY --from=builder /app/apps/block-explorer/dist /usr/share/nginx/html
COPY apps/block-explorer/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
