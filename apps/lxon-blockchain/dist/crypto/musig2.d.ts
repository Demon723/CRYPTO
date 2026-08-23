export interface MuSig2KeyAggregation {
    aggregatedPublicKey: Uint8Array;
    tweakedAggregatedKey: Uint8Array;
    keyAggregationCoefficient: (publicKey: Uint8Array, index: number) => Uint8Array;
}
export interface MuSig2SignatureShare {
    publicNonce: {
        R: Uint8Array;
        c: Uint8Array;
    };
    signatureShare: Uint8Array;
}
export interface MuSig2AggregatedNonce {
    nonce: Uint8Array;
    participants: Uint8Array[];
}
export declare class MuSig2 {
    static aggregatePublicKeys(publicKeys: Uint8Array[]): {
        aggregatedKey: Uint8Array;
        tweakedKey: Uint8Array;
    };
    static generateNonce(): {
        R: Uint8Array;
        c: Uint8Array;
    };
    static computeAggregateNonce(publicNonces: {
        R: Uint8Array;
        c: Uint8Array;
    }[]): Uint8Array;
    static computeChallenge(aggregateNonce: Uint8Array, aggregatedPublicKey: Uint8Array, message: Uint8Array): Uint8Array;
    static sign(privateKey: Uint8Array, aggregatedPublicKey: Uint8Array, message: Uint8Array, publicNonces: {
        R: Uint8Array;
        c: Uint8Array;
    }[], index: number): MuSig2SignatureShare;
    static aggregateSignatures(shares: MuSig2SignatureShare[], aggregatedPublicKey: Uint8Array, message: Uint8Array): Buffer;
    static verify(aggregatedPublicKey: Uint8Array, signature: Buffer, message: Uint8Array): boolean;
}
