/**
 * LXON Blockchain Node Server Daemon
 * ─────────────────────────────────────────────────────────────────────────────
 * AWS Production-Ready Blockchain Node Daemon that wires all core subsystems:
 *  - MonadDBStorageEngine (State Storage)
 *  - NativeTokenState & TokenEngine (NX Native Token Protocol)
 *  - MonadBFTEngine & NarwhalMempool (Parallel Consensus & Mempool)
 *  - BlockSTMEngine (Parallel Transaction Execution)
 *  - LONPriceFeed & NativeOracle (On-chain Dynamic Oracles)
 *  - WasmRuntime & WasmGovernanceEngine (Self-Amending Hot-Swap Runtime)
 *  - RISCVzkVMProverStack (zk-SNARK State Proof Generation)
 * ─────────────────────────────────────────────────────────────────────────────
 * Serves JSON-RPC 2.0 and HTTP REST API for AWS Load Balancers (/health, /metrics).
 */
import { MonadDBStorageEngine } from './storage';
import { NativeTokenState, TokenEngine } from './token';
import { MonadBFTEngine } from './consensus/monad-bft';
import { NarwhalMempool } from './consensus/narwhal-mempool';
import { LONPriceFeed } from './oracle/lon-feed';
import { WasmRuntime } from './wasm-hotswap';
import { RISCVzkVMProverStack } from './zkvm';
export interface NodeConfig {
    nodeId: string;
    port: number;
    dataDir: string;
    chainId: number;
    blockTimeMs: number;
    validators: string[];
}
export declare class LXONNode {
    readonly config: NodeConfig;
    storage: MonadDBStorageEngine;
    tokenState: NativeTokenState;
    tokenEngine: TokenEngine;
    consensus: MonadBFTEngine;
    mempool: NarwhalMempool;
    priceFeed: LONPriceFeed;
    wasmRuntime: WasmRuntime;
    zkProver: RISCVzkVMProverStack;
    currentBlockHeight: bigint;
    private server;
    private isRunning;
    private blockProductionInterval;
    constructor(config?: Partial<NodeConfig>);
    start(): Promise<void>;
    private startBlockProduction;
    private startHttpServer;
    private handleJsonRpc;
    stop(): Promise<void>;
}
