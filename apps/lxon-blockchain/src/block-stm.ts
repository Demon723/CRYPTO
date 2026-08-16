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
  logic?: (reads: Record<string, any>) => Record<string, any>;
  astroProof?: {
    version: number;
    phase: number;
    classicalSig: string;
    classicalPub: string;
    arcSigma: string;
    arcPubKey: string;
    algorithmId: number;
    ephemeralPubKey: string;
    nonce: bigint;
  };
}

export interface DAGVertex {
  hash: string;
  transaction: Transaction;
  parents: string[];
  round: number;
  author: string;
  timestamp: number;
}

export interface MEVBlock {
  transactions: Transaction[];
  vertexHash: string;
  round: number;
  parentVertex: string | null;
}

export class BlockSTMEngine {
  public numTxs: number;
  public mvds = new MultiVersionDataStructure();
  public incarnations: number[];
  public readSets: Record<string, number | null>[];
  public writeSets: Set<string>[];
  public dag: Map<string, DAGVertex> = new Map();
  public mevResistant: boolean = false;
  public pendingDAG: DAGVertex[] = [];
  public executionOrder: string[] = [];

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

    for (const readKey of tx.read_keys) {
      const [val, writer] = this.mvds.read(readKey, txIndex);
      localReadSet[readKey] = writer;
      dynamicReadValues[readKey] = val;
    }

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

    for (const [wKey, wVal] of Object.entries(localWriteSet)) {
      this.mvds.write(wKey, txIndex, incarnation, wVal);
    }

    const removedKeys = new Set<string>();
    for (const key of prevWriteKeys) {
      if (!newWriteKeys.has(key)) {
        removedKeys.add(key);
      }
    }

    if (removedKeys.size > 0) {
      this.mvds.remove_writes(txIndex, removedKeys);
      return true;
    }

    return false;
  }

  public validate_transaction(txIndex: number): boolean {
    const recordedReads = this.readSets[txIndex];
    for (const [key, expectedWriter] of Object.entries(recordedReads)) {
      const [, currentWriter] = this.mvds.read(key, txIndex);
      if (currentWriter !== expectedWriter) {
        return false;
      }
    }
    return true;
  }

  public add_to_dag(vertex: DAGVertex): void {
    this.dag.set(vertex.hash, vertex);
    this.pendingDAG.push(vertex);
  }

  public topological_sort(): string[] {
    const sorted: string[] = [];
    const visited = new Set<string>();
    const temp = new Set<string>();

    const visit = (hash: string): boolean => {
      if (temp.has(hash)) return false;
      if (visited.has(hash)) return true;

      temp.add(hash);
      const vertex = this.dag.get(hash);
      if (vertex) {
        for (const parent of vertex.parents) {
          if (!visit(parent)) return false;
        }
      }
      temp.delete(hash);
      visited.add(hash);
      sorted.push(hash);
      return true;
    };

    for (const hash of this.dag.keys()) {
      if (!visited.has(hash)) {
        visit(hash);
      }
    }

    return sorted;
  }

  public detect_mev_conflict(txIndex: number): boolean {
    if (!this.mevResistant) return false;

    const tx = this.txs[txIndex];
    const writeKeys = Object.keys(tx.write_dict || {});

    for (const key of writeKeys) {
      for (const [otherHash, otherVertex] of this.dag.entries()) {
        if (otherVertex.transaction.read_keys.includes(key) ||
            Object.keys(otherVertex.transaction.write_dict || {}).includes(key)) {
          const otherTxIndex = parseInt(otherHash.slice(0, 8), 16) % this.numTxs;
          if (otherTxIndex !== txIndex && otherTxIndex < txIndex) {
            return true;
          }
        }
      }
    }

    return false;
  }

  public async process_block(numThreads: number): Promise<void> {
    const workerPromises: Promise<void>[] = [];

    const workerLoop = async () => {
      loop: while (true) {
        let txToExec: number | null = null;
        let txToVal: number | null = null;

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

          if (this.mevResistant) {
            this.detect_mev_conflict(txToExec);
          }

          synchronizedBlock: {
            this.validationIdx = Math.min(this.validationIdx, txToExec);
          }
        } else if (txToVal !== null) {
          const isValid = this.validate_transaction(txToVal);
          if (!isValid) {
            synchronizedBlock: {
              this.incarnations[txToVal] += 1;
              this.mvds.remove_writes(txToVal, this.writeSets[txToVal]);
              this.writeSets[txToVal].clear();

              this.executionIdx = Math.min(this.executionIdx, txToVal);
              this.validationIdx = Math.min(this.validationIdx, txToVal + 1);
            }
          }
        }

        await new Promise(resolve => setImmediate(resolve));
      }
    };

    for (let i = 0; i < numThreads; i++) {
      workerPromises.push(workerLoop());
    }

    await Promise.all(workerPromises);
  }

  public async process_block_deferred(numThreads: number): Promise<{ executionOrder: string[]; finalState: Record<string, any> }> {
    const executionOrder: string[] = [];

    const orderingPhase = async () => {
      const sorted = this.topological_sort();
      for (const hash of sorted) {
        const vertex = this.dag.get(hash);
        if (vertex) {
          executionOrder.push(hash);
        }
      }
    };

    await orderingPhase();

    const workerPromises: Promise<void>[] = [];
    const workerLoop = async () => {
      loop: while (true) {
        let txToExec: number | null = null;
        let txToVal: number | null = null;

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

          if (this.mevResistant) {
            this.detect_mev_conflict(txToExec);
          }

          synchronizedBlock: {
            this.validationIdx = Math.min(this.validationIdx, txToExec);
          }
        } else if (txToVal !== null) {
          const isValid = this.validate_transaction(txToVal);
          if (!isValid) {
            synchronizedBlock: {
              this.incarnations[txToVal] += 1;
              this.mvds.remove_writes(txToVal, this.writeSets[txToVal]);
              this.writeSets[txToVal].clear();

              this.executionIdx = Math.min(this.executionIdx, txToVal);
              this.validationIdx = Math.min(this.validationIdx, txToVal + 1);
            }
          }
        }

        await new Promise(resolve => setImmediate(resolve));
      }
    };

    for (let i = 0; i < numThreads; i++) {
      workerPromises.push(workerLoop());
    }

    await Promise.all(workerPromises);

    return {
      executionOrder,
      finalState: this.mvds.dumpState(),
    };
  }
}
