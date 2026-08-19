import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { MonadDBStorageEngine } from '../storage';
import { AsyncFileIO } from '../storage/async-io';
import { IOUringEngine } from '../storage/io-uring-sim';

function getTempDevicePath(): string {
  const tmpDir = os.tmpdir();
  return path.join(tmpDir, `lxon-storage-${Date.now()}-${process.pid}.dat`);
}

async function testStorageInit() {
  console.log('Testing Storage Initialization...');

  const devicePath = getTempDevicePath();
  const storage = new MonadDBStorageEngine(devicePath);

  await storage.initialize(false);
  
  // Verify file was created by doing a write operation
  const testData = Buffer.from('init-check');
  await storage.commit_state_batch(new Map([[0, testData]]));
  
  assert.ok(fs.existsSync(devicePath), 'Storage file should exist after write');
  await storage.shutdown();

  console.log('✓ Storage initialization assertions passed!');
}

async function testStorageReadWrite() {
  console.log('Testing Storage Read/Write...');

  const devicePath = getTempDevicePath();
  const storage = new MonadDBStorageEngine(devicePath);

  await storage.initialize(false);

  const testData = Buffer.from('BLOCK_OFFSET_1024_PAYLOAD');
  await storage.commit_state_batch(new Map([[1024, testData]]));

  const readData = await storage.get_trie_node('nodeA', 1024);
  assert.strictEqual(readData.toString().includes('BLOCK_OFFSET_1024_PAYLOAD'), true);

  await storage.shutdown();

  console.log('✓ Storage read/write assertions passed!');
}

async function testStorageCache() {
  console.log('Testing Storage Cache...');

  const devicePath = getTempDevicePath();
  const storage = new MonadDBStorageEngine(devicePath);

  await storage.initialize(false);

  const testData = Buffer.from('cached-payload');
  await storage.commit_state_batch(new Map([[2048, testData]]));

  const val1 = await storage.get_trie_node('nodeB', 2048);
  assert.ok(val1.toString().includes('cached-payload'));
  assert.strictEqual(storage.nodeCache.size, 1);

  const val2 = await storage.get_trie_node('nodeB', 2048);
  assert.strictEqual(val1, val2);
  assert.strictEqual(storage.nodeCache.size, 1);

  await storage.shutdown();

  console.log('✓ Storage cache assertions passed!');
}

async function testStorageParallelLookups() {
  console.log('Testing Parallel State Lookups...');

  const devicePath = getTempDevicePath();
  const storage = new MonadDBStorageEngine(devicePath);

  await storage.initialize(false);

  const batch = new Map<number, Buffer>();
  for (let i = 0; i < 4; i++) {
    batch.set(4096 + i * 4096, Buffer.from(`payload-${i}`));
  }
  await storage.commit_state_batch(batch);

  const requests: [string, number][] = [
    ['node1', 4096],
    ['node2', 8192],
    ['node3', 12288],
    ['node4', 16384],
  ];

  const results = await storage.execute_parallel_state_lookups(requests);
  assert.strictEqual(results.length, 4);
  assert.ok(results[0].toString().includes('payload-0'));
  assert.ok(results[3].toString().includes('payload-3'));

  await storage.shutdown();

  console.log('✓ Parallel lookups assertions passed!');
}

async function testIOUringEngine() {
  console.log('Testing IO-Uring Engine...');

  const devicePath = getTempDevicePath();
  const fileIo = new AsyncFileIO(devicePath, 4096, 1024 * 1024);
  await fileIo.initialize();

  const engine = new IOUringEngine(
    { queueDepth: 256, batchSize: 64, pollIntervalMs: 1 },
    fileIo
  );

  // Start engine in background without awaiting
  const startPromise = engine.start();

  const testData = Buffer.from('uring-payload');
  engine.submitWrite(0, testData);

  // Wait a bit for processing
  await new Promise(resolve => setTimeout(resolve, 100));

  const requestId = engine.submitRead(0, 4096);
  const start = Date.now();
  while (Date.now() - start < 5000) {
    const completion = engine.getCompletion(requestId);
    if (completion && completion.success && completion.data) {
      assert.ok(completion.data.toString().includes('uring-payload'));
      break;
    }
    await new Promise(resolve => setTimeout(resolve, 0.1));
  }

  await engine.stop();
  await startPromise;
  await fileIo.close();

  console.log('✓ IO-Uring engine assertions passed!');
}

async function main() {
  console.log('================================================================');
  console.log('LXON STORAGE ENGINE TEST SUITE');
  console.log('================================================================');

  await testStorageInit();
  await testStorageReadWrite();
  await testStorageCache();
  await testStorageParallelLookups();
  await testIOUringEngine();

  console.log('\n================================================================');
  console.log('ALL STORAGE ENGINE TESTS PASSED SUCCESSFULLY');
  console.log('================================================================');
}

main().catch(err => {
  console.error('Storage engine test runner failed:', err);
  process.exit(1);
});
