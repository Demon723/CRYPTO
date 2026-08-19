/**
 * Narwhal DAG Mempool for LXON Blockchain
 *
 * Separates transaction dissemination from ordering using a DAG-based
 * mempool protocol. Achieves high-throughput reliable dissemination
 * and storage of causal histories of transactions.
 *
 * Based on: Narwhal and Tusk (arXiv:2105.11827)
 */
export interface Transaction {
    id: string;
    sender: string;
    recipient: string;
    value: bigint;
    gasPrice: bigint;
    gasLimit: bigint;
    nonce: number;
    data: Buffer;
    signature: Buffer;
    timestamp: number;
}
export interface DAGVertex {
    hash: string;
    transaction: Transaction;
    parents: string[];
    round: number;
    author: string;
    timestamp: number;
}
export interface BatchCertificate {
    batchHash: string;
    round: number;
    origin: string;
    parentCertificates: string[];
    signatures: Array<{
        validatorId: string;
        signature: Buffer;
    }>;
}
export interface ValidatorSet {
    validators: Map<string, bigint>;
    byzantineThreshold: number;
}
export declare class NarwhalMempool {
    private dag;
    private pendingTransactions;
    private batchCertificates;
    private validators;
    private currentRound;
    constructor(validatorAddresses: string[], totalStake: bigint);
    submitTransaction(tx: Transaction): void;
    formBatch(round: number, author: string): {
        batchHash: string;
        transactions: Transaction[];
    };
    verifyBatchCertificate(cert: BatchCertificate): boolean;
    private getActiveParentHashes;
    private computeBatchHash;
    getDAGState(): {
        vertices: DAGVertex[];
        pendingCount: number;
        currentRound: number;
        validatorCount: number;
    };
    advanceRound(author: string): {
        batchHash: string;
        transactions: Transaction[];
    };
}
