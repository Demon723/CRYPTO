import { Transaction } from '../block-stm';
export interface PendingTransaction {
    hash: string;
    transaction: Transaction;
    sender: string;
    fee: bigint;
    nonce: number;
    timestamp: number;
    status: 'pending' | 'confirmed' | 'rejected';
    priority: number;
}
export interface TransactionPoolConfig {
    maxPending: number;
    maxPerSender: number;
    minFee: bigint;
    expiryMs: number;
}
export declare class TransactionPool {
    private pending;
    private bySender;
    private config;
    private nonces;
    private confirmedCount;
    private rejectedCount;
    constructor(config?: Partial<TransactionPoolConfig>);
    addTransaction(tx: Transaction, sender: string, fee: bigint): {
        accepted: boolean;
        reason?: string;
    };
    removeTransaction(hash: string): boolean;
    getPendingTransactions(limit?: number): PendingTransaction[];
    getTransactionsBySender(sender: string): PendingTransaction[];
    confirmTransaction(hash: string): boolean;
    rejectTransaction(hash: string, reason: string): boolean;
    cleanupExpired(): number;
    getStats(): {
        pending: number;
        confirmed: number;
        rejected: number;
    };
    private computeHash;
}
