export declare class VersionedValue {
    txIndex: number;
    incarnation: number;
    value: any;
    constructor(txIndex: number, incarnation: number, value: any);
}
export declare class MultiVersionDataStructure {
    private data;
    read(key: string, txIndex: number): [any, number | null];
    write(key: string, txIndex: number, incarnation: number, value: any): void;
    remove_writes(txIndex: number, keys: Set<string>): void;
    dumpState(): Record<string, any>;
}
export interface Transaction {
    read_keys: string[];
    write_dict?: Record<string, any>;
    logic?: (reads: Record<string, any>) => Record<string, any>;
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
export declare class BlockSTMEngine {
    txs: Transaction[];
    numTxs: number;
    mvds: MultiVersionDataStructure;
    incarnations: number[];
    readSets: Record<string, number | null>[];
    writeSets: Set<string>[];
    dag: Map<string, DAGVertex>;
    mevResistant: boolean;
    pendingDAG: DAGVertex[];
    executionOrder: string[];
    executionIdx: number;
    validationIdx: number;
    constructor(txs: Transaction[]);
    execute_transaction(txIndex: number, incarnation: number): boolean;
    validate_transaction(txIndex: number): boolean;
    add_to_dag(vertex: DAGVertex): void;
    topological_sort(): string[];
    detect_mev_conflict(txIndex: number): boolean;
    process_block(numThreads: number): Promise<void>;
    process_block_deferred(numThreads: number): Promise<{
        executionOrder: string[];
        finalState: Record<string, any>;
    }>;
}
