#!/usr/bin/env tsx
import { JsonRpcServer } from './server';
import { TransactionPool } from '../mempool/tx-pool';
import { MonadBFTEngine } from '../consensus/monad-bft';

async function main() {
  console.log('Starting LXON Blockchain Node...');
  
  // Initialize transaction pool with correct config
  const pool = new TransactionPool({
    maxPending: 10000,
    maxPerSender: 100,
    minFee: 1000n,
    expiryMs: 24 * 60 * 60 * 1000,
  });
  
  // Initialize consensus engine with required parameters
  const validatorAddresses = ['0x' + '0'.repeat(40)];
  const totalStake = 1000000n;
  const genesisTime = Date.now();
  const engine = new MonadBFTEngine(validatorAddresses, totalStake, genesisTime);
  
  // Create and start RPC server
  const port = parseInt(process.env.PORT || '8545', 10);
  const server = new JsonRpcServer(pool, engine, port);
  
  try {
    await server.start();
    console.log(`LXON Node started successfully on port ${port}`);
    console.log('JSON-RPC endpoint available at:', `http://localhost:${port}`);
    console.log('Press Ctrl+C to stop the node');
    
    // Keep process alive
    process.on('SIGINT', () => {
      console.log('\nShutting down LXON Node...');
      server.stop();
      process.exit(0);
    });
    
    process.on('SIGTERM', () => {
      console.log('\nShutting down LXON Node...');
      server.stop();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('Failed to start LXON Node:', error);
    process.exit(1);
  }
}

main();
