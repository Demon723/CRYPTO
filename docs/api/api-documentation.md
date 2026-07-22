# API Documentation

## Base URL

```
https://api.synex.ai/api/v1
```

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <access_token>
```

## Endpoints

### Authentication

#### Register
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

#### Refresh Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Get Current User
```http
GET /auth/me
Authorization: Bearer <access_token>
```

### Wallets

#### Get User Wallets
```http
GET /wallets
Authorization: Bearer <access_token>
```

#### Create Wallet
```http
POST /wallets
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "address": "0x...",
  "chain": "ETHEREUM",
  "label": "My Wallet",
  "type": "EOA"
}
```

#### Sync Wallet
```http
POST /wallets/:id/sync
Authorization: Bearer <access_token>
```

### Portfolio

#### Get Portfolio Summary
```http
GET /portfolio/summary
Authorization: Bearer <access_token>
```

#### Get Asset Allocation
```http
GET /portfolio/allocation
Authorization: Bearer <access_token>
```

#### Get Performance
```http
GET /portfolio/performance?period=30d
Authorization: Bearer <access_token>
```

### AI

#### Chat
```http
POST /ai/chat
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "message": "Analyze my portfolio",
  "chatId": "optional-chat-id",
  "context": {}
}
```

#### Stream Chat (SSE)
```http
POST /ai/chat/stream
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "message": "Analyze my portfolio"
}
```

#### Analyze Portfolio
```http
POST /ai/analyze-portfolio
Authorization: Bearer <access_token>
```

#### Explain Transaction
```http
POST /ai/explain-transaction/:hash
Authorization: Bearer <access_token>
```

### Smart Contract Analyzer

#### Analyze Contract
```http
POST /scanner/analyze
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "address": "0x...",
  "chain": "ETHEREUM",
  "includeAiExplanation": true
}
```

### Transactions

#### Get Transactions
```http
GET /transactions?chain=ETHEREUM&page=1&limit=20
Authorization: Bearer <access_token>
```

#### Get Transaction Stats
```http
GET /transactions/stats
Authorization: Bearer <access_token>
```

### Alerts

#### Get User Alerts
```http
GET /alerts
Authorization: Bearer <access_token>
```

#### Create Alert
```http
POST /alerts
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "type": "PRICE",
  "condition": {
    "field": "price",
    "operator": ">",
    "value": 3000
  },
  "walletId": "optional-wallet-id"
}
```

### Tokens

#### Search Tokens
```http
GET /tokens/search?q=ETH&chain=ETHEREUM
Authorization: Bearer <access_token>
```

#### Get Token Details
```http
GET /tokens/:address?chain=ETHEREUM
Authorization: Bearer <access_token>
```

### Subscriptions

#### Get Current Subscription
```http
GET /subscriptions/current
Authorization: Bearer <access_token>
```

#### Upgrade Subscription
```http
POST /subscriptions/upgrade?plan=PRO
Authorization: Bearer <access_token>
```

### Developer API

#### Create API Key
```http
POST /developer/keys
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "My API Key",
  "permissions": { "read": true },
  "expiresAt": "2025-12-31"
}
```

## Response Format

### Success Response
```json
{
  "data": {},
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20
  }
}
```

### Error Response
```json
{
  "statusCode": 400,
  "message": "Error message",
  "error": "Bad Request",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/v1/endpoint"
}
```

## Rate Limiting

- Default: 100 requests per 15 minutes
- Authenticated: 1000 requests per hour
- API Keys: Custom limits based on plan

## WebSocket Events

### Connection
```javascript
const socket = io('wss://api.synex.ai', {
  auth: {
    token: '<access_token>'
  }
});
```

### Events
- `alert:triggered` - New alert triggered
- `price:update` - Price update for watchlist
- `transaction:new` - New transaction detected
- `notification:new` - New notification

## Pagination

All list endpoints support pagination:

```
GET /endpoint?page=1&limit=20
```

Response includes:
```json
{
  "data": [],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```
