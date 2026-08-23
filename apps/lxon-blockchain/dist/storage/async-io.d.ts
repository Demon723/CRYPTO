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
export declare class AsyncFileIO {
    private filePath;
    private fileHandle;
    private blockSize;
    private totalBlocks;
    constructor(filePath: string, blockSize?: number, totalBlocks?: number);
    initialize(): Promise<void>;
    readBlock(offset: number, size?: number): Promise<Buffer>;
    writeBlock(offset: number, data: Buffer): Promise<void>;
    readBlocks(offsets: number[], size?: number): Promise<Map<number, Buffer>>;
    writeBlocks(writes: Map<number, Buffer>): Promise<void>;
    flush(): Promise<void>;
    close(): Promise<void>;
}
