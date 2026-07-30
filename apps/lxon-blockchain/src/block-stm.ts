export class VersionedValue {
  constructor(
    public txIndex: number,
    public incarnation: number,
    public value: any
  ) {}
}

export class MultiVersionDataStructure {
  private data = new Map<string, VersionedValue[]>();

  public read(key: string, txIndex: number): [any, number | null] {
    const entries = this.data.get(key);
    if (!entries || entries.length === 0) {
      return [null, null];
    }

    let targetVal: any = null;
    let writerTx: number | null = null;

    for (const entry of entries) {
      if (entry.txIndex < txIndex) {
        targetVal = entry.value;
        writerTx = entry.txIndex;
      } else {
        break;
      }
    }

    return [targetVal, writerTx];
  }

  public write(key: string, txIndex: number, incarnation: number, value: any): void {
    if (!this.data.has(key)) {
      this.data.set(key, []);
    }
    const entries = this.data.get(key)!;

    for (let i = 0; i < entries.length; i++) {
      if (entries[i].txIndex === txIndex) {
        entries[i] = new VersionedValue(txIndex, incarnation, value);
        return;
      }
    }

    entries.push(new VersionedValue(txIndex, incarnation, value));
    entries.sort((a, b) => a.txIndex - b.txIndex);
  }

  public remove_writes(txIndex: number, keys: Set<string>): void {
    for (const key of keys) {
      const entries = this.data.get(key);
      if (entries) {
        this.data.set(key, entries.filter(e => e.txIndex !== txIndex));
      }
    }
  }

  // Helper to dump active state for testing/debugging
  public dumpState(): Record<string, any> {
    const state: Record<string, any> = {};
    for (const [key, entries] of this.data.entries()) {
      if (entries.length > 0) {
        state[key] = entries[entries.length - 1].value;
      }
    }
    return state;
  }
}

export interface Transaction {
  read_keys: string[];
  write_dict?: Record<string, any>;
  // Logic to execute the transaction dynamically based on values read from state
  logic?: (reads: Record<string, any>) => Record<string, any>;
}

export class BlockSTMEngine {
  public numTxs: number;
  public mvds = new MultiVersionDataStructure();
  public incarnations: number[];
  public readSets: Record<string, number | null>[];
  public writeSets: Set<string>[];
  
  public executionIdx = 0;
  public validationIdx = 0;

  constructor(public txs: Transaction[]) {
    this.numTxs = txs.length;
    this.incarnations = new Array(this.numTxs).fill(0);
    this.readSets = Array.from({ length: this.numTxs }, () => ({}));
    this.writeSets = Array.from({ length: this.numTxs }, () => new Set<string>());
    this.validationIdx = this.numTxs;
  }

  public execute_transaction(txIndex: number, incarnation: number): boolean {
    const localReadSet: Record<string, number | null> = {};
    const dynamicReadValues: Record<string, any> = {};
    const tx = this.txs[txIndex];

    // 1. Perform reads against the multi-version state
    for (const readKey of tx.read_keys) {
      const [val, writer] = this.mvds.read(readKey, txIndex);
      localReadSet[readKey] = writer;
      dynamicReadValues[readKey] = val;
    }

    // 2. Compute writes (either static write_dict or dynamic logic evaluation)
    let localWriteSet: Record<string, any> = {};
    if (tx.logic) {
      localWriteSet = tx.logic(dynamicReadValues);
    } else if (tx.write_dict) {
      localWriteSet = tx.write_dict;
    }

    const prevWriteKeys = this.writeSets[txIndex];
    const newWriteKeys = new Set(Object.keys(localWriteSet));

    this.readSets[txIndex] = localReadSet;
    this.writeSets[txIndex] = newWriteKeys;

    // 3. Write outputs to MVDS speculatively
    for (const [wKey, wVal] of Object.entries(localWriteSet)) {
      this.mvds.write(wKey, txIndex, incarnation, wVal);
    }

    // 4. Clean up any keys that were written in previous incarnation but not in this one
    const removedKeys = new Set<string>();
    for (const key of prevWriteKeys) {
      if (!newWriteKeys.has(key)) {
        removedKeys.add(key);
      }
    }

    if (removedKeys.size > 0) {
      this.mvds.remove_writes(txIndex, removedKeys);
      return true; // Write set changed
    }

    return false;
  }

  public validate_transaction(txIndex: number): boolean {
    const recordedReads = this.readSets[txIndex];
    for (const [key, expectedWriter] of Object.entries(recordedReads)) {
      const [, currentWriter] = this.mvds.read(key, txIndex);
      if (currentWriter !== expectedWriter) {
        return false; // Validation failed: Read-After-Write conflict
      }
    }
    return true; // Validated successfully
  }

  // Collaborative parallel scheduler simulation
  // Mimics processing block across multiple threads
  public async process_block(numThreads: number): Promise<void> {
    const workerPromises: Promise<void>[] = [];

    const workerLoop = async () => {
      loop: while (true) {
        let txToExec: number | null = null;
        let txToVal: number | null = null;

        // Synchronized task picking
        synchronizedBlock: {
          if (this.executionIdx < this.numTxs) {
            txToExec = this.executionIdx;
            this.executionIdx += 1;
          } else if (this.validationIdx < this.numTxs) {
            txToVal = this.validationIdx;
            this.validationIdx += 1;
          } else {
            break loop;
          }
        }

        if (txToExec !== null) {
          const inc = this.incarnations[txToExec];
          this.execute_transaction(txToExec, inc);

          // Trigger validation check on current index
          synchronizedBlock: {
            this.validationIdx = Math.min(this.validationIdx, txToExec);
          }
        } else if (txToVal !== null) {
          const isValid = this.validate_transaction(txToVal);
          if (!isValid) {
            // Conflict found! Increment incarnation, delete speculative writes, and schedule re-execution
            synchronizedBlock: {
              this.incarnations[txToVal] += 1;
              this.mvds.remove_writes(txToVal, this.writeSets[txToVal]);
              this.writeSets[txToVal].clear();
              
              // Roll back execution and validation indices
              this.executionIdx = Math.min(this.executionIdx, txToVal);
              this.validationIdx = Math.min(this.validationIdx, txToVal + 1);
            }
          }
        }

        // yield macro-task to simulate parallel latency overlap
        await new Promise(resolve => setImmediate(resolve));
      }
    };

    // Spawn virtual threads
    for (let i = 0; i < numThreads; i++) {
      workerPromises.push(workerLoop());
    }

    await Promise.all(workerPromises);
  }
}
