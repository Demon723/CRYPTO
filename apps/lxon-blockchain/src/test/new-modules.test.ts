import * as assert from 'assert';
import {
  createGenesisBlock,
  validateGenesis,
  MAINNET_GENESIS,
  TESTNET_GENESIS,
} from '../genesis';
import { encodeP2PKH, encodeP2AS, decodeAddress } from '../address';
import { TransactionPool } from '../mempool/tx-pool';
import { JsonRpcServer } from '../rpc/server';
import { generateAstroWallet, signAstroTransaction, verifyAstroSignature } from '../wallet/astro-wallet';
import { sendTransaction, faucetRequest } from '../wallet/send';
import { generateReceiveAddress } from '../wallet/receive';
import { MonadBFTEngine } from '../consensus/monad-bft';

function testGenesis() {
  console.log('Testing Genesis Block...');

  const mainnetGenesis = createGenesisBlock(MAINNET_GENESIS);
  assert.strictEqual(mainnetGenesis.height, 0);
  assert.strictEqual(mainnetGenesis.previousBlockHash, '0'.repeat(64));
  assert.ok(validateGenesis(mainnetGenesis, MAINNET_GENESIS));

  const testnetGenesis = createGenesisBlock(TESTNET_GENESIS);
  assert.strictEqual(testnetGenesis.height, 0);
  assert.ok(validateGenesis(testnetGenesis, TESTNET_GENESIS));

  console.log('✓ Genesis block assertions passed!');
}

function testAddressEncoding() {
  console.log('Testing Address Encoding...');

  const wallet = generateAstroWallet();
  const pubKey = wallet.astroKeypair.classicalPublicKey;
  const arcPub = wallet.astroKeypair.arcPublicKey;

  const p2pkh = encodeP2PKH(pubKey);
  assert.ok(typeof p2pkh === 'string');
  assert.ok(p2pkh.length > 20);

  const decoded = decodeAddress(p2pkh);
  assert.ok(decoded !== null);
  assert.strictEqual(decoded?.type, 'p2pkh');

  const astroAddr = encodeP2AS(pubKey, arcPub);
  assert.ok(typeof astroAddr === 'string');
  assert.ok(astroAddr.startsWith('as'));

  console.log('✓ Address encoding assertions passed!');
}

function testTransactionPool() {
  console.log('Testing Transaction Pool...');

  const pool = new TransactionPool({
    maxPending: 100,
    maxPerSender: 10,
    minFee: 1000n,
    expiryMs: 60000,
  });

  const tx = { read_keys: ['balance'], write_dict: { to: '0xabc', amount: '100' } };
  const result1 = pool.addTransaction(tx as any, '0xalice', 5000n);
  assert.strictEqual(result1.accepted, true);

  const result2 = pool.addTransaction(tx as any, '0xalice', 5000n);
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

  const pool = new TransactionPool();
  const engine = new MonadBFTEngine(['validator-1', 'validator-2'], 1000000n);
  const server = new JsonRpcServer(pool, engine, 8545);

  const req = (method: string, params: any[] = []) => ({
    jsonrpc: '2.0',
    method,
    params,
    id: 1,
  });

  const blockNumber = server.handleRequest(req('eth_blockNumber'));
  assert.strictEqual(blockNumber.result, '0x0');

  const txHash = server.handleRequest(req('eth_sendRawTransaction', ['0xf00d']));
  assert.ok(typeof txHash.result === 'string');

  const version = server.handleRequest(req('net_version'));
  assert.strictEqual(version.result, '1');

  console.log('✓ JSON-RPC server assertions passed!');
}

async function testWallet() {
  console.log('Testing Wallet Operations...');

  const wallet = generateAstroWallet();
  assert.ok(wallet.mnemonic.length > 0);
  assert.ok(wallet.astroKeypair.address.length > 0);
  assert.ok(wallet.astroKeypair.astroAddress.length > 0);

  const receive = generateReceiveAddress(wallet, 'astro');
  assert.ok(receive.address.startsWith('as'));
  assert.strictEqual(receive.type, 'astro');

  const receiveClassical = generateReceiveAddress(wallet, 'classical');
  assert.ok(receiveClassical.address.length > 20);
  assert.strictEqual(receiveClassical.type, 'classical');

  const message = Buffer.from('test message');
  const sig = signAstroTransaction(wallet, message);
  assert.strictEqual(sig.classicalSig.length, 64);
  assert.strictEqual(sig.arcSigma.length, 666);

  const valid = verifyAstroSignature(
    wallet.astroKeypair.classicalPublicKey,
    wallet.astroKeypair.arcPublicKey,
    message,
    Buffer.from(sig.classicalSig).toString('hex'),
    sig.arcSigma,
    0x04
  );
  assert.strictEqual(valid, true);

  console.log('✓ Wallet assertions passed!');
}

async function testFaucet() {
  console.log('Testing Faucet Service...');

  const pool = new TransactionPool({ minFee: 0n });
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
  const engine = new MonadBFTEngine(['validator-1'], 1000000n, genesisTimeSec);
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
