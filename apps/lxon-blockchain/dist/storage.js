"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonadDBStorageEngine = exports.AsyncBlockDeviceIO = void 0;
class AsyncBlockDeviceIO {
    devicePath;
    constructor(devicePath) {
        this.devicePath = devicePath;
    }
    async async_read_block(blockOffset, size) {
        // Simulate NVMe storage read latency (~500 microseconds / 0.5 milliseconds)
        await new Promise(resolve => setTimeout(resolve, 0.5));
        // Return dummy block data representing state trie node payload
        const buffer = Buffer.alloc(size);
        buffer.write(`BLOCK_OFFSET_${blockOffset}_PAYLOAD`);
        return buffer;
    }
    async async_write_blocks(writeBatch) {
        // Simulate NVMe storage write/commit latency (~800 microseconds / 0.8 milliseconds)
        await new Promise(resolve => setTimeout(resolve, 0.8));
        return;
    }
}
exports.AsyncBlockDeviceIO = AsyncBlockDeviceIO;
class MonadDBStorageEngine {
    diskIo;
    nodeCache = new Map();
    constructor(devicePath) {
        this.diskIo = new AsyncBlockDeviceIO(devicePath);
    }
    async get_trie_node(nodeHash, diskOffset) {
        if (this.nodeCache.has(nodeHash)) {
            return this.nodeCache.get(nodeHash);
        }
        // Cache miss: Trigger async hardware block read (non-blocking thread)
        const rawNode = await this.diskIo.async_read_block(diskOffset, 4096);
        this.nodeCache.set(nodeHash, rawNode);
        return rawNode;
    }
    // Decoupled storage parallel execution interface
    async execute_parallel_state_lookups(lookupRequests) {
        const tasks = lookupRequests.map(([hash, offset]) => this.get_trie_node(hash, offset));
        // Resolve all lookups concurrently without locking executing threads
        return Promise.all(tasks);
    }
    async commit_state_batch(dirtyNodes) {
        await this.diskIo.async_write_blocks(dirtyNodes);
    }
}
exports.MonadDBStorageEngine = MonadDBStorageEngine;
