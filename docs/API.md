# Synex API Documentation

## Base URL
```
http://localhost:4000/api/v1
```

## Authentication

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <access_token>
```

## Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user
- `POST /auth/refresh` - Refresh access token

### Users
- `GET /users/me` - Get current user profile
- `PATCH /users/me` - Update user profile
- `PATCH /users/password` - Change password

### Wallets
- `GET /wallets` - Get all user wallets
- `POST /wallets` - Create a new wallet
- `GET /wallets/:id` - Get wallet by ID
- `POST /wallets/embedded` - Create embedded wallet
- `POST /wallets/embedded/recover` - Recover embedded wallet

### Portfolio
- `GET /portfolio` - Get portfolio overview
- `GET /portfolio/risk-score` - Get portfolio risk score
- `GET /portfolio/balances` - Get all token balances

### AI
- `POST /ai/chat` - Send message to AI assistant
- `POST /ai/transaction/intent` - Parse natural language transaction
- `POST /ai/transaction/build` - Build transaction from natural language
- `POST /ai/analyze-portfolio` - AI portfolio analysis
- `POST /ai/explain-transaction/:hash` - Explain transaction with AI

### Governance
- `GET /governance/proposals` - List proposals
- `POST /governance/proposals/vote` - Vote on proposal
- `POST /governance/proposals` - Create proposal
- `GET /governance/voting-power` - Get voting power

### Analytics
- `GET /analytics/portfolio` - Get portfolio analytics
- `GET /analytics/transactions` - Get transaction history
- `GET /analytics/performance` - Get performance metrics

### Tokens
- `GET /tokens/search` - Search tokens
- `GET /tokens/:address` - Get token details
- `GET /tokens/utility/benefits` - Get token utility benefits
- `GET /tokens/utility/revenue-share` - Get revenue share
- `GET /tokens/utility/staking-rewards` - Get staking rewards

### Health
- `GET /health` - Service health check

## Error Responses

All errors follow this format:
```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Bad Request"
}
```

## Rate Limiting

- Rate limit: 100 requests per 15 minutes
- Rate limit headers are included in responses
- `/health` and `/api/docs` are excluded from rate limiting
