# Contributing

## How to Contribute

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## Development Setup

```bash
git clone https://github.com/your-org/synex.git
cd synex
pnpm install
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env.local
pnpm db:generate
pnpm db:push
pnpm dev
```
