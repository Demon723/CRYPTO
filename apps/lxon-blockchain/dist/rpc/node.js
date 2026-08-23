#!/usr/bin/env tsx
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("./server");
const tx_pool_1 = require("../mempool/tx-pool");
const monad_bft_1 = require("../consensus/monad-bft");
const token_1 = require("../token");
const genesis_1 = require("../genesis");
async function main() {
    console.log('Starting LXON Blockchain Node...');
    // Initialize transaction pool with correct config
    const pool = new tx_pool_1.TransactionPool({
        maxPending: 10000,
        maxPerSender: 100,
        minFee: 1000n,
        expiryMs: 24 * 60 * 60 * 1000,
    });
    // Initialize consensus engine with required parameters
    const genesis = (0, genesis_1.getGenesisConfig)('mainnet');
    const validatorAddresses = genesis.validators.length > 0
        ? genesis.validators.map(v => v.address)
        : ['0x' + '0'.repeat(40)];
    const totalStake = genesis.validators.length > 0
        ? genesis.validators.reduce((sum, v) => sum + v.stake, 0n)
        : 1000000n;
    const engine = new monad_bft_1.MonadBFTEngine(validatorAddresses, totalStake, genesis.genesisTime);
    // Initialize token state
    const tokenState = new token_1.NativeTokenState();
    // Create and start RPC server
    const port = parseInt(process.env.PORT || '8545', 10);
    const chainId = parseInt(process.env.CHAIN_ID || '723', 10);
    const server = new server_1.JsonRpcServer(pool, engine, tokenState, port, chainId);
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
    }
    catch (error) {
        console.error('Failed to start LXON Node:', error);
        process.exit(1);
    }
}
main();
