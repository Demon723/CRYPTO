import { AsyncFileIO, IOCompletion } from './storage/async-io';
import { IOUringEngine } from './storage/io-uring-sim';

export class AsyncBlockDeviceIO {
  constructor(public devicePath: string) {}

  public async async_read_block(blockOffset: number, size: number): Promise<Buffer> {
    const fileIo = new AsyncFileIO(this.devicePath, 4096, 1024 * 1024);
    await fileIo.initialize();
    return fileIo.readBlock(blockOffset, size);
  }

  public async async_write_blocks(writeBatch: Map<number, Buffer>): Promise<void> {
    const fileIo = new AsyncFileIO(this.devicePath, 4096, 1024 * 1024);
    await fileIo.initialize();
    await fileIo.writeBlocks(writeBatch);
    await fileIo.flush();
  }
}

export class MonadDBStorageEngine {
  public diskIo: AsyncBlockDeviceIO;
  public nodeCache = new Map<string, Buffer>();
  private ioUring: IOUringEngine | null = null;

  constructor(devicePath: string) {
    this.diskIo = new AsyncBlockDeviceIO(devicePath);
  }

  public async initialize(enableIOUring: boolean = true): Promise<void> {
    if (enableIOUring) {
      const fileIo = new AsyncFileIO(this.diskIo.devicePath, 4096, 1024 * 1024);
      await fileIo.initialize();
      this.ioUring = new IOUringEngine(
        { queueDepth: 256, batchSize: 64, pollIntervalMs: 1 },
        fileIo
      );
      await this.ioUring.start();
    }
  }

  public async get_trie_node(nodeHash: string, diskOffset: number): Promise<Buffer> {
    if (this.nodeCache.has(nodeHash)) {
      return this.nodeCache.get(nodeHash)!;
    }

    if (this.ioUring) {
      const requestId = this.ioUring.submitRead(diskOffset, 4096);
      const start = Date.now();
      while (Date.now() - start < 5000) {
        const completion = this.ioUring.getCompletion(requestId);
        if (completion) {
          if (completion.success && completion.data) {
            this.nodeCache.set(nodeHash, completion.data);
            return completion.data;
          }
          throw new Error(completion.error || 'IOUring read failed');
        }
        await new Promise(resolve => setTimeout(resolve, 0.1));
      }
      throw new Error('IOUring read timeout');
    }

    const rawNode = await this.diskIo.async_read_block(diskOffset, 4096);
    this.nodeCache.set(nodeHash, rawNode);
    return rawNode;
  }

  public async execute_parallel_state_lookups(
    lookupRequests: [string, number][]
  ): Promise<Buffer[]> {
    if (this.ioUring) {
      const requestIds: string[] = [];
      for (const [, offset] of lookupRequests) {
        requestIds.push(this.ioUring.submitRead(offset, 4096));
      }

      const start = Date.now();
      while (Date.now() - start < 10000) {
        const completions = this.ioUring.getCompletions(requestIds);
        if (completions.length === requestIds.length && completions.every(c => c !== undefined)) {
          return completions.map(c => c!.data || Buffer.alloc(0));
        }
        await new Promise(resolve => setTimeout(resolve, 0.5));
      }
      throw new Error('Parallel lookups timeout');
    }

    const tasks = lookupRequests.map(([, offset]) => this.get_trie_node('', offset));
    return Promise.all(tasks);
  }

  public async commit_state_batch(dirtyNodes: Map<number, Buffer>): Promise<void> {
    if (this.ioUring) {
      const requestIds: string[] = [];
      for (const [offset, data] of dirtyNodes) {
        requestIds.push(this.ioUring.submitWrite(offset, data));
      }

      const start = Date.now();
      while (Date.now() - start < 10000) {
        const completions = this.ioUring.getCompletions(requestIds);
        if (completions.length === requestIds.length && completions.every(c => c !== undefined && c!.success)) {
          return;
        }
        await new Promise(resolve => setTimeout(resolve, 0.5));
      }
      throw new Error('Batch commit timeout');
    }

    await this.diskIo.async_write_blocks(dirtyNodes);
  }

  public async shutdown(): Promise<void> {
    if (this.ioUring) {
      await this.ioUring.stop();
    }
  }
}
