export interface FrostKeyPackage {
    publicKey: Uint8Array;
    publicShares: Map<number, Uint8Array>;
    secretShare: Uint8Array;
    identifier: number;
}
export interface FrostSignatureShare {
    identifier: number;
    zi: Uint8Array;
    wi: Uint8Array;
}
export interface FrostThresholdConfig {
    threshold: number;
    total: number;
}
export declare class FrostThreshold {
    private config;
    private identifiers;
    private publicKey;
    private secretShares;
    private publicShares;
    private groupPublicKey;
    constructor(config: FrostThresholdConfig);
    generateKeyPackages(): FrostKeyPackage[];
    sign(secretShare: Uint8Array, identifier: number, message: Uint8Array): FrostSignatureShare;
    aggregateSignature(shares: FrostSignatureShare[], message: Uint8Array): Buffer;
    verifySignature(publicKey: Uint8Array, signature: Buffer, message: Uint8Array): boolean;
    getGroupPublicKey(): Uint8Array;
    private generateSecretShare;
    private computePublicShare;
    private aggregatePublicShares;
    private generateNonce;
    private computeCommitment;
    private computeBindingFactor;
    private applyBindingFactor;
    private computeChallenge;
    private computeZI;
    private computeWI;
    private computeRX;
    private scalarMult;
    private addMod;
    private modNegate;
    private toNumber;
}
