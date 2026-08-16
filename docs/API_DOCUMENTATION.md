# LXON API Documentation

## REST API Endpoints

### Base URL
```
https://api.lxon.network/v1
```

### Authentication
API requests require authentication using an API key in the header:
```
Authorization: Bearer YOUR_API_KEY
```

## Endpoints

### Network

#### Get Network Info
```http
GET /network/info
```

**Response**:
```json
{
  "chainId": 1,
  "name": "lxon-mainnet",
  "blockNumber": 12345678,
  "blockHash": "0x...",
  "blockTimestamp": 1699999999
}
```

#### Get Block
```http
GET /block/:blockNumber
```

**Parameters**:
- `blockNumber` (path): Block number

**Response**:
```json
{
  "number": 12345678,
  "hash": "0x...",
  "parentHash": "0x...",
  "timestamp": 1699999999,
  "transactions": [
    {
      "hash": "0x...",
      "from": "0x...",
      "to": "0x...",
      "value": "1000000000000000000",
      "gasUsed": "21000"
    }
  ]
}
```

### Accounts

#### Get Balance
```http
GET /account/:address/balance
```

**Parameters**:
- `address` (path): Account address

**Response**:
```json
{
  "address": "0x...",
  "accountBalance": "1000000000000000000",
  "utxoBalance": "500000000000000000",
  "totalBalance": "1500000000000000000"
}
```

#### Get UTXOs
```http
GET /account/:address/utxos
```

**Parameters**:
- `address` (path): Account address

**Response**:
```json
{
  "address": "0x...",
  "utxos": [
    {
      "txId": "0x...",
      "outputIndex": 0,
      "amount": "1000000000000000000",
      "owner": "0x...",
      "spent": false
    }
  ]
}
```

### Transactions

#### Estimate Fee
```http
GET /transaction/estimate-fee?confirmations=6
```

**Parameters**:
- `confirmations` (query, optional): Target confirmations (default: 6)

**Response**:
```json
{
  "gasPrice": "1000000000",
  "maxFeePerGas": "2000000000",
  "maxPriorityFeePerGas": "1000000000",
  "estimatedFee": "21000000000000",
  "confirmations": 6
}
```

#### Send Transaction
```http
POST /transaction/send
```

**Request Body**:
```json
{
  "to": "0x...",
  "value": "1000000000000000000",
  "data": "0x...",
  "gasLimit": "21000"
}
```

**Response**:
```json
{
  "hash": "0x...",
  "blockNumber": 12345678,
  "gasUsed": "21000",
  "status": "success"
}
```

#### Get Transaction
```http
GET /transaction/:hash
```

**Parameters**:
- `hash` (path): Transaction hash

**Response**:
```json
{
  "hash": "0x...",
  "blockNumber": 12345678,
  "from": "0x...",
  "to": "0x...",
  "value": "1000000000000000000",
  "gasUsed": "21000",
  "status": "success"
}
```

### Scripting

#### Compile Miniscript
```http
POST /scripting/compile-miniscript
```

**Request Body**:
```json
{
  "miniscript": "or(0, pk(A))"
}
```

**Response**:
```json
{
  "compiledScript": "0x...",
  "size": 32
}
```

#### Validate Script
```http
POST /scripting/validate
```

**Request Body**:
```json
{
  "script": "0x..."
}
```

**Response**:
```json
{
  "valid": true,
  "errors": []
}
```

### Cryptography

#### Generate Hybrid Key Pair
```http
POST /crypto/generate-hybrid-keypair
```

**Response**:
```json
{
  "classicalKey": "0x...",
  "postQuantumKey": "0x..."
}
```

#### Sign Message
```http
POST /crypto/sign
```

**Request Body**:
```json
{
  "keyPair": {
    "classicalKey": "0x...",
    "postQuantumKey": "0x..."
  },
  "message": "message to sign"
}
```

**Response**:
```json
{
  "classicalSignature": "0x...",
  "postQuantumSignature": "0x..."
}
```

#### Verify Signature
```http
POST /crypto/verify
```

**Request Body**:
```json
{
  "keyPair": {
    "classicalKey": "0x...",
    "postQuantumKey": "0x..."
  },
  "message": "message to verify",
  "signature": {
    "classicalSignature": "0x...",
    "postQuantumSignature": "0x..."
  }
}
```

**Response**:
```json
{
  "valid": true
}
```

### Fee Market

#### Get Mempool Info
```http
GET /fee/mempool
```

**Response**:
```json
{
  "size": 1000,
  "totalFee": "1000000000000000000",
  "averageFee": "1000000000000000"
}
```

#### Get Prioritized Transactions
```http
GET /fee/prioritized?count=10
```

**Parameters**:
- `count` (query, optional): Number of transactions (default: 10)

**Response**:
```json
{
  "transactions": [
    {
      "txId": "0x...",
      "fee": "1000000000000000",
      "timestamp": 1699999999
    }
  ]
}
```

## Error Responses

All endpoints may return error responses:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": {}
  }
}
```

### Error Codes

- `NETWORK_ERROR`: Network connection error
- `INVALID_ADDRESS`: Invalid address format
- `INSUFFICIENT_FUNDS`: Insufficient balance
- `INVALID_TRANSACTION`: Invalid transaction data
- `AUTHENTICATION_ERROR`: Invalid API key
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INTERNAL_ERROR`: Internal server error

## Rate Limiting

- **Standard**: 100 requests per minute
- **Premium**: 1000 requests per minute

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1699999999
```

## WebSocket API

### Connection
```
wss://api.lxon.network/v1/ws
```

### Events

#### New Block
```json
{
  "event": "newBlock",
  "data": {
    "number": 12345678,
    "hash": "0x..."
  }
}
```

#### New Transaction
```json
{
  "event": "newTransaction",
  "data": {
    "hash": "0x...",
    "from": "0x...",
    "to": "0x...",
    "value": "1000000000000000000"
  }
}
```

#### Mempool Update
```json
{
  "event": "mempoolUpdate",
  "data": {
    "size": 1000,
    "averageFee": "1000000000000000"
  }
}
```

## SDK Integration

The REST API is fully compatible with the TypeScript SDK:

```typescript
import { LXONClient } from '@lxon/sdk';

// The SDK uses the REST API internally
const client = new LXONClient({
  rpcUrl: 'https://api.lxon.network/v1'
});

await client.connect();
const balance = await client.getBalance('0x...');
```

## Testing

### Testnet API
```
https://testnet-api.lxon.network/v1
```

### Sandbox API
```
https://sandbox-api.lxon.network/v1
```

## Changelog

### v1.0.0 (2024)
- Initial API release
- Network endpoints
- Account endpoints
- Transaction endpoints
- Scripting endpoints
- Cryptography endpoints
- Fee market endpoints
- WebSocket support