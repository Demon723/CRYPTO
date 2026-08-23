export interface TransactionProfile {
    id: string;
    gasComplexity: number;
    stateKeys: string[];
    sizeBytes: number;
    priorityFee: bigint;
}
export interface BlockAssemblyMetrics {
    totalGas: number;
    stateOverlapScore: number;
    parallelizability: number;
    estimatedThroughput: number;
}
export declare class AnthemiusBlockBuilder {
    private maxBlockGas;
    private maxBlockSize;
    private stateKeyFrequency;
    constructor(maxBlockGas?: number, maxBlockSize?: number);
    assembleBlock(transactions: TransactionProfile[]): {
        block: TransactionProfile[];
        metrics: BlockAssemblyMetrics;
    };
    private computeMultiDimensionalScore;
    private computeParallelizability;
    getHotStateKeys(limit?: number): {
        key: string;
        count: number;
    }[];
    reset(): void;
}
export declare function balanceBlock(transactions: TransactionProfile[], targetGas: number, targetParallelism: number): TransactionProfile[];
