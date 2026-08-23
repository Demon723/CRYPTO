/**
 * State Pruning for Lightweight Nodes
 *
 * Enables nodes to run with limited storage by pruning historical state
 * while maintaining ability to access historical data from archive nodes.
 *
 * Reduces storage from 500GB to 100GB for Raspberry Pi compatibility.
 */
export interface StatePruneConfig {
    retainBlocks: number;
    pruneInterval: number;
    archiveUrl: string;
    maxStateSizeMB: number;
}
export interface PrunedState {
    blockNumber: number;
    stateHash: string;
    stateData: string;
    pruned: boolean;
}
export declare class StatePruner {
    private config;
    private fullStates;
    private prunedStates;
    private currentStateSize;
    private archiveClient;
    constructor(config: StatePruneConfig);
    /**
     * Add state for block
     */
    addState(blockNumber: number, stateHash: string, stateData: string): void;
    /**
     * Get state for block
     */
    getState(blockNumber: number): Promise<string | null>;
    /**
     * Prune oldest blocks
     */
    pruneOldestBlocks(): void;
    /**
     * Check if block needs pruning
     */
    needsPruning(): boolean;
    /**
     * Get storage statistics
     */
    getStorageStats(): {
        fullStatesCount: number;
        prunedStatesCount: number;
        currentSizeMB: number;
        maxSizeMB: number;
        utilizationPercent: number;
    };
    /**
     * Prune to specific block number
     */
    pruneToBlock(blockNumber: number): void;
    /**
     * Restore state from archive
     */
    restoreState(blockNumber: number): Promise<boolean>;
}
/**
 * Archive Client
 *
 * Client for fetching historical state from archive nodes
 */
export declare class ArchiveClient {
    private archiveUrl;
    private cache;
    private cacheSize;
    constructor(archiveUrl: string);
    /**
     * Fetch state from archive
     */
    fetchState(blockNumber: number, stateHash: string): Promise<string | null>;
    /**
     * Fetch block header from archive
     */
    fetchBlockHeader(blockNumber: number): Promise<any | null>;
    /**
     * Prune cache
     */
    private pruneCache;
    /**
     * Get cache statistics
     */
    getCacheStats(): {
        entries: number;
        sizeMB: number;
        hitRate: number;
    };
}
/**
 * Raspberry Pi Storage Optimization
 *
 * Additional optimizations specifically for Raspberry Pi storage constraints
 */
export declare class RaspberryPiStorageOptimizer {
    private compressionEnabled;
    private deduplicationEnabled;
    constructor(compression?: boolean, deduplication?: boolean);
    /**
     * Compress state data
     */
    compressState(stateData: string): string;
    /**
     * Decompress state data
     */
    decompressState(compressedData: string): string;
    /**
     * Deduplicate state data
     */
    deduplicateState(stateData: string): {
        deduplicated: string;
        hash: string;
        isNew: boolean;
    };
    /**
     * Hash state for deduplication
     */
    private hashState;
    /**
     * Estimate storage savings
     */
    estimateSavings(stateData: string): {
        compressionSavings: number;
        deduplicationSavings: number;
        totalSavings: number;
    };
}
/**
 * Storage Configuration for Raspberry Pi
 */
export declare const RASPBERRY_PI_STORAGE_CONFIG: StatePruneConfig;
