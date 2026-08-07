import { AsyncFileIO, IORequest, IOCompletion } from './async-io';

export interface IOUringConfig {
  queueDepth: number;
  batchSize: number;
  pollIntervalMs: number;
}

export interface SQEntry {
  requestId: string;
  type: 'read' | 'write';
  offset: number;
  size: number;
  data?: Buffer;
  timestamp: number;
}

export interface CQEntry {
  requestId: string;
  success: boolean;
  data?: Buffer;
  error?: string;
  latencyMs: number;
}

export class IOUringEngine {
  private submissionQueue: SQEntry[] = [];
  private completionQueue: CQEntry[] = [];
  private pendingRequests: Map<string, IORequest> = new Map();
  private config: IOUringConfig;
  private ioBackend: AsyncFileIO;
  private isRunning: boolean = false;
  private nextRequestId: number = 0;

  constructor(config: IOUringConfig, ioBackend: AsyncFileIO) {
    this.config = config;
    this.ioBackend = ioBackend;
  }

  async start(): Promise<void> {
    this.isRunning = true;
    await this.processLoop();
  }

  async stop(): Promise<void> {
    this.isRunning = false;
  }

  public submitRead(offset: number, size: number): string {
    const requestId = this.generateRequestId();
    const entry: SQEntry = {
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

  public submitWrite(offset: number, data: Buffer): string {
    const requestId = this.generateRequestId();
    const entry: SQEntry = {
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

  public getCompletion(requestId: string): CQEntry | undefined {
    return this.completionQueue.find(c => c.requestId === requestId);
  }

  public getCompletions(requestIds: string[]): CQEntry[] {
    return requestIds.map(id => this.completionQueue.find(c => c.requestId === id)).filter(Boolean) as CQEntry[];
  }

  private async processLoop(): Promise<void> {
    while (this.isRunning) {
      const batch = this.drainSubmissionQueue();
      if (batch.length > 0) {
        await this.processBatch(batch);
      }
      await this.sleep(this.config.pollIntervalMs);
    }
  }

  private drainSubmissionQueue(): SQEntry[] {
    const batch = this.submissionQueue.splice(0, this.config.batchSize);
    return batch;
  }

  private async processBatch(entries: SQEntry[]): Promise<void> {
    const reads = entries.filter(e => e.type === 'read');
    const writes = entries.filter(e => e.type === 'write');

    if (reads.length > 0) {
      await this.processReads(reads);
    }
    if (writes.length > 0) {
      await this.processWrites(writes);
    }
  }

  private async processReads(entries: SQEntry[]): Promise<void> {
    const offsets = entries.map(e => e.offset);
    const uniqueOffsets = [...new Set(offsets)];
    const size = entries[0]?.size || 4096;

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
    } catch (err) {
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

  private async processWrites(entries: SQEntry[]): Promise<void> {
    const writeMap = new Map<number, Buffer>();
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
    } catch (err) {
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

  private generateRequestId(): string {
    return `io_${Date.now()}_${++this.nextRequestId}`;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
