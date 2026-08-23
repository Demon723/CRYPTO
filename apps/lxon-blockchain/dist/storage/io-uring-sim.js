"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IOUringEngine = void 0;
class IOUringEngine {
    submissionQueue = [];
    completionQueue = [];
    pendingRequests = new Map();
    config;
    ioBackend;
    isRunning = false;
    nextRequestId = 0;
    constructor(config, ioBackend) {
        this.config = config;
        this.ioBackend = ioBackend;
    }
    async start() {
        this.isRunning = true;
        await this.processLoop();
    }
    async stop() {
        this.isRunning = false;
    }
    submitRead(offset, size) {
        const requestId = this.generateRequestId();
        const entry = {
            requestId,
            type: 'read',
            offset,
            size,
            timestamp: Date.now(),
        };
        this.submissionQueue.push(entry);
        this.pendingRequests.set(requestId, { id: requestId, type: 'read', offset, size });
        return requestId;
    }
    submitWrite(offset, data) {
        const requestId = this.generateRequestId();
        const entry = {
            requestId,
            type: 'write',
            offset,
            size: data.length,
            data,
            timestamp: Date.now(),
        };
        this.submissionQueue.push(entry);
        this.pendingRequests.set(requestId, { id: requestId, type: 'write', offset, size: data.length, data });
        return requestId;
    }
    getCompletion(requestId) {
        return this.completionQueue.find(c => c.requestId === requestId);
    }
    getCompletions(requestIds) {
        return requestIds.map(id => this.completionQueue.find(c => c.requestId === id)).filter(Boolean);
    }
    async processLoop() {
        while (this.isRunning) {
            const batch = this.drainSubmissionQueue();
            if (batch.length > 0) {
                await this.processBatch(batch);
            }
            await this.sleep(this.config.pollIntervalMs);
        }
    }
    drainSubmissionQueue() {
        const batch = this.submissionQueue.splice(0, this.config.batchSize);
        return batch;
    }
    async processBatch(entries) {
        const reads = entries.filter(e => e.type === 'read');
        const writes = entries.filter(e => e.type === 'write');
        if (reads.length > 0) {
            await this.processReads(reads);
        }
        if (writes.length > 0) {
            await this.processWrites(writes);
        }
    }
    async processReads(entries) {
        const offsets = entries.map(e => e.offset);
        const uniqueOffsets = [...new Set(offsets)];
        const firstEntry = entries[0];
        const size = firstEntry ? firstEntry.size : 4096;
        try {
            const results = await this.ioBackend.readBlocks(uniqueOffsets, size);
            for (const entry of entries) {
                const data = results.get(entry.offset);
                const latency = Date.now() - entry.timestamp;
                this.completionQueue.push({
                    requestId: entry.requestId,
                    success: !!data,
                    data: data || undefined,
                    error: data ? undefined : 'Read failed',
                    latencyMs: latency,
                });
                this.pendingRequests.delete(entry.requestId);
            }
        }
        catch (err) {
            for (const entry of entries) {
                this.completionQueue.push({
                    requestId: entry.requestId,
                    success: false,
                    error: String(err),
                    latencyMs: Date.now() - entry.timestamp,
                });
                this.pendingRequests.delete(entry.requestId);
            }
        }
    }
    async processWrites(entries) {
        const writeMap = new Map();
        for (const entry of entries) {
            if (entry.data) {
                writeMap.set(entry.offset, entry.data);
            }
        }
        try {
            await this.ioBackend.writeBlocks(writeMap);
            await this.ioBackend.flush();
            for (const entry of entries) {
                const latency = Date.now() - entry.timestamp;
                this.completionQueue.push({
                    requestId: entry.requestId,
                    success: true,
                    latencyMs: latency,
                });
                this.pendingRequests.delete(entry.requestId);
            }
        }
        catch (err) {
            for (const entry of entries) {
                this.completionQueue.push({
                    requestId: entry.requestId,
                    success: false,
                    error: String(err),
                    latencyMs: Date.now() - entry.timestamp,
                });
                this.pendingRequests.delete(entry.requestId);
            }
        }
    }
    generateRequestId() {
        return `io_${Date.now()}_${++this.nextRequestId}`;
    }
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
exports.IOUringEngine = IOUringEngine;
