export declare function sha256(data: Uint8Array): Buffer;
export declare function sha256x2(data: Uint8Array): Buffer;
export declare function hash160(data: Uint8Array): Buffer;
export declare function hash256(data: Uint8Array): Buffer;
export declare function ripemd160(data: Uint8Array): Buffer;
export declare function hmacSha512(key: Uint8Array | string, data: Uint8Array): Buffer;
export declare function taggedHash(tag: string, data: Uint8Array): Buffer;
