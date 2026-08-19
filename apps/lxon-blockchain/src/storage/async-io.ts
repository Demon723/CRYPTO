import { promises as fs } from 'fs';
import { randomUUID } from 'crypto';

export interface StorageBlock {
  offset: number;
  data: Buffer;
}

export interface IORequest {
  id: string;
  type: 'read' | 'write';
  offset: number;
  size: number;
  data?: Buffer;
}

export interface IOCompletion {
  id: string;
  success: boolean;
  data?: Buffer;
  error?: string;
  latencyMs: number;
}

export class AsyncFileIO {
  private filePath: string;
  private fileHandle: fs.FileHandle | null = null;
  private blockSize: number;
  private totalBlocks: number;

  constructor(filePath: string, blockSize: number = 4096, totalBlocks: number = 1024 * 1024) {
    this.filePath = filePath;
    this.blockSize = blockSize;
    this.totalBlocks = totalBlocks;
  }

  async initialize(): Promise<void> {
    try {
      this.fileHandle = await fs.open(this.filePath, 'a+');
      const stat = await fs.stat(this.filePath);
      const currentBlocks = Math.floor(stat.size / this.blockSize);
      if (currentBlocks < this.totalBlocks) {
        const padding = Buffer.alloc((this.totalBlocks - currentBlocks) * this.blockSize);
        await this.fileHandle.write(padding, 0, currentBlocks * this.blockSize);
      }
    } catch (err) {
      throw new Error(`Failed to initialize storage file: ${err}`);
    }
  }

  async readBlock(offset: number, size: number = 4096): Promise<Buffer> {
    if (!this.fileHandle) throw new Error('Storage not initialized');
    const buffer = Buffer.alloc(size);
    await this.fileHandle.read(buffer, 0, size, offset);
    return buffer;
  }

  async writeBlock(offset: number, data: Buffer): Promise<void> {
    if (!this.fileHandle) throw new Error('Storage not initialized');
    await this.fileHandle.write(data, 0, data.length, offset);
  }

  async readBlocks(offsets: number[], size: number = 4096): Promise<Map<number, Buffer>> {
    const results = new Map<number, Buffer>();
    await Promise.all(offsets.map(async offset => {
      const data = await this.readBlock(offset, size);
      results.set(offset, data);
    }));
    return results;
  }

  async writeBlocks(writes: Map<number, Buffer>): Promise<void> {
    await Promise.all(Array.from(writes.entries()).map(async ([offset, data]) => {
      await this.writeBlock(offset, data);
    }));
  }

  async flush(): Promise<void> {
    if (this.fileHandle) {
      await this.fileHandle.sync();
    }
  }

  async close(): Promise<void> {
    if (this.fileHandle) {
      await this.fileHandle.close();
      this.fileHandle = null;
    }
  }
}
