export declare class AsyncBlockDeviceIO {
    devicePath: string;
    constructor(devicePath: string);
    async_read_block(blockOffset: number, size: number): Promise<Buffer>;
    async_write_blocks(writeBatch: Map<number, Buffer>): Promise<void>;
}
export declare class MonadDBStorageEngine {
    diskIo: AsyncBlockDeviceIO;
    nodeCache: Map<string, Buffer<ArrayBufferLike>>;
    constructor(devicePath: string);
    get_trie_node(nodeHash: string, diskOffset: number): Promise<Buffer>;
    execute_parallel_state_lookups(lookupRequests: [string, number][]): Promise<Buffer[]>;
    commit_state_batch(dirtyNodes: Map<number, Buffer>): Promise<void>;
}
