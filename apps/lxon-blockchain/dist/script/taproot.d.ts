export interface MASTNode {
    hash: Uint8Array;
    left?: MASTNode;
    right?: MASTNode;
    script?: Uint8Array;
}
export interface TaprootOutput {
    outputKey: Uint8Array;
    scriptPath?: Uint8Array;
    merkleRoot?: Uint8Array;
}
export declare class MASTBuilder {
    private scripts;
    addScript(script: Uint8Array): void;
    build(): Uint8Array;
    getScriptCount(): number;
}
export declare class TaprootEngine {
    static createKeyPathOutput(internalPubKey: Uint8Array, merkleRoot?: Uint8Array): TaprootOutput;
    static createScriptPathOutput(internalPubKey: Uint8Array, script: Uint8Array): TaprootOutput;
    static tweakPublicKey(internalPubKey: Uint8Array, merkleRoot?: Uint8Array): Uint8Array;
    static verifyTaprootSignature(outputKey: Uint8Array, signature: Uint8Array, message: Uint8Array): boolean;
    static createSchnorrSignature(privateKey: Uint8Array, message: Uint8Array): Uint8Array;
    static verifySchnorrSignature(publicKey: Uint8Array, signature: Uint8Array, message: Uint8Array): boolean;
    static hashScript(script: Uint8Array): Uint8Array;
    static verifyMerkleProof(leafHash: Uint8Array, root: Uint8Array, proof: Uint8Array[]): boolean;
}
export interface TapLeaf {
    version: number;
    script: Uint8Array;
}
export declare function createTapLeaf(script: Uint8Array, version?: number): Uint8Array;
export declare function computeTapLeafHash(leaf: Uint8Array): Uint8Array;
