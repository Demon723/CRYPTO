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
import { TokenAccount, StakePosition, Proposal, TimeLock, AtomicSwap, RecoveryRequest } from './protocol';
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
export declare class NativeTokenState {
    private accounts;
    private stakes;
    private proposals;
    private timelocks;
    private swaps;
    private recoveries;
    private nonces;
    private readonly MAX_INCARNATIONS;
    private storageCallback?;
    private readCallback?;
    constructor(storageCallbacks?: {
        write?: (writes: StateWrite[]) => Promise<void>;
        read?: (keys: string[]) => Promise<Map<string, Buffer>>;
    });
    getAccount(address: Uint8Array, txIndex: number): [TokenAccount | null, number | null];
    writeAccount(address: Uint8Array, txIndex: number, incarnation: number, account: TokenAccount): void;
    getStake(address: Uint8Array, txIndex: number): [StakePosition | null, number | null];
    writeStake(address: Uint8Array, txIndex: number, incarnation: number, position: StakePosition): void;
    getProposal(id: Uint8Array, txIndex: number): [Proposal | null, number | null];
    writeProposal(id: Uint8Array, txIndex: number, incarnation: number, proposal: Proposal): void;
    getTimeLock(id: Uint8Array, txIndex: number): [TimeLock | null, number | null];
    writeTimeLock(id: Uint8Array, txIndex: number, incarnation: number, timelock: TimeLock): void;
    getSwap(id: Uint8Array, txIndex: number): [AtomicSwap | null, number | null];
    writeSwap(id: Uint8Array, txIndex: number, incarnation: number, swap: AtomicSwap): void;
    getRecovery(id: Uint8Array, txIndex: number): [RecoveryRequest | null, number | null];
    writeRecovery(id: Uint8Array, txIndex: number, incarnation: number, recovery: RecoveryRequest): void;
    dumpState(): Record<string, Buffer>;
    commitBatch(writes: StateWrite[]): Promise<void>;
    readBatch(keys: string[]): Promise<Map<string, Buffer>>;
    detectConflict(txA: ExecutionContext, txB: ExecutionContext): boolean;
    private upsert;
    private addressKey;
    private stakeKey;
    private proposalKey;
    private timelockKey;
    private swapKey;
    private recoveryKey;
}
