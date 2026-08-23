import { AsyncFileIO } from './async-io';
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
export declare class IOUringEngine {
    private submissionQueue;
    private completionQueue;
    private pendingRequests;
    private config;
    private ioBackend;
    private isRunning;
    private nextRequestId;
    constructor(config: IOUringConfig, ioBackend: AsyncFileIO);
    start(): Promise<void>;
    stop(): Promise<void>;
    submitRead(offset: number, size: number): string;
    submitWrite(offset: number, data: Buffer): string;
    getCompletion(requestId: string): CQEntry | undefined;
    getCompletions(requestIds: string[]): CQEntry[];
    private processLoop;
    private drainSubmissionQueue;
    private processBatch;
    private processReads;
    private processWrites;
    private generateRequestId;
    private sleep;
}
