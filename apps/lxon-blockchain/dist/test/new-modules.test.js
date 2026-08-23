"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const assert = __importStar(require("assert"));
const genesis_1 = require("../genesis");
const address_1 = require("../address");
const tx_pool_1 = require("../mempool/tx-pool");
const server_1 = require("../rpc/server");
const token_1 = require("../token");
const astro_wallet_1 = require("../wallet/astro-wallet");
const receive_1 = require("../wallet/receive");
const monad_bft_1 = require("../consensus/monad-bft");
function testGenesis() {
    console.log('Testing Genesis Block...');
    const mainnetGenesis = (0, genesis_1.createGenesisBlock)(genesis_1.MAINNET_GENESIS);
    assert.strictEqual(mainnetGenesis.height, 0);
    assert.strictEqual(mainnetGenesis.previousBlockHash, '0'.repeat(64));
    assert.ok((0, genesis_1.validateGenesis)(mainnetGenesis, genesis_1.MAINNET_GENESIS));
    const testnetGenesis = (0, genesis_1.createGenesisBlock)(genesis_1.TESTNET_GENESIS);
    assert.strictEqual(testnetGenesis.height, 0);
    assert.ok((0, genesis_1.validateGenesis)(testnetGenesis, genesis_1.TESTNET_GENESIS));
    console.log('✓ Genesis block assertions passed!');
}
function testAddressEncoding() {
    console.log('Testing Address Encoding...');
    const wallet = (0, astro_wallet_1.generateAstroWallet)();
    const pubKey = wallet.astroKeypair.classicalPublicKey;
    const arcPub = wallet.astroKeypair.arcPublicKey;
    const p2pkh = (0, address_1.encodeP2PKH)(pubKey);
    assert.ok(typeof p2pkh === 'string');
    assert.ok(p2pkh.length > 20);
    const decoded = (0, address_1.decodeAddress)(p2pkh);
    assert.ok(decoded !== null);
    assert.strictEqual(decoded?.type, 'p2pkh');
    const astroAddr = (0, address_1.encodeP2AS)(pubKey, arcPub);
    assert.ok(typeof astroAddr === 'string');
    assert.ok(astroAddr.startsWith('as'));
    console.log('✓ Address encoding assertions passed!');
}
function testTransactionPool() {
    console.log('Testing Transaction Pool...');
    const pool = new tx_pool_1.TransactionPool({
        maxPending: 100,
        maxPerSender: 10,
        minFee: 1000n,
        expiryMs: 60000,
    });
    const tx = { read_keys: ['balance'], write_dict: { to: '0xabc', amount: '100' } };
    const result1 = pool.addTransaction(tx, '0xalice', 5000n);
    assert.strictEqual(result1.accepted, true);
    const result2 = pool.addTransaction(tx, '0xalice', 5000n);
    assert.strictEqual(result2.accepted, false);
    assert.ok(result2.reason === 'Duplicate transaction');
    const pending = pool.getPendingTransactions(10);
    assert.strictEqual(pending.length, 1);
    assert.strictEqual(pending[0].sender, '0xalice');
    const confirmed = pool.confirmTransaction(pending[0].hash);
    assert.strictEqual(confirmed, true);
    const stats = pool.getStats();
    assert.strictEqual(stats.confirmed, 1);
    assert.strictEqual(stats.pending, 0);
    console.log('✓ Transaction pool assertions passed!');
}
async function testRpcServer() {
    console.log('Testing JSON-RPC Server...');
    const pool = new tx_pool_1.TransactionPool();
    const engine = new monad_bft_1.MonadBFTEngine(['validator-1', 'validator-2'], 1000000n);
    const tokenState = new token_1.NativeTokenState();
    const server = new server_1.JsonRpcServer(pool, engine, tokenState, 8545, 723);
    const req = (method, params = []) => ({
        jsonrpc: '2.0',
        method,
        params,
        id: 1,
    });
    const blockNumber = server.handleRequest(req('eth_blockNumber'));
    assert.strictEqual(blockNumber.result, '0x0');
    const txHash = server.handleRequest(req('eth_sendRawTransaction', ['0xf00d']));
    assert.ok(typeof txHash.result === 'string');
    // Test invalid raw transaction (non-string)
    const invalidTx = server.handleRequest(req('eth_sendRawTransaction', [12345]));
    assert.ok(invalidTx.error !== undefined);
    // Test invalid raw transaction (empty string)
    const emptyTx = server.handleRequest(req('eth_sendRawTransaction', ['']));
    assert.ok(emptyTx.error !== undefined);
    // Test invalid raw transaction (no 0x prefix)
    const noPrefixTx = server.handleRequest(req('eth_sendRawTransaction', ['abcdef']));
    assert.ok(noPrefixTx.error !== undefined);
    const chainId = server.handleRequest(req('eth_chainId'));
    assert.strictEqual(chainId.result, '0x1546');
    const version = server.handleRequest(req('net_version'));
    assert.strictEqual(version.result, '723');
    console.log('✓ JSON-RPC server assertions passed!');
}
async function testRpcServerHttp() {
    console.log('Testing JSON-RPC Server HTTP Endpoints...');
    const pool = new tx_pool_1.TransactionPool();
    const engine = new monad_bft_1.MonadBFTEngine(['validator-1'], 1000000n);
    const tokenState = new token_1.NativeTokenState();
    const server = new server_1.JsonRpcServer(pool, engine, tokenState, 18545, 723);
    await server.start();
    try {
        // Test /health endpoint
        const healthRes = await fetch('http://localhost:18545/health');
        assert.strictEqual(healthRes.status, 200);
        const healthData = await healthRes.json();
        assert.strictEqual(healthData.status, 'ok');
        assert.strictEqual(healthData.chainId, '0x1546');
        // Test /metrics endpoint
        const metricsRes = await fetch('http://localhost:18545/metrics');
        assert.strictEqual(metricsRes.status, 200);
        const metricsText = await metricsRes.text();
        assert.ok(metricsText.includes('lxon_block_height'));
        assert.ok(metricsText.includes('lxon_chain_id') || metricsText.includes('lxon_validator_count'));
        // Test rate limiting (make many requests quickly)
        let rateLimited = false;
        for (let i = 0; i < 250; i++) {
            const res = await fetch('http://localhost:18545', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jsonrpc: '2.0', method: 'eth_chainId', params: [], id: 1 }),
            });
            if (res.status === 429) {
                rateLimited = true;
                break;
            }
        }
        assert.ok(rateLimited, 'Rate limiting should trigger after threshold');
        console.log('✓ HTTP endpoint assertions passed!');
    }
    finally {
        server.stop();
    }
}
async function testWallet() {
    console.log('Testing Wallet Operations...');
    const wallet = (0, astro_wallet_1.generateAstroWallet)();
    assert.ok(wallet.mnemonic.length > 0);
    assert.ok(wallet.astroKeypair.address.length > 0);
    assert.ok(wallet.astroKeypair.astroAddress.length > 0);
    const receive = (0, receive_1.generateReceiveAddress)(wallet, 'astro');
    assert.ok(receive.address.startsWith('as'));
    assert.strictEqual(receive.type, 'astro');
    const receiveClassical = (0, receive_1.generateReceiveAddress)(wallet, 'classical');
    assert.ok(receiveClassical.address.length > 20);
    assert.strictEqual(receiveClassical.type, 'classical');
    const message = Buffer.from('test message');
    const sig = (0, astro_wallet_1.signAstroTransaction)(wallet, message);
    assert.strictEqual(sig.classicalSig.length, 64);
    assert.strictEqual(sig.arcSigma.length, 666);
    const valid = (0, astro_wallet_1.verifyAstroSignature)(wallet.astroKeypair.classicalPublicKey, wallet.astroKeypair.arcPublicKey, message, Buffer.from(sig.classicalSig).toString('hex'), sig.arcSigma, 0x04);
    assert.strictEqual(valid, true);
    console.log('✓ Wallet assertions passed!');
}
async function testFaucet() {
    console.log('Testing Faucet Service...');
    const pool = new tx_pool_1.TransactionPool({ minFee: 0n });
    const { FaucetService } = await import('../wallet/faucet.js');
    const faucet = new FaucetService(pool, { amount: 1000000000000000000n, cooldownMs: 1000, maxPerDay: 2 });
    const result1 = faucet.request('0xrecipient1');
    assert.strictEqual(result1.success, true);
    assert.ok(result1.txHash !== undefined);
    const result2 = faucet.request('0xrecipient1');
    assert.strictEqual(result2.success, false);
    assert.ok(result2.reason === 'Cooldown period active');
    console.log('✓ Faucet assertions passed!');
}
async function testAstroConsensus() {
    console.log('Testing Astro Consensus Validation...');
    const nowSec = Math.floor(Date.now() / 1000);
    const genesisTimeSec = nowSec - (5 * 365 * 24 * 60 * 60);
    const engine = new monad_bft_1.MonadBFTEngine(['validator-1'], 1000000n, genesisTimeSec);
    const result = engine.validateAstroBlock(nowSec, 1000, []);
    assert.strictEqual(result.valid, true);
    assert.strictEqual(result.phase, 0);
    console.log('✓ Astro consensus assertions passed!');
}
async function main() {
    console.log('================================================================');
    console.log('LXON NEW MODULES TEST SUITE');
    console.log('================================================================');
    testGenesis();
    testAddressEncoding();
    testTransactionPool();
    await testRpcServer();
    await testRpcServerHttp();
    await testWallet();
    await testFaucet();
    await testAstroConsensus();
    console.log('\n================================================================');
    console.log('ALL NEW MODULE TESTS PASSED SUCCESSFULLY');
    console.log('================================================================');
}
main().catch(err => {
    console.error('Test runner failed:', err);
    process.exit(1);
});
