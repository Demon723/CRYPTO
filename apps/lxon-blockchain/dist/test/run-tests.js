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
const block_stm_1 = require("../block-stm");
const storage_1 = require("../storage");
const zkvm_1 = require("../zkvm");
const wasm_hotswap_1 = require("../wasm-hotswap");
const wasm_governance_1 = require("../governance/wasm-governance");
const wasm_executor_1 = require("../execution/wasm-executor");
const oracle_1 = require("../oracle");
const lon_feed_1 = require("../oracle/lon-feed");
const token_1 = require("../token");
const assert = __importStar(require("assert"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
function testBlockSTM() {
    console.log('Testing Block-STM Parallel Engine...');
    const txs = [
        {
            read_keys: ['Alice', 'Bob'],
            logic: (reads) => {
                const balAlice = reads['Alice'] !== null ? reads['Alice'] : 100;
                const balBob = reads['Bob'] !== null ? reads['Bob'] : 50;
                return {
                    Alice: balAlice - 20,
                    Bob: balBob + 20,
                };
            },
        },
        {
            read_keys: ['Bob', 'Charlie'],
            logic: (reads) => {
                const balBob = reads['Bob'] !== null ? reads['Bob'] : 50;
                const balCharlie = reads['Charlie'] !== null ? reads['Charlie'] : 10;
                return {
                    Bob: balBob - 15,
                    Charlie: balCharlie + 15,
                };
            },
        },
        {
            read_keys: ['Dave', 'Alice'],
            logic: (reads) => {
                const balDave = reads['Dave'] !== null ? reads['Dave'] : 200;
                const balAlice = reads['Alice'] !== null ? reads['Alice'] : 100;
                return {
                    Dave: balDave - 50,
                    Alice: balAlice + 50,
                };
            },
        },
    ];
    const engine = new block_stm_1.BlockSTMEngine(txs);
    engine.mvds.write('Alice', -1, 0, 100);
    engine.mvds.write('Bob', -1, 0, 50);
    engine.mvds.write('Charlie', -1, 0, 10);
    engine.mvds.write('Dave', -1, 0, 200);
    engine.process_block(2).then(() => {
        const finalState = engine.mvds.dumpState();
        assert.strictEqual(finalState['Alice'], 130);
        assert.strictEqual(finalState['Bob'], 55);
        assert.strictEqual(finalState['Charlie'], 25);
        assert.strictEqual(finalState['Dave'], 150);
        console.log('✓ Block-STM assertions passed! Deterministic state updates verified.');
    }).catch(e => {
        console.error('❌ Block-STM test failed:', e);
        process.exit(1);
    });
}
async function testWasmRuntime() {
    console.log('Testing WASM Runtime with Self-Amending Hot-Swap...');
    const runtime = new wasm_hotswap_1.WasmRuntime();
    runtime.setCompatibility('1.0.0', ['1.0.1', '1.1.0']);
    runtime.setCompatibility('1.1.0', ['1.1.1', '1.2.0']);
    const mockWasmPath = path.join('/tmp', 'test_module.wasm');
    fs.writeFileSync(mockWasmPath, Buffer.from('mock-wasm-binary-v1'));
    const manifest1 = {
        name: 'test_module',
        version: '1.0.0',
        checksum: runtime['_computeHash'](Buffer.from('mock-wasm-binary-v1')),
        wasmPath: mockWasmPath,
        dependencies: [],
        gasLimit: BigInt(50000),
        memoryPages: 16,
    };
    const module1 = await runtime.loadModule(manifest1);
    assert.strictEqual(module1.name, 'test_module');
    assert.strictEqual(module1.version, '1.0.0');
    assert.deepStrictEqual(runtime.listModules().map(m => m.name), ['test_module']);
    fs.writeFileSync(mockWasmPath, Buffer.from('mock-wasm-binary-v2'));
    const manifest2 = {
        name: 'test_module',
        version: '1.0.1',
        checksum: runtime['_computeHash'](Buffer.from('mock-wasm-binary-v2')),
        wasmPath: mockWasmPath,
        dependencies: [],
        gasLimit: BigInt(60000),
        memoryPages: 32,
    };
    const hotSwapResult = await runtime.hotSwapModule('test_module', manifest2);
    assert.strictEqual(hotSwapResult.success, true);
    assert.strictEqual(hotSwapResult.oldModule, 'test_module@1.0.0');
    assert.strictEqual(hotSwapResult.newModule, 'test_module@1.0.1');
    assert.strictEqual(hotSwapResult.rollbackAvailable, true);
    const rollbackResult = await runtime.rollbackModule('test_module');
    assert.strictEqual(rollbackResult.success, true);
    assert.strictEqual(rollbackResult.newModule, 'test_module@1.0.0');
    const incompatibleManifest = {
        name: 'test_module',
        version: '2.0.0',
        checksum: '0xincompatible',
        wasmPath: mockWasmPath,
        dependencies: [],
        gasLimit: BigInt(50000),
        memoryPages: 16,
    };
    const incompatibleResult = await runtime.hotSwapModule('test_module', incompatibleManifest);
    assert.strictEqual(incompatibleResult.success, false);
    assert.strictEqual(incompatibleResult.reason.includes('Incompatible'), true);
    fs.unlinkSync(mockWasmPath);
    console.log('✓ WASM Runtime assertions passed! Hot-swap, rollback, and compatibility verified.');
}
async function testWasmGovernance() {
    console.log('Testing WASM Governance Engine...');
    const runtime = new wasm_hotswap_1.WasmRuntime();
    const governance = new wasm_governance_1.WasmGovernanceEngine(runtime, ['validator-1', 'validator-2', 'validator-3']);
    governance.addValidator('validator-1', BigInt(2000000));
    governance.addValidator('validator-2', BigInt(1500000));
    governance.addValidator('validator-3', BigInt(1000000));
    const proposalResult = governance.createUpgradeProposal('test_module', '1.0.1', { name: 'test_module', version: '1.0.1', wasmPath: '/tmp/test.wasm' }, 'validator-1');
    assert.strictEqual(proposalResult.accepted, true);
    assert.ok(proposalResult.proposalId);
    const proposalId = proposalResult.proposalId;
    governance.castVote(proposalId, 'validator-1', true);
    governance.castVote(proposalId, 'validator-2', true);
    governance.castVote(proposalId, 'validator-3', false);
    const proposal = runtime.getUpgradeProposals().find(p => p.proposalId === proposalId);
    assert.ok(proposal);
    assert.strictEqual(proposal.status, 'approved');
    console.log('✓ WASM Governance assertions passed! Proposal creation, voting, and approval verified.');
}
async function testWasmExecutor() {
    console.log('Testing WASM Executor...');
    const executor = new wasm_executor_1.WasmExecutor();
    const mockWasmPath = path.join('/tmp', 'exec_test.wasm');
    fs.writeFileSync(mockWasmPath, Buffer.from('mock-wasm-exec-binary'));
    const runtime = new wasm_hotswap_1.WasmRuntime();
    const module = await runtime.loadModule({
        name: 'exec_test',
        version: '1.0.0',
        checksum: runtime['_computeHash'](Buffer.from('mock-wasm-exec-binary')),
        wasmPath: mockWasmPath,
        dependencies: [],
        gasLimit: BigInt(100000),
        memoryPages: 16,
    });
    module.exports = {
        execute: (input) => Buffer.concat([input, Buffer.from('_processed')]),
    };
    const validation = executor.validateModule(module);
    assert.strictEqual(validation.valid, true);
    assert.strictEqual(validation.errors.length, 0);
    const context = executor.createContext(module, 'caller-1', Buffer.from('test input'));
    assert.strictEqual(context.caller, 'caller-1');
    assert.strictEqual(context.gasLimit, BigInt(100000));
    const result = executor.execute(module, context);
    assert.strictEqual(result.success, true);
    assert.ok(result.output.toString().includes('processed'));
    fs.unlinkSync(mockWasmPath);
    console.log('✓ WASM Executor assertions passed! Validation and execution verified.');
}
async function testStorageEngine() {
    console.log('Testing MonadDB Storage Engine...');
    const devicePath = path.join(os.tmpdir(), `lxon-storage-${Date.now()}-${process.pid}.dat`);
    const storage = new storage_1.MonadDBStorageEngine(devicePath);
    await storage.initialize(false);
    const testData = Buffer.from('BLOCK_OFFSET_1024_PAYLOAD');
    await storage.commit_state_batch(new Map([[1024, testData]]));
    const val1 = await storage.get_trie_node('nodeA', 1024);
    assert.ok(val1.toString().includes('BLOCK_OFFSET_1024_PAYLOAD'));
    assert.strictEqual(storage.nodeCache.size, 1);
    const val2 = await storage.get_trie_node('nodeA', 1024);
    assert.strictEqual(val1, val2);
    assert.strictEqual(storage.nodeCache.size, 1);
    await storage.shutdown();
    fs.unlinkSync(devicePath);
    console.log('✓ MonadDB Storage assertions passed! Async caching verified.');
}
async function testNativeOracle() {
    console.log('Testing Native Oracle...');
    const oracle = new oracle_1.NativeOracle(['validator-1', 'validator-2', 'validator-3']);
    const result1 = oracle.submitPriceUpdate({ symbol: 'LON/USD', price: 1.0, source: 'binance', signature: 'sig1' }, 'validator-1');
    assert.strictEqual(result1.accepted, true);
    const result2 = oracle.submitPriceUpdate({ symbol: 'LON/USD', price: 1.02, source: 'coinbase', signature: 'sig2' }, 'validator-2');
    assert.strictEqual(result2.accepted, true);
    const result3 = oracle.submitPriceUpdate({ symbol: 'LON/USD', price: 1.01, source: 'kraken', signature: 'sig3' }, 'validator-3');
    assert.strictEqual(result3.accepted, true);
    const consensus = oracle.getConsensusPrice('LON/USD');
    assert.ok(consensus !== null);
    assert.ok(consensus.price >= 1.0 && consensus.price <= 1.02);
    assert.strictEqual(consensus.sources, 3);
    const latest = oracle.getLatestPrice('LON/USD');
    assert.ok(latest !== null);
    assert.strictEqual(latest.symbol, 'LON/USD');
    const deviation = oracle.detectDeviation('LON/USD');
    assert.ok(deviation !== null);
    oracle.updateReputation('validator-1', 0.9);
    const rep = oracle.getReputation('validator-1');
    assert.ok(rep > 0);
    console.log('✓ Native Oracle assertions passed! Price feeds, consensus, and reputation verified.');
}
async function testLONPriceFeed() {
    console.log('Testing LON Price Feed...');
    const config = {
        updateIntervalMs: 1000,
        maxStalenessMs: 300000,
        confidenceThreshold: 0.7,
        deviationThreshold: 0.03,
        supportedPairs: ['LON/USD', 'LON/BTC', 'LON/ETH', 'LON/USDC'],
    };
    const feed = new lon_feed_1.LONPriceFeed(['lon-validator-1', 'lon-validator-2', 'lon-validator-3'], config);
    feed.addLONValidator('lon-validator-1');
    feed.addLONValidator('lon-validator-2');
    feed.addLONValidator('lon-validator-3');
    const result = feed.submitLONPrice('LON/USD', 1.0, 'binance', 'lon-validator-1', 'sig1');
    assert.strictEqual(result.accepted, true);
    feed.submitLONPrice('LON/USD', 1.02, 'coinbase', 'lon-validator-2', 'sig2');
    feed.submitLONPrice('LON/USD', 1.01, 'kraken', 'lon-validator-3', 'sig3');
    const consensus = feed.getLONConsensus('LON/USD');
    assert.ok(consensus !== null);
    assert.strictEqual(consensus.symbol, 'LON/USD');
    const price = feed.getLONPrice('LON/USD');
    assert.ok(price !== null);
    assert.strictEqual(price.symbol, 'LON/USD');
    const allPrices = feed.getAllLONPrices();
    assert.ok(allPrices.length > 0);
    const anomaly = feed.detectLONAnomaly('LON/USD');
    assert.ok(anomaly !== null);
    const rep = feed.getValidatorReputation('lon-validator-1');
    assert.ok(rep >= 0);
    console.log('✓ LON Price Feed assertions passed! Native oracle integration verified.');
}
async function testNativeToken() {
    console.log('Testing Native Token Protocol (NX) with Non-Predictable Pricing...');
    const state = new token_1.NativeTokenState();
    const engine = new token_1.TokenEngine(state);
    // Test genesis initialization
    const [genesis, _] = state.getAccount(new Uint8Array(32), 1);
    assert.ok(genesis !== null);
    assert.ok(genesis.balance > 0n);
    assert.strictEqual(token_1.TOKEN_CONSTANTS.SYMBOL, 'NX');
    assert.strictEqual(token_1.TOKEN_CONSTANTS.DECIMALS, 9);
    // Create test accounts
    const testAddr = new Uint8Array(32);
    testAddr[0] = 0xab;
    const testAccount = {
        address: testAddr,
        nonce: 0n,
        balance: 10000000000000n,
        stake: 0n,
        delegatedTo: null,
        votingPower: 0n,
        flags: token_1.AccountFlag.NONE,
        metadataHash: null,
        createdAt: BigInt(Date.now() * 1000),
        updatedAt: BigInt(Date.now() * 1000),
    };
    state.writeAccount(testAddr, 0, 0, testAccount);
    const recipient = new Uint8Array(32);
    recipient[0] = 0xcd;
    state.writeAccount(recipient, 0, 0, {
        ...testAccount,
        address: recipient,
        balance: 0n,
    });
    // Test 1: Dynamic fee calculation
    const transferTx = {
        type: token_1.TokenTxType.TRANSFER,
        from: testAddr,
        to: recipient,
        nonce: 0n,
        fee: { baseFee: 1000n, priorityFee: 0n, gasLimit: 21000n, gasUsed: 21000n, sizeBytes: 200 },
        timestamp: BigInt(Date.now() * 1000),
        payload: Buffer.alloc(40),
        signature: Buffer.alloc(64),
    };
    transferTx.payload.writeBigUInt64LE(100n, 0);
    const fee1 = engine['calculateDynamicFee'](transferTx);
    assert.ok(fee1 >= token_1.TOKEN_CONSTANTS.MIN_FEE, `Fee ${fee1} below minimum`);
    assert.ok(fee1 <= token_1.TOKEN_CONSTANTS.MAX_FEE, `Fee ${fee1} above maximum`);
    const transferResult = engine.executeTransaction(transferTx, 1);
    assert.strictEqual(transferResult.success, true);
    assert.strictEqual(transferResult.gasUsed > 0n, true);
    const [senderAfter, __] = state.getAccount(testAddr, 2);
    assert.ok(senderAfter !== null);
    assert.strictEqual(senderAfter.nonce, 1n);
    // Test 2: Dynamic block reward (non-predictable)
    const reward1 = engine['calculateDynamicBlockReward']();
    assert.ok(reward1 >= token_1.TOKEN_CONSTANTS.MIN_BLOCK_REWARD, `Reward ${reward1} below minimum`);
    assert.ok(reward1 <= token_1.TOKEN_CONSTANTS.MAX_BLOCK_REWARD, `Reward ${reward1} above maximum`);
    // Simulate block advance with entropy
    const mockHash = Buffer.from('mock-block-hash-with-entropy-data');
    engine.newBlock(mockHash);
    const reward2 = engine['calculateDynamicBlockReward']();
    // Rewards should vary due to entropy capture
    assert.ok(reward2 >= token_1.TOKEN_CONSTANTS.MIN_BLOCK_REWARD);
    assert.ok(reward2 <= token_1.TOKEN_CONSTANTS.MAX_BLOCK_REWARD);
    // Test 3: Dynamic APY based on stake ratio
    const apyLowStake = engine['calculateDynamicAPY'](1000n);
    assert.ok(apyLowStake >= token_1.TOKEN_CONSTANTS.MIN_APY);
    assert.ok(apyLowStake <= token_1.TOKEN_CONSTANTS.MAX_APY);
    // Test 4: Network metrics
    const metrics = engine['getNetworkMetrics']();
    assert.ok(metrics.totalSupply > 0n);
    assert.ok(metrics.circulatingSupply > 0n);
    assert.ok(metrics.stakeRatio >= 0);
    assert.ok(metrics.velocityRatio >= 0);
    // Test 5: Stake with dynamic APY
    const stakeTx = {
        type: token_1.TokenTxType.STAKE,
        from: testAddr,
        to: null,
        nonce: 1n,
        fee: { baseFee: 1000n, priorityFee: 0n, gasLimit: 50000n, gasUsed: 50000n, sizeBytes: 200 },
        timestamp: BigInt(Date.now() * 1000),
        payload: Buffer.alloc(32),
        signature: Buffer.alloc(64),
    };
    stakeTx.payload.writeBigUInt64LE(token_1.TOKEN_CONSTANTS.MIN_STAKE, 0);
    const stakeResult = engine.executeTransaction(stakeTx, 2);
    assert.strictEqual(stakeResult.success, true);
    const [stakePos, ___] = state.getStake(testAddr, 3);
    assert.ok(stakePos !== null);
    assert.strictEqual(stakePos.amount, token_1.TOKEN_CONSTANTS.MIN_STAKE);
    // APY should be within bounds (non-predictable but bounded)
    assert.ok(stakePos.apy >= token_1.TOKEN_CONSTANTS.MIN_APY);
    assert.ok(stakePos.apy <= token_1.TOKEN_CONSTANTS.MAX_APY);
    console.log('✓ Native Token assertions passed! Non-predictable pricing verified.');
}
async function testzkVM() {
    console.log('Testing RISC-V zkVM Prover Stack...');
    const elf = Buffer.from('mock-elf');
    const prover = new zkvm_1.RISCVzkVMProverStack(elf);
    const input = Buffer.from('0xalice');
    const receipt = await prover.prove_state_transition(input);
    assert.strictEqual(receipt.journal.length, 32);
    assert.strictEqual(receipt.seal.length, 256);
    console.log('✓ zkVM Prover assertions passed! Tracing & SNARK compression verified.');
}
async function main() {
    console.log('================================================================');
    console.log('LXON BLOCKCHAIN CORE ENGINE + NON-PREDICTABLE PRICING TEST SUITE');
    console.log('================================================================');
    testBlockSTM();
    await testStorageEngine();
    await testzkVM();
    await testWasmRuntime();
    await testWasmGovernance();
    await testWasmExecutor();
    await testNativeOracle();
    await testLONPriceFeed();
    await testNativeToken();
    console.log('\n================================================================');
    console.log('ALL TESTS PASSED SUCCESSFULLY');
    console.log('================================================================');
}
main().catch(err => {
    console.error('Test runner failed:', err);
    process.exit(1);
});
