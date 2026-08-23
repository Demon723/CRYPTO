export interface CompactFilter {
    blockHash: Uint8Array;
    filter: Uint8Array;
}
export interface GolombRiceSet {
    P: number;
    M: number;
    elements: number[];
}
export declare class GolombRiceFilter {
    private P;
    private M;
    private elements;
    constructor(P?: number, M?: number);
    insert(element: number): void;
    build(): Uint8Array;
    static match(filter: Uint8Array, P: number, M: number, value: number): boolean;
}
export declare class CompactFilterBuilder {
    private filter;
    addOutput(outpoint: Uint8Array): void;
    addData(data: Uint8Array): void;
    build(): Uint8Array;
    private bytesToU64;
}
export declare class SPVLightClient {
    private blockFilters;
    private blockHeaders;
    private peerFilterHashes;
    addBlock(blockHash: Uint8Array, filter: Uint8Array, header: Uint8Array): void;
    queryFilters(startHeight: number, endHeight: number): string[];
    matchFilter(blockHash: Uint8Array, key: Uint8Array): boolean;
    getFilterHeader(blockHash: Uint8Array): Uint8Array | undefined;
    private heightToHash;
    private bytesToU64;
}
export declare function buildBasicFilter(blockHash: Uint8Array, prevFilter: Uint8Array | null): Uint8Array;
export declare function verifyFilterMatch(filter: Uint8Array, key: Uint8Array): boolean;
