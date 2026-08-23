/**
 * Snapshot Sync System
 *
 * Fast bootstrap from trusted snapshots instead of syncing from genesis.
 * Reduces sync time from 7 days to <24 hours for Raspberry Pi.
 */
export interface SnapshotMetadata {
    version: string;
    blockNumber: number;
    blockHash: string;
    stateRoot: string;
    timestamp: number;
    size: number;
    checksum: string;
}
export interface SnapshotChunk {
    chunkIndex: number;
    totalChunks: number;
    data: string;
    checksum: string;
}
export declare class SnapshotSync {
    private snapshotUrl;
    private snapshotMetadata;
    private downloadedChunks;
    private verifyChecksum;
    constructor(snapshotUrl: string, verifyChecksum?: boolean);
    /**
     * Fetch snapshot metadata
     */
    fetchMetadata(): Promise<SnapshotMetadata>;
    /**
     * Download snapshot chunks
     */
    downloadChunks(onProgress?: (progress: number) => void): Promise<void>;
    /**
     * Download single chunk
     */
    private downloadChunk;
    /**
     * Verify snapshot integrity
     */
    verifySnapshot(): Promise<boolean>;
    /**
     * Assemble downloaded chunks
     */
    assembleChunks(): string;
    /**
     * Apply snapshot to local state
     */
    applySnapshot(): Promise<void>;
    /**
     * Calculate checksum
     */
    private calculateChecksum;
    /**
     * Decompress data
     */
    private decompressData;
    /**
     * Get download progress
     */
    getProgress(): {
        downloadedChunks: number;
        totalChunks: number;
        progress: number;
    };
    /**
     * Cancel download
     */
    cancelDownload(): void;
}
/**
 * Snapshot Generator
 *
 * Creates snapshots from current blockchain state
 */
export declare class SnapshotGenerator {
    private outputDirectory;
    private compressionEnabled;
    constructor(outputDirectory: string, compression?: boolean);
    /**
     * Generate snapshot from current state
     */
    generateSnapshot(blockNumber: number): Promise<SnapshotMetadata>;
    /**
     * Gather state data
     */
    private gatherStateData;
    /**
     * Get block hash
     */
    private getBlockHash;
    /**
     * Get state root
     */
    private getStateRoot;
    /**
     * Compress data
     */
    private compressData;
    /**
     * Split into chunks
     */
    private splitIntoChunks;
    /**
     * Save chunks
     */
    private saveChunks;
    /**
     * Save metadata
     */
    private saveMetadata;
    /**
     * Calculate checksum
     */
    private calculateChecksum;
}
/**
 * Snapshot Server Configuration
 */
export declare const SNAPSHOT_SERVER_CONFIG: {
    baseUrl: string;
    updateInterval: number;
    retentionPeriod: number;
    compression: boolean;
    chunkSize: number;
};
/**
 * Raspberry Pi Snapshot Optimization
 */
export declare class RaspberryPiSnapshotOptimizer {
    /**
     * Estimate download time on Raspberry Pi 4
     */
    static estimateDownloadTime(snapshotSize: number): number;
    /**
     * Estimate decompression time on Raspberry Pi 4
     */
    static estimateDecompressionTime(compressedSize: number): number;
    /**
     * Estimate total sync time with snapshot
     */
    static estimateTotalSyncTime(snapshotSize: number): number;
    /**
     * Get recommended snapshot for Raspberry Pi
     */
    static getRecommendedSnapshot(): {
        maxSize: number;
        compression: boolean;
        chunkSize: number;
    };
}
