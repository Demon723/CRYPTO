export interface CryptoUser {
    address: string;
    publicKey: string;
    balance?: string;
    nonce?: number;
    metadata?: Record<string, any>;
}
export interface CryptoTx {
    txIndex: number;
    readKeys: string[];
    writeDict?: Record<string, any>;
    logic?: string;
    sender: string;
    signature?: string;
}
export declare function encodeUser(user: CryptoUser): Uint8Array;
export declare function hashUser(user: CryptoUser): string;
export declare function encodeTransaction(tx: CryptoTx): Uint8Array;
export declare function hashTransaction(tx: CryptoTx): string;
export declare function signTransaction(tx: CryptoTx, privateKeyHex: string): string;
export declare function verifyTransactionSignature(tx: CryptoTx, signatureHex: string, publicKeyHex: string): boolean;
export declare function generateUserStateRoot(users: CryptoUser[]): string;
export declare function generateTxMerkleRoot(txs: CryptoTx[]): string;
export declare function deriveAddressFromPublicKey(publicKeyHex: string): string;
export declare const ASTRO_ALGORITHM: {
    readonly ECDSA: 1;
    readonly SLS44: 2;
    readonly SLS65: 3;
    readonly NFS512: 4;
    readonly NFS1024: 5;
    readonly CHS128S: 6;
    readonly CHS128F: 7;
};
export type AstroAlgorithmId = typeof ASTRO_ALGORITHM[keyof typeof ASTRO_ALGORITHM];
export interface AstroSignature {
    version: number;
    classicalSig: Uint8Array;
    classicalPub: Uint8Array;
    arcSigma: Uint8Array;
    arcPubKey: Uint8Array;
    algorithmId: AstroAlgorithmId;
    ephemeralPubKey: Uint8Array;
    nonce: bigint;
}
export interface AstroKeypair {
    privateKeyHex: string;
    publicKeyHex: string;
    arcPublicKey: Uint8Array;
    arcPrivateKey: Uint8Array;
    address: string;
}
export declare function encodeAstroSignature(sig: AstroSignature): Uint8Array;
export declare function hashAstroSignature(sig: AstroSignature): string;
export declare function generateAstroAddress(classicalPub: Uint8Array, arcPub: Uint8Array): string;
export declare function getAstroPhase(genesisTime: number, blockTime: number): number;
