"use strict";
/**
 * State Pruning for Lightweight Nodes
 *
 * Enables nodes to run with limited storage by pruning historical state
 * while maintaining ability to access historical data from archive nodes.
 *
 * Reduces storage from 500GB to 100GB for Raspberry Pi compatibility.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RASPBERRY_PI_STORAGE_CONFIG = exports.RaspberryPiStorageOptimizer = exports.ArchiveClient = exports.StatePruner = void 0;
class StatePruner {
    config;
    fullStates;
    prunedStates; // blockNumber -> stateHash only
    currentStateSize;
    archiveClient;
    constructor(config) {
        this.config = config;
        this.fullStates = new Map();
        this.prunedStates = new Map();
        this.currentStateSize = 0;
        this.archiveClient = new ArchiveClient(config.archiveUrl);
    }
    /**
     * Add state for block
     */
    addState(blockNumber, stateHash, stateData) {
        const stateSize = stateData.length;
        // Check if adding would exceed limit
        if (this.currentStateSize + stateSize > this.config.maxStateSizeMB * 1024 * 1024) {
            this.pruneOldestBlocks();
        }
        const state = {
            blockNumber,
            stateHash,
            stateData,
            pruned: false
        };
        this.fullStates.set(blockNumber, state);
        this.currentStateSize += stateSize;
    }
    /**
     * Get state for block
     */
    async getState(blockNumber) {
        // Check if we have full state
        const fullState = this.fullStates.get(blockNumber);
        if (fullState && !fullState.pruned) {
            return fullState.stateData;
        }
        // Check if we have pruned state
        const stateHash = this.prunedStates.get(blockNumber);
        if (stateHash) {
            // Fetch from archive node
            try {
                const stateData = await this.archiveClient.fetchState(blockNumber, stateHash);
                return stateData;
            }
            catch (error) {
                console.error('Failed to fetch state from archive:', error);
                return null;
            }
        }
        return null;
    }
    /**
     * Prune oldest blocks
     */
    pruneOldestBlocks() {
        const blocksToPrune = this.fullStates.size - this.config.retainBlocks;
        if (blocksToPrune > 0) {
            const sortedBlocks = Array.from(this.fullStates.keys()).sort((a, b) => a - b);
            for (let i = 0; i < blocksToPrune; i++) {
                const blockNumber = sortedBlocks[i];
                const state = this.fullStates.get(blockNumber);
                if (state) {
                    // Keep only state hash
                    this.prunedStates.set(blockNumber, state.stateHash);
                    // Remove full state data
                    this.currentStateSize -= state.stateData.length;
                    this.fullStates.delete(blockNumber);
                }
            }
        }
    }
    /**
     * Check if block needs pruning
     */
    needsPruning() {
        return this.currentStateSize > this.config.maxStateSizeMB * 1024 * 1024;
    }
    /**
     * Get storage statistics
     */
    getStorageStats() {
        const fullStatesCount = this.fullStates.size;
        const prunedStatesCount = this.prunedStates.size;
        const currentSizeMB = this.currentStateSize / (1024 * 1024);
        const maxSizeMB = this.config.maxStateSizeMB;
        const utilizationPercent = (currentSizeMB / maxSizeMB) * 100;
        return {
            fullStatesCount,
            prunedStatesCount,
            currentSizeMB,
            maxSizeMB,
            utilizationPercent
        };
    }
    /**
     * Prune to specific block number
     */
    pruneToBlock(blockNumber) {
        for (const [bn, state] of this.fullStates.entries()) {
            if (bn < blockNumber) {
                this.prunedStates.set(bn, state.stateHash);
                this.currentStateSize -= state.stateData.length;
                this.fullStates.delete(bn);
            }
        }
    }
    /**
     * Restore state from archive
     */
    async restoreState(blockNumber) {
        const stateHash = this.prunedStates.get(blockNumber);
        if (!stateHash) {
            return false;
        }
        try {
            const stateData = await this.archiveClient.fetchState(blockNumber, stateHash);
            if (stateData) {
                this.addState(blockNumber, stateHash, stateData);
                this.prunedStates.delete(blockNumber);
                return true;
            }
        }
        catch (error) {
            console.error('Failed to restore state:', error);
        }
        return false;
    }
}
exports.StatePruner = StatePruner;
/**
 * Archive Client
 *
 * Client for fetching historical state from archive nodes
 */
class ArchiveClient {
    archiveUrl;
    cache;
    cacheSize;
    constructor(archiveUrl) {
        this.archiveUrl = archiveUrl;
        this.cache = new Map();
        this.cacheSize = 0;
    }
    /**
     * Fetch state from archive
     */
    async fetchState(blockNumber, stateHash) {
        const cacheKey = `${blockNumber}:${stateHash}`;
        // Check cache first
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey) || null;
        }
        try {
            // Fetch from archive node
            const response = await fetch(`${this.archiveUrl}/state/${blockNumber}/${stateHash}`);
            if (!response.ok) {
                return null;
            }
            const stateData = await response.text();
            // Cache the result
            this.cache.set(cacheKey, stateData);
            this.cacheSize += stateData.length;
            // Prune cache if too large
            if (this.cacheSize > 100 * 1024 * 1024) { // 100MB cache limit
                this.pruneCache();
            }
            return stateData;
        }
        catch (error) {
            console.error('Archive fetch error:', error);
            return null;
        }
    }
    /**
     * Fetch block header from archive
     */
    async fetchBlockHeader(blockNumber) {
        try {
            const response = await fetch(`${this.archiveUrl}/header/${blockNumber}`);
            if (!response.ok) {
                return null;
            }
            return await response.json();
        }
        catch (error) {
            console.error('Archive header fetch error:', error);
            return null;
        }
    }
    /**
     * Prune cache
     */
    pruneCache() {
        const entries = Array.from(this.cache.entries());
        // Remove oldest entries
        entries.slice(0, entries.length / 2).forEach(([key]) => {
            const value = this.cache.get(key);
            if (value) {
                this.cacheSize -= value.length;
                this.cache.delete(key);
            }
        });
    }
    /**
     * Get cache statistics
     */
    getCacheStats() {
        return {
            entries: this.cache.size,
            sizeMB: this.cacheSize / (1024 * 1024),
            hitRate: 0 // Would track actual hit rate
        };
    }
}
exports.ArchiveClient = ArchiveClient;
/**
 * Raspberry Pi Storage Optimization
 *
 * Additional optimizations specifically for Raspberry Pi storage constraints
 */
class RaspberryPiStorageOptimizer {
    compressionEnabled;
    deduplicationEnabled;
    constructor(compression = true, deduplication = true) {
        this.compressionEnabled = compression;
        this.deduplicationEnabled = deduplication;
    }
    /**
     * Compress state data
     */
    compressState(stateData) {
        if (!this.compressionEnabled) {
            return stateData;
        }
        // Simplified compression (in production, use actual compression library)
        // LZ4 or Zstandard for fast compression/decompression
        return stateData; // Placeholder
    }
    /**
     * Decompress state data
     */
    decompressState(compressedData) {
        if (!this.compressionEnabled) {
            return compressedData;
        }
        // Simplified decompression
        return compressedData; // Placeholder
    }
    /**
     * Deduplicate state data
     */
    deduplicateState(stateData) {
        if (!this.deduplicationEnabled) {
            return {
                deduplicated: stateData,
                hash: this.hashState(stateData),
                isNew: true
            };
        }
        const hash = this.hashState(stateData);
        // In production, check against deduplication cache
        return {
            deduplicated: stateData,
            hash,
            isNew: true
        };
    }
    /**
     * Hash state for deduplication
     */
    hashState(stateData) {
        // Simplified hashing
        let hash = 0;
        for (let i = 0; i < stateData.length; i++) {
            const char = stateData.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash.toString(16);
    }
    /**
     * Estimate storage savings
     */
    estimateSavings(stateData) {
        const originalSize = stateData.length;
        // Compression typically saves 50-70%
        const compressionSavings = this.compressionEnabled ? originalSize * 0.6 : 0;
        // Deduplication varies by data
        const deduplicationSavings = this.deduplicationEnabled ? originalSize * 0.2 : 0;
        const totalSavings = compressionSavings + deduplicationSavings;
        return {
            compressionSavings,
            deduplicationSavings,
            totalSavings
        };
    }
}
exports.RaspberryPiStorageOptimizer = RaspberryPiStorageOptimizer;
/**
 * Storage Configuration for Raspberry Pi
 */
exports.RASPBERRY_PI_STORAGE_CONFIG = {
    retainBlocks: 10000, // Keep 10,000 recent blocks
    pruneInterval: 1000, // Prune every 1,000 blocks
    archiveUrl: 'https://archive.lxon.network',
    maxStateSizeMB: 80 * 1024 // 80GB max (leaves 20GB for OS and other data)
};
