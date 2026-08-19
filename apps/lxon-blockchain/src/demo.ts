import { BlockSTMEngine, Transaction } from './block-stm';
import { MonadDBStorageEngine } from './storage';
import { RISCVzkVMProverStack } from './zkvm';

// Helper to generate non-overlapping transfers
function generateIndependentTransactions(count: number): Transaction[] {
  const txs: Transaction[] = [];
  for (let i = 0; i < count; i++) {
    const from = `user_${i * 2}`;
    const to = `user_${i * 2 + 1}`;
    txs.push({
      read_keys: [from, to],
      logic: (reads) => {
        const balFrom = reads[from] !== null ? reads[from] : 1000;
        const balTo = reads[to] !== null ? reads[to] : 100;
        return {
          [from]: balFrom - 10,
          [to]: balTo + 10,
        };
      },
    });
  }
  return txs;
}

// Helper to generate conflicting hotspot transactions (e.g. trading against the same DEX pool)
function generateConflictingTransactions(count: number): Transaction[] {
  const txs: Transaction[] = [];
  const poolKey = 'dex_pool_lxon';
  for (let i = 0; i < count; i++) {
    const user = `user_${i}`;
    txs.push({
      read_keys: [user, poolKey],
      logic: (reads) => {
        const balUser = reads[user] !== null ? reads[user] : 500;
        const balPool = reads[poolKey] !== null ? reads[poolKey] : 1000000;
        return {
          [user]: balUser - 50,
          [poolKey]: balPool + 50, // All writing to the same slot!
        };
      },
    });
  }
  return txs;
}

async function runBlockStmBenchmark() {
  console.log('================================================================');
  console.log('BENCHMARK 1: Block-STM Optimistic Parallel Execution Engine');
  console.log('================================================================');
  
  const txCount = 200;
  console.log(`Generating workloads with ${txCount} transactions...`);

  // Case A: Independent Transactions (High concurrency potential)
  const independentTxs = generateIndependentTransactions(txCount);
  // Case B: High State Contention (Hotspot pool key collision)
  const conflictingTxs = generateConflictingTransactions(txCount);

  // Benchmarking sequential baseline
  const runSequential = (txs: Transaction[]) => {
    const startTime = process.hrtime.bigint();
    const state: Record<string, any> = {};
    for (const tx of txs) {
      const reads: Record<string, any> = {};
      for (const k of tx.read_keys) {
        reads[k] = state[k] !== undefined ? state[k] : null;
      }
      const writes = tx.logic ? tx.logic(reads) : {};
      for (const [k, v] of Object.entries(writes)) {
        state[k] = v;
      }
    }
    const endTime = process.hrtime.bigint();
    return Number(endTime - startTime) / 1_000_000; // in milliseconds
  };

  const seqTimeIndep = runSequential(independentTxs);
  const seqTimeConflict = runSequential(conflictingTxs);

  console.log(`\n--- Workload A: Independent State Accounts ---`);
  console.log(`Sequential Execution: ${seqTimeIndep.toFixed(3)} ms`);

  for (const threads of [4, 8, 16]) {
    const engine = new BlockSTMEngine(independentTxs);
    
    // Seed initial values in MVDS for test
    for (let i = 0; i < txCount * 2; i++) {
      engine.mvds.write(`user_${i}`, -1, 0, 1000);
    }

    const start = process.hrtime.bigint();
    await engine.process_block(threads);
    const end = process.hrtime.bigint();
    const duration = Number(end - start) / 1_000_000;
    const speedup = seqTimeIndep / duration;
    
    console.log(
      `Block-STM [${threads} Thread(s)]: ${duration.toFixed(3)} ms ` +
      `| Speedup: ${speedup.toFixed(2)}x`
    );
  }

  console.log(`\n--- Workload B: High Contention (DEX Hotspot) ---`);
  console.log(`Sequential Execution: ${seqTimeConflict.toFixed(3)} ms`);

  for (const threads of [4, 8, 16]) {
    const engine = new BlockSTMEngine(conflictingTxs);
    
    // Seed pool initial state
    engine.mvds.write('dex_pool_lxon', -1, 0, 1000000);
    for (let i = 0; i < txCount; i++) {
      engine.mvds.write(`user_${i}`, -1, 0, 500);
    }

    const start = process.hrtime.bigint();
    await engine.process_block(threads);
    const end = process.hrtime.bigint();
    const duration = Number(end - start) / 1_000_000;
    const speedup = seqTimeConflict / duration;

    console.log(
      `Block-STM [${threads} Thread(s)]: ${duration.toFixed(3)} ms ` +
      `| Speedup: ${speedup.toFixed(2)}x (Amdahl's Law Bound)`
    );
  }
}

async function runStorageBenchmark() {
  console.log('\n================================================================');
  console.log('BENCHMARK 2: MonadDB Asynchronous Trie Storage Engine');
  console.log('================================================================');

  const engine = new MonadDBStorageEngine('/tmp/lxon-storage.img');
  const lookupRequests: [string, number][] = Array.from({ length: 40 }, (_, i) => [
    `trie_node_hash_0x${i.toString(16)}`,
    i * 4096 // Disk sector offsets
  ]);

  // Method 1: Blocking / Sequential Lookups (Lacks concurrency)
  const startSeq = process.hrtime.bigint();
  const seqResults: Buffer[] = [];
  for (const [hash, offset] of lookupRequests) {
    const res = await engine.get_trie_node(hash, offset);
    seqResults.push(res);
  }
  const endSeq = process.hrtime.bigint();
  const seqDuration = Number(endSeq - startSeq) / 1_000_000;

  // Clear cache for clean comparison
  engine.nodeCache.clear();

  // Method 2: Kernel Asynchronous I/O Pipeline Lookups (io_uring logic)
  const startAsync = process.hrtime.bigint();
  const asyncResults = await engine.execute_parallel_state_lookups(lookupRequests);
  const endAsync = process.hrtime.bigint();
  const asyncDuration = Number(endAsync - startAsync) / 1_000_000;

  console.log(`Lookup Count: ${lookupRequests.length} trie nodes`);
  console.log(`Sequential Disk Reads (Synchronous): ${seqDuration.toFixed(2)} ms`);
  console.log(`Parallel Decoupled Reads (Async io_uring): ${asyncDuration.toFixed(2)} ms`);
  console.log(`Disk Latency Reduction: ${((1 - (asyncDuration / seqDuration)) * 100).toFixed(1)}%`);
}

async function runZkVMProofBenchmark() {
  console.log('\n================================================================');
  console.log('BENCHMARK 3: zkVM Prover and Recursive SNARK Compression Pipeline');
  console.log('================================================================');

  const binaryELF = Buffer.alloc(1024);
  binaryELF.write("MOCK_RISCV_GUEST_PROGRAM_ELF_BINARY");
  
  const prover = new RISCVzkVMProverStack(binaryELF);
  const stateDeltaInput = Buffer.from("0x92a40ef4");

  console.log("1. Starting execution trace compiler...");
  const startTrace = process.hrtime.bigint();
  const [journal, segments] = await prover.execute_and_generate_trace(stateDeltaInput);
  const endTrace = process.hrtime.bigint();
  console.log(`✓ Execution Trace segments compiled: ${segments.length} segments in ${Number(endTrace - startTrace) / 1_000} μs`);

  console.log("2. Generating STARK proofs for execution segments concurrently...");
  const startStarks = process.hrtime.bigint();
  const starks = await prover.generate_segment_starks(segments);
  const endStarks = process.hrtime.bigint();
  console.log(`✓ Generated ${starks.length} segment STARKs in ${Number(endStarks - startStarks) / 1_000_000} ms`);

  console.log("3. Packaging recursive PLONK SNARK verifier receipt...");
  const startSnark = process.hrtime.bigint();
  const receipt = await prover.aggregate_recursive_snark(starks, journal);
  const endSnark = process.hrtime.bigint();
  
  console.log(`✓ SNARK Verification Seal compressed in ${Number(endSnark - startSnark) / 1_000} μs`);
  console.log(`✓ Public Journal committed: "${receipt.journal.toString()}"`);
  console.log(`✓ Compressed validity proof size: ${receipt.seal.length} bytes (Ethereum Gas savings target: < 200,000 gas)`);
  console.log(`✓ Full proof verification transaction hash: 0x${receipt.seal.subarray(0, 16).toString("hex")}...`);
}

async function main() {
  console.log('================================================================');
  console.log('LXON BLOCKCHAIN CORE ENGINE PERFORMANCE REPORT');
  console.log('================================================================');
  
  await runBlockStmBenchmark();
  await runStorageBenchmark();
  await runZkVMProofBenchmark();
  
  console.log('\n================================================================');
  console.log('BENCHMARKS COMPLETED SUCCESSFULY');
  console.log('================================================================');
}

main().catch(err => {
  console.error('Benchmark failed:', err);
});
