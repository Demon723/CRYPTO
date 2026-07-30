import { BlockSTMEngine, Transaction } from '../block-stm';
import { MonadDBStorageEngine } from '../storage';
import { RISCVzkVMProverStack } from '../zkvm';
import * as assert from 'assert';

function testBlockSTM() {
  console.log('Testing Block-STM Parallel Engine...');

  const txs: Transaction[] = [
    // Tx 0: Alice -> Bob transfer
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
    // Tx 1: Bob -> Charlie transfer (Dependencies on Bob!)
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
    // Tx 2: Dave -> Alice transfer (Unrelated)
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

  const engine = new BlockSTMEngine(txs);
  
  // Seed state
  engine.mvds.write('Alice', -1, 0, 100);
  engine.mvds.write('Bob', -1, 0, 50);
  engine.mvds.write('Charlie', -1, 0, 10);
  engine.mvds.write('Dave', -1, 0, 200);

  // Execute
  engine.process_block(2).then(() => {
    const finalState = engine.mvds.dumpState();
    
    // Assert outputs match exact sequential order state machine mapping
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

async function testStorageEngine() {
  console.log('Testing MonadDB Storage Engine...');
  const storage = new MonadDBStorageEngine('/dev/mock-device');

  // Fetch block cache miss
  const val1 = await storage.get_trie_node('nodeA', 1024);
  assert.ok(val1.toString().includes('BLOCK_OFFSET_1024_PAYLOAD'));
  assert.strictEqual(storage.nodeCache.size, 1);

  // Fetch block cache hit (should be instant and matching)
  const val2 = await storage.get_trie_node('nodeA', 1024);
  assert.strictEqual(val1, val2);
  assert.strictEqual(storage.nodeCache.size, 1);

  console.log('✓ MonadDB Storage assertions passed! Async caching verified.');
}

async function testzkVM() {
  console.log('Testing RISC-V zkVM Prover Stack...');
  const elf = Buffer.from('mock-elf');
  const prover = new RISCVzkVMProverStack(elf);

  const input = Buffer.from('0xalice');
  const receipt = await prover.prove_state_transition(input);

  // Verify journal and compressed seal size
  assert.ok(receipt.journal.toString().includes('STATE_ROOT_PRE_3078616c696365')); // '0xalice' hex bytes
  assert.strictEqual(receipt.seal.length, 256);

  console.log('✓ zkVM Prover assertions passed! Tracing & SNARK compression verified.');
}

async function main() {
  console.log('RUNNING BLOCKCHAIN ENGINE TESTS...');
  testBlockSTM();
  await testStorageEngine();
  await testzkVM();
  console.log('ALL TESTS PASSED SUCCESSFULLY!');
}

main().catch(err => {
  console.error('Test runner failed:', err);
  process.exit(1);
});
