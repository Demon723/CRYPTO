export interface MaddagRules {
    maxBlockGas: bigint;
    minGasPrice: bigint;
    maxTxPerBlock: number;
    priorityFeeCap: bigint;
    blobFeeCap: bigint;
    maxBlobPerBlock: number;
}
export interface MEVProtection {
    isMEVDetected: boolean;
    detectedPatterns: MEVPattern[];
    recommendedAction: string;
    confidence: number;
}
export interface MEVPattern {
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    affectedTransactions: string[];
    detectedAt: number;
}
export interface TransactionSignature {
    txHash: string;
    sender: string;
    nonce: number;
    gasPrice: bigint;
    gasLimit: bigint;
    value: bigint;
    to: string;
    data: Buffer;
    timestamp: number;
    priorityFee: bigint;
}
export declare class MEVResistantMempool {
    rules: MaddagRules;
    private pendingTransactions;
    private mevPatterns;
    private seenTransactions;
    private commitRevealEnabled;
    constructor(rules: MaddagRules);
    submitTransaction(tx: TransactionSignature): {
        accepted: boolean;
        reason: string;
    };
    private _checkMEVPatterns;
    getMEVProtection(): MEVProtection;
    getPendingTransactions(): TransactionSignature[];
    clearPending(): void;
    enableCommitReveal(enabled: boolean): void;
}
export declare function applyMEVProtection(tx: TransactionSignature, mempool: MEVResistantMempool): {
    protected: boolean;
    reason: string;
};
