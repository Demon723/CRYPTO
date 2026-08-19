# LXON TypeScript SDK

A comprehensive TypeScript SDK for interacting with the LXON blockchain, supporting UTXO model, fee market, enhanced scripting, and quantum-resistant cryptography.

## Installation

```bash
npm install @lxon/sdk
```

## Quick Start

```typescript
import { LXONClient } from '@lxon/sdk';

// Initialize client
const client = new LXONClient({
  rpcUrl: 'https://lxon.network/rpc',
  chainId: 1
});

// Connect to network
await client.connect();

// Get balance
const balance = await client.getBalance('0x...');
console.log('Balance:', balance.totalBalance);

// Estimate fee
const fee = await client.estimateFee(6);
console.log('Estimated fee:', fee.estimatedFee);

// Disconnect
client.disconnect();
```

## Features

### 🔐 Quantum-Resistant Cryptography
- Hybrid signatures (classical + post-quantum)
- Lattice-based cryptography
- Hash-based signatures
- Post-quantum encryption

### 💰 Bitcoin-Style Fee Market
- Dynamic fee estimation
- RBF (Replace-By-Fee) support
- Fee bumping
- Mempool management

### 📜 Enhanced Scripting
- Miniscript integration
- Simplicity support
- Taproot implementation
- Script validation and execution

### 💎 UTXO Model
- Bitcoin-style UTXO management
- Hybrid state model (UTXO + Account)
- State checkpointing
- Parallel state transitions

## API Reference

### LXONClient

#### Constructor
```typescript
new LXONClient(config: LXONClientConfig)
```

**Parameters**:
- `config.rpcUrl` (string): RPC endpoint URL
- `config.chainId` (number, optional): Chain ID
- `config.signer` (Signer, optional): Ethers signer for signing transactions

#### Methods

##### connect()
Connect to the LXON network.

```typescript
await client.connect();
```

##### getBalance(address)
Get account balance (hybrid UTXO + Account model).

```typescript
const balance = await client.getBalance('0x...');
// Returns: { address, accountBalance, utxoBalance, totalBalance }
```

##### estimateFee(confirmations?)
Estimate transaction fee.

```typescript
const fee = await client.estimateFee(6);
// Returns: { gasPrice, maxFeePerGas, maxPriorityFeePer, estimatedFee, confirmations }
```

##### createTransaction(tx)
Create and sign transaction.

```typescript
const signedTx = await client.createTransaction({
  to: '0x...',
  value: '1000000000000000000'
});
```

##### sendTransaction(signedTx)
Send transaction to network.

```typescript
const response = await client.sendTransaction(signedTx);
// Returns: { hash, blockNumber, gasUsed, status }
```

##### UTXO Operations
```typescript
// Create UTXO
const utxo = client.createUTXO('0x...', 0, 1000n, '0x...');

// Spend UTXO
client.spendUTXO('0x...', 0);
```

##### Scripting Operations
```typescript
// Compile Miniscript
const script = client.compileMiniscript('or(0, pk(A))');

// Generate hybrid key pair
const keyPair = client.generateHybridKeyPair();

// Sign with hybrid signature
const signature = client.signHybrid(keyPair, 'message');

// Verify signature
const valid = client.verifyHybrid(keyPair, 'message', signature);
```

## Examples

### Basic Transaction

```typescript
import { LXONClient } from '@lxon/sdk';

const client = new LXONClient({
  rpcUrl: 'https://lxon.network/rpc'
});

await client.connect();

// Get balance
const balance = await client.getBalance('0x...');
console.log('Balance:', balance.totalBalance);

// Estimate fee
const fee = await client.estimateFee(6);
console.log('Fee:', fee.estimatedFee);

// Create transaction
const tx = await client.createTransaction({
  to: '0xrecipient...',
  value: '1000000000000000000' // 1 LXOM
});

// Send transaction
const response = await client.sendTransaction(tx);
console.log('Transaction hash:', response.hash);
```

### UTXO Management

```typescript
import { LXONClient } from '@lxon/sdk';

const client = new LXONClient({
  rpcUrl: 'https://lxon.network/rpc'
});

await client.connect();

// Create UTXO
const utxo = client.createUTXO(
  '0xtx123...',
  0,
  1000n,
  '0xowner...'
);

console.log('UTXO created:', utxo);

// Spend UTXO
client.spendUTXO('0xtx123...', 0);

// Get balance
const balance = await client.getBalance('0xowner...');
console.log('Balance:', balance.utxoBalance);
```

### Quantum-Resistant Signing

```typescript
import { LXONClient } from '@lxon/sdk';

const client = new LXONClient({
  rpcUrl: 'https://lxon.network/rpc'
});

await client.connect();

// Generate hybrid key pair
const keyPair = client.generateHybridKeyPair();
console.log('Key pair generated:', keyPair);

// Sign message
const message = 'Important transaction data';
const signature = client.signHybrid(keyPair, message);
console.log('Signature:', signature);

// Verify signature
const valid = client.verifyHybrid(keyPair, message, signature);
console.log('Signature valid:', valid);
```

### Enhanced Scripting

```typescript
import { LXONClient } from '@lxon/sdk';

const client = new LXONClient({
  rpcUrl: 'https://lxon.network/rpc'
});

await client.connect();

// Compile Miniscript
const miniscript = 'or(0, pk(A))';
const script = client.compileMiniscript(miniscript);
console.log('Compiled script:', script);

// Validate Miniscript
const valid = client.scripting.validateMiniscript(miniscript);
console.log('Valid:', valid);

// Create Taproot address
const taprootKey = '0x...';
const address = client.scripting.createTaprootAddress(taprootKey);
console.log('Taproot address:', address);
```

## Type Definitions

### LXONClientConfig
```typescript
interface LXONClientConfig {
  rpcUrl: string;
  chainId?: number;
  signer?: ethers.Signer;
}
```

### NetworkInfo
```typescript
interface NetworkInfo {
  chainId: number;
  name: string;
  blockNumber: number;
  blockHash?: string;
  blockTimestamp: number;
}
```

### BalanceInfo
```typescript
interface BalanceInfo {
  address: string;
  accountBalance: bigint;
  utxoBalance: bigint;
  totalBalance: bigint;
}
```

### FeeEstimate
```typescript
interface FeeEstimate {
  gasPrice: string;
  maxFeePerGas: string;
  maxPriorityFeePerGas: string;
  estimatedFee: string;
  confirmations: number;
}
```

## Error Handling

```typescript
try {
  await client.connect();
  const balance = await client.getBalance('0x...');
} catch (error) {
  if (error.message.includes('not connected')) {
    console.error('Client not connected');
  } else {
    console.error('Error:', error);
  }
}
```

## Best Practices

1. **Always check connection** before making requests
2. **Handle errors gracefully** with try-catch blocks
3. **Use estimated fees** to avoid running out of gas
4. **Verify transactions** after sending
5. **Disconnect** when done to free resources

## Support

- Documentation: https://docs.lxon.network
- GitHub: https://github.com/lxon-foundation/sdk
- Issues: https://github.com/lxon-foundation/sdk/issues

## License

MIT License - see LICENSE file for details