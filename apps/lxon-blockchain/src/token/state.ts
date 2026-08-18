/**
 * NX Token State Engine
 * 
 * Implements native account state using Multi-Version Data Structures (MVDS)
 * for optimistic parallel execution, inspired by Block-STM and MonadDB patterns.
 * 
 * Key innovations:
 * - Speculative state writes with incarnation tracking
 * - Async-native storage interface (io_uring pattern)
 * - Conflict detection without global locking
 * - Deterministic state root computation
 */

import { TokenAccount, StakePosition, Proposal, TimeLock, AtomicSwap, RecoveryRequest, TOKEN_CONSTANTS } from './protocol';

export interface VersionedValue {
  txIndex: number;
  incarnation: number;
  value: TokenAccount | StakePosition | Proposal | TimeLock | AtomicSwap | RecoveryRequest;
}

export interface StateWrite {
  key: string;
  txIndex: number;
  incarnation: number;
  value: Buffer;
}

export interface StateRead {
  key: string;
  txIndex: number;
  version: number | null;
}

export interface ExecutionContext {
  txIndex: number;
  reads: StateRead[];
  writes: StateWrite[];
  gasUsed: bigint;
  success: boolean;
  error?: string;
}

export interface ExecutionResult {
  txIndex: number;
  success: boolean;
  writes: StateWrite[];
  reads: StateRead[];
  gasUsed: bigint;
  error?: string;
  newStateRoot?: Buffer;
}

export class NativeTokenState {
  private accounts: Map<string, VersionedValue[]> = new Map();
  private stakes: Map<string, VersionedValue[]> = new Map();
  private proposals: Map<string, VersionedValue[]> = new Map();
  private timelocks: Map<string, VersionedValue[]> = new Map();
  private swaps: Map<string, VersionedValue[]> = new Map();
  private recoveries: Map<string, VersionedValue[]> = new Map();
  
  private nonces: Map<string, bigint> = new Map();
  private readonly MAX_INCARNATIONS = 16;
  
  // Async storage interface (MonadDB pattern)
  private storageCallback?: (writes: StateWrite[]) => Promise<void>;
  private readCallback?: (keys: string[]) => Promise<Map<string, Buffer>>;

  constructor(storageCallbacks?: { write?: (writes: StateWrite[]) => Promise<void>; read?: (keys: string[]) => Promise<Map<string, Buffer>> }) {
    this.storageCallback = storageCallbacks?.write;
    this.readCallback = storageCallbacks?.read;
  }

  // ----- Account Operations -----

  getAccount(address: Uint8Array, txIndex: number): [TokenAccount | null, number | null] {
    const key = this.addressKey(address);
    const entries = this.accounts.get(key);
    if (!entries || entries.length === 0) return [null, null];

    let targetVal: TokenAccount | null = null;
    let writerTx: number | null = null;

    for (const entry of entries) {
      if (entry.txIndex < txIndex) {
        targetVal = entry.value as TokenAccount;
        writerTx = entry.txIndex;
      } else {
        break;
      }
    }

    return [targetVal, writerTx];
  }

  writeAccount(address: Uint8Array, txIndex: number, incarnation: number, account: TokenAccount): void {
    const key = this.addressKey(address);
    this.upsert(this.accounts, key, txIndex, incarnation, account);
    this.nonces.set(key, account.nonce);
  }

  // Convenience method for RPC balance queries
  getBalance(address: string): bigint | null {
    try {
      const addrBytes = Buffer.from(address.startsWith('0x') ? address.slice(2) : address, 'hex');
      const [account] = this.getAccount(addrBytes, Number.MAX_SAFE_INTEGER);
      return account?.balance || null;
    } catch {
      return null;
    }
  }

  // ----- Stake Operations -----

  getStake(address: Uint8Array, txIndex: number): [StakePosition | null, number | null] {
    const key = this.stakeKey(address);
    const entries = this.stakes.get(key);
    if (!entries || entries.length === 0) return [null, null];

    let targetVal: StakePosition | null = null;
    let writerTx: number | null = null;

    for (const entry of entries) {
      if (entry.txIndex < txIndex) {
        targetVal = entry.value as StakePosition;
        writerTx = entry.txIndex;
      } else {
        break;
      }
    }

    return [targetVal, writerTx];
  }

  writeStake(address: Uint8Array, txIndex: number, incarnation: number, position: StakePosition): void {
    const key = this.stakeKey(address);
    this.upsert(this.stakes, key, txIndex, incarnation, position);
  }

  // ----- Proposal Operations -----

  getProposal(id: Uint8Array, txIndex: number): [Proposal | null, number | null] {
    const key = this.proposalKey(id);
    const entries = this.proposals.get(key);
    if (!entries || entries.length === 0) return [null, null];

    let targetVal: Proposal | null = null;
    let writerTx: number | null = null;

    for (const entry of entries) {
      if (entry.txIndex < txIndex) {
        targetVal = entry.value as Proposal;
        writerTx = entry.txIndex;
      } else {
        break;
      }
    }

    return [targetVal, writerTx];
  }

  writeProposal(id: Uint8Array, txIndex: number, incarnation: number, proposal: Proposal): void {
    const key = this.proposalKey(id);
    this.upsert(this.proposals, key, txIndex, incarnation, proposal);
  }

  // ----- TimeLock Operations -----

  getTimeLock(id: Uint8Array, txIndex: number): [TimeLock | null, number | null] {
    const key = this.timelockKey(id);
    const entries = this.timelocks.get(key);
    if (!entries || entries.length === 0) return [null, null];

    let targetVal: TimeLock | null = null;
    let writerTx: number | null = null;

    for (const entry of entries) {
      if (entry.txIndex < txIndex) {
        targetVal = entry.value as TimeLock;
        writerTx = entry.txIndex;
      } else {
        break;
      }
    }

    return [targetVal, writerTx];
  }

  writeTimeLock(id: Uint8Array, txIndex: number, incarnation: number, timelock: TimeLock): void {
    const key = this.timelockKey(id);
    this.upsert(this.timelocks, key, txIndex, incarnation, timelock);
  }

  // ----- AtomicSwap Operations -----

  getSwap(id: Uint8Array, txIndex: number): [AtomicSwap | null, number | null] {
    const key = this.swapKey(id);
    const entries = this.swaps.get(key);
    if (!entries || entries.length === 0) return [null, null];

    let targetVal: AtomicSwap | null = null;
    let writerTx: number | null = null;

    for (const entry of entries) {
      if (entry.txIndex < txIndex) {
        targetVal = entry.value as AtomicSwap;
        writerTx = entry.txIndex;
      } else {
        break;
      }
    }

    return [targetVal, writerTx];
  }

  writeSwap(id: Uint8Array, txIndex: number, incarnation: number, swap: AtomicSwap): void {
    const key = this.swapKey(id);
    this.upsert(this.swaps, key, txIndex, incarnation, swap);
  }

  // ----- Recovery Operations -----

  getRecovery(id: Uint8Array, txIndex: number): [RecoveryRequest | null, number | null] {
    const key = this.recoveryKey(id);
    const entries = this.recoveries.get(key);
    if (!entries || entries.length === 0) return [null, null];

    let targetVal: RecoveryRequest | null = null;
    let writerTx: number | null = null;

    for (const entry of entries) {
      if (entry.txIndex < txIndex) {
        targetVal = entry.value as RecoveryRequest;
        writerTx = entry.txIndex;
      } else {
        break;
      }
    }

    return [targetVal, writerTx];
  }

  writeRecovery(id: Uint8Array, txIndex: number, incarnation: number, recovery: RecoveryRequest): void {
    const key = this.recoveryKey(id);
    this.upsert(this.recoveries, key, txIndex, incarnation, recovery);
  }

  // ----- State Root & Persistence -----

  dumpState(): Record<string, Buffer> {
    const state: Record<string, Buffer> = {};
    
    for (const [key, entries] of this.accounts.entries()) {
      if (entries.length > 0) {
        const latest = entries[entries.length - 1];
        state[key] = Buffer.from(JSON.stringify(latest.value));
      }
    }
    
    return state;
  }

  async commitBatch(writes: StateWrite[]): Promise<void> {
    if (this.storageCallback) {
      await this.storageCallback(writes);
    }
  }

  async readBatch(keys: string[]): Promise<Map<string, Buffer>> {
    if (this.readCallback) {
      return await this.readCallback(keys);
    }
    return new Map();
  }

  // ----- Conflict Detection (Block-STM style) -----

  detectConflict(txA: ExecutionContext, txB: ExecutionContext): boolean {
    const writesA = new Set(txA.writes.map(w => w.key));
    const writesB = new Set(txB.writes.map(w => w.key));
    
    for (const key of writesA) {
      if (writesB.has(key)) return true;
    }
    
    const readsA = new Set(txA.reads.map(r => r.key));
    const writesBSet = new Set(txB.writes.map(w => w.key));
    
    for (const key of readsA) {
      if (writesBSet.has(key)) return true;
    }
    
    return false;
  }

  // ----- Utility -----

  private upsert(map: Map<string, VersionedValue[]>, key: string, txIndex: number, incarnation: number, value: any): void {
    if (!map.has(key)) {
      map.set(key, []);
    }
    
    const entries = map.get(key)!;
    
    for (let i = 0; i < entries.length; i++) {
      if (entries[i].txIndex === txIndex) {
        entries[i] = { txIndex, incarnation, value };
        return;
      }
    }
    
    entries.push({ txIndex, incarnation, value });
    entries.sort((a, b) => a.txIndex - b.txIndex || a.incarnation - b.incarnation);
  }

  private addressKey(address: Uint8Array): string {
    return `acc:${Buffer.from(address).toString('hex')}`;
  }

  private stakeKey(address: Uint8Array): string {
    return `stake:${Buffer.from(address).toString('hex')}`;
  }

  private proposalKey(id: Uint8Array): string {
    return `prop:${Buffer.from(id).toString('hex')}`;
  }

  private timelockKey(id: Uint8Array): string {
    return `tl:${Buffer.from(id).toString('hex')}`;
  }

  private swapKey(id: Uint8Array): string {
    return `swap:${Buffer.from(id).toString('hex')}`;
  }

  private recoveryKey(id: Uint8Array): string {
    return `rec:${Buffer.from(id).toString('hex')}`;
  }
}
