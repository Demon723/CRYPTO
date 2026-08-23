export interface EncryptedTransaction {
    id: string;
    ciphertext: Uint8Array;
    nonce: Uint8Array;
    ephemeralPublicKey: Uint8Array;
    lockTime: number;
    threshold: number;
    total: number;
}
export interface TimeLockPuzzle {
    id: string;
    ciphertext: Uint8Array;
    solution: Uint8Array;
    timeParam: bigint;
}
export declare class EncryptedMempool {
    private pendingTransactions;
    private validatorShares;
    private threshold;
    private totalValidators;
    constructor(threshold?: number, totalValidators?: number);
    submitEncrypted(transaction: EncryptedTransaction): void;
    decryptTransaction(id: string, shares: Uint8Array[]): Uint8Array | null;
    getRevealableTransactions(): EncryptedTransaction[];
    private combineShares;
}
export declare class TimeLockPuzzleGenerator {
    static generate(message: Uint8Array, timeSeconds: number): TimeLockPuzzle;
    static verifySolution(puzzle: TimeLockPuzzle, claimedSolution: Uint8Array): boolean;
}
export declare class ThresholdDecryption {
    private validatorPrivateShares;
    private publicKey;
    constructor(publicKey: Uint8Array);
    registerValidatorShare(validatorId: string, share: Uint8Array): void;
    reconstructSecret(shares: Uint8Array[]): Uint8Array;
    decrypt(encrypted: Uint8Array, shares: Uint8Array[]): Uint8Array | null;
}
