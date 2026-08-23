"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsyncFileIO = void 0;
const fs_1 = require("fs");
class AsyncFileIO {
    filePath;
    fileHandle = null;
    blockSize;
    totalBlocks;
    constructor(filePath, blockSize = 4096, totalBlocks = 1024 * 1024) {
        this.filePath = filePath;
        this.blockSize = blockSize;
        this.totalBlocks = totalBlocks;
    }
    async initialize() {
        try {
            this.fileHandle = await fs_1.promises.open(this.filePath, 'a+');
            const stat = await fs_1.promises.stat(this.filePath);
            const currentBlocks = Math.floor(stat.size / this.blockSize);
            if (currentBlocks < this.totalBlocks) {
                const padding = Buffer.alloc((this.totalBlocks - currentBlocks) * this.blockSize);
                await this.fileHandle.write(padding, 0, currentBlocks * this.blockSize);
            }
        }
        catch (err) {
            throw new Error(`Failed to initialize storage file: ${err}`);
        }
    }
    async readBlock(offset, size = 4096) {
        if (!this.fileHandle)
            throw new Error('Storage not initialized');
        const buffer = Buffer.alloc(size);
        await this.fileHandle.read(buffer, 0, size, offset);
        return buffer;
    }
    async writeBlock(offset, data) {
        if (!this.fileHandle)
            throw new Error('Storage not initialized');
        await this.fileHandle.write(data, 0, data.length, offset);
    }
    async readBlocks(offsets, size = 4096) {
        const results = new Map();
        await Promise.all(offsets.map(async (offset) => {
            const data = await this.readBlock(offset, size);
            results.set(offset, data);
        }));
        return results;
    }
    async writeBlocks(writes) {
        await Promise.all(Array.from(writes.entries()).map(async ([offset, data]) => {
            await this.writeBlock(offset, data);
        }));
    }
    async flush() {
        if (this.fileHandle) {
            await this.fileHandle.sync();
        }
    }
    async close() {
        if (this.fileHandle) {
            await this.fileHandle.close();
            this.fileHandle = null;
        }
    }
}
exports.AsyncFileIO = AsyncFileIO;
