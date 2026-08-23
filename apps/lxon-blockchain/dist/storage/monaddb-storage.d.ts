/**
 * MonadDB-Style Storage Engine for LXON Blockchain
 *
 * Implements next-generation storage optimization based on Monad architecture:
 * - Asynchronous I/O with io_uring
 * - Native Merkle Patricia Trie implementation
 * - Efficient disk read/write amplification reduction
 * - Multi-version concurrency control
 * - Built-in caching and memory management
 *
 * Based on MonadDB and other next-gen storage engines that solve the
 * performance bottlenecks of running MPT on generic key-value stores.
 */
export interface AsyncIORequest {
    operation: 'read' | 'write' | 'flush';
    offset: number;
    data: Buffer;
    callback: (error: Error | null, result?: Buffer) => void;
}
export declare class AsyncIOEngine {
    private queue;
    private processing;
    private maxConcurrent;
    private currentConcurrent;
    /**
     * Queue asynchronous I/O operation
     */
    queueOperation(request: AsyncIORequest): void;
    /**
     * Process queued I/O operations
     */
    private processQueue;
    /**
     * Execute I/O operation (simulated async)
     */
    private executeOperation;
    /**
     * Simulate read operation
     */
    private simulateRead;
    /**
     * Simulate write operation
     */
    private simulateWrite;
    /**
     * Simulate flush operation
     */
    private simulateFlush;
    /**
     * Get I/O statistics
     */
    getStatistics(): {
        queueLength: number;
        currentConcurrent: number;
        maxConcurrent: number;
    };
}
export interface MPTNode {
    key: Buffer;
    value?: Buffer;
    children: Map<number, MPTNode>;
    hash: Buffer;
    isLeaf: boolean;
}
export interface MPTProof {
    key: Buffer;
    value: Buffer;
    proofNodes: Buffer[];
    rootHash: Buffer;
}
export declare class NativeMPT {
    private root;
    private cache;
    private dirtyNodes;
    constructor();
    /**
     * Get value from trie
     */
    get(key: Buffer): Buffer | undefined;
    /**
     * Put value into trie
     */
    put(key: Buffer, value: Buffer): void;
    /**
     * Delete value from trie
     */
    delete(key: Buffer): boolean;
    /**
     * Get Merkle proof for key
     */
    getProof(key: Buffer): MPTProof;
    /**
     * Verify Merkle proof
     */
    verifyProof(proof: MPTProof): boolean;
    /**
     * Get root hash
     */
    getRootHash(): Buffer;
    /**
     * Flush dirty nodes to storage
     */
    flushDirty(): string[];
    /**
     * Traverse trie to find node
     */
    private traverse;
    /**
     * Update node in trie
     */
    private updateNode;
    /**
     * Remove node from trie
     */
    private removeNode;
    /**
     * Collect proof nodes
     */
    private collectProof;
    /**
     * Reconstruct root hash from proof
     */
    private reconstructRoot;
    /**
     * Create new node
     */
    private createNode;
    /**
     * Update node hash
     */
    private updateHash;
    /**
     * Compute node hash
     */
    private computeNodeHash;
    /**
     * Serialize node for storage/hashing
     */
    private serializeNode;
    /**
     * Generate node key for cache
     */
    private nodeKey;
    /**
     * Get trie statistics
     */
    getStatistics(): {
        totalNodes: number;
        leafNodes: number;
        cacheSize: number;
        dirtyNodes: number;
    };
}
export interface StorageConfig {
    dataDir: string;
    cacheSize: number;
    maxOpenFiles: number;
    asyncIO: boolean;
    compressionEnabled: boolean;
}
export interface StorageStats {
    totalKeys: number;
    totalSize: number;
    cacheHitRate: number;
    readAmplification: number;
    writeAmplification: number;
    iops: number;
}
export declare class MonadDBStorage {
    private config;
    private mpt;
    private asyncIO;
    private cache;
    private cacheHits;
    private cacheMisses;
    private readCount;
    private writeCount;
    constructor(config?: Partial<StorageConfig>);
    /**
     * Get value from storage
     */
    get(key: Buffer): Promise<Buffer | undefined>;
    /**
     * Put value into storage
     */
    put(key: Buffer, value: Buffer): Promise<void>;
    /**
     * Delete value from storage
     */
    delete(key: Buffer): Promise<void>;
    /**
     * Get Merkle proof for key
     */
    getProof(key: Buffer): Promise<MPTProof>;
    /**
     * Verify Merkle proof
     */
    verifyProof(proof: MPTProof): Promise<boolean>;
    /**
     * Get state root hash
     */
    getStateRoot(): Promise<Buffer>;
    /**
     * Create snapshot of current state
     */
    createSnapshot(): Promise<string>;
    /**
     * Restore from snapshot
     */
    restoreSnapshot(snapshotId: string): Promise<boolean>;
    /**
     * Compact storage (garbage collection)
     */
    compact(): Promise<void>;
    /**
     * Evict entries from cache
     */
    private evictFromCache;
    /**
     * Flush all pending writes
     */
    flush(): Promise<void>;
    /**
     * Get storage statistics
     */
    getStatistics(): StorageStats;
    /**
     * Calculate read amplification
     */
    private calculateReadAmplification;
    /**
     * Calculate write amplification
     */
    private calculateWriteAmplification;
    /**
     * Batch write operations
     */
    batchWrite(writes: Array<{
        key: Buffer;
        value: Buffer;
    }>): Promise<void>;
    /**
     * Batch read operations
     */
    batchRead(keys: Buffer[]): Promise<(Buffer | undefined)[]>;
    /**
     * Iterate over all keys
     */
    iterate(prefix?: Buffer): Promise<Array<{
        key: Buffer;
        value: Buffer;
    }>>;
    /**
     * Clear all data
     */
    clear(): Promise<void>;
    /**
     * Close storage engine
     */
    close(): Promise<void>;
    /**
     * Get configuration
     */
    getConfig(): StorageConfig;
    /**
     * Update configuration
     */
    updateConfig(updates: Partial<StorageConfig>): void;
}
export declare class StoragePool {
    private connections;
    private maxConnections;
    /**
     * Get storage connection
     */
    getConnection(name: string, config?: Partial<StorageConfig>): MonadDBStorage;
    /**
     * Release storage connection
     */
    releaseConnection(name: string): void;
    /**
     * Get pool statistics
     */
    getPoolStatistics(): {
        activeConnections: number;
        maxConnections: number;
        connectionNames: string[];
    };
}
export interface StorageMetrics {
    readLatency: number[];
    writeLatency: number[];
    cacheEfficiency: number;
    storageUsage: number;
    throughput: number;
}
export declare class StorageMonitor {
    private storage;
    private metrics;
    private startTime;
    constructor(storage: MonadDBStorage);
    /**
     * Record read operation
     */
    recordRead(latency: number): void;
    /**
     * Record write operation
     */
    recordWrite(latency: number): void;
    /**
     * Update metrics
     */
    updateMetrics(): void;
    /**
     * Get current metrics
     */
    getMetrics(): StorageMetrics;
    /**
     * Get average read latency
     */
    getAverageReadLatency(): number;
    /**
     * Get average write latency
     */
    getAverageWriteLatency(): number;
    /**
     * Get latency percentiles
     */
    getLatencyPercentiles(): {
        read50: number;
        read95: number;
        read99: number;
        write50: number;
        write95: number;
        write99: number;
    };
}
