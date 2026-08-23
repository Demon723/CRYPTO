/**
 * Bitcoin-Style Fee Market for LXON Blockchain
 *
 * Implements sophisticated fee estimation, RBF (Replace-by-Fee),
 * and fee bumping mechanisms similar to Bitcoin Core's fee handling.
 *
 * Features:
 * - Dynamic fee estimation based on mempool state
 * - Replace-by-Fee (RBF) for stuck transactions
 * - Fee bumping with accurate fee calculation
 * - Priority based on fee rate (satoshis/vbyte)
 * - Mempool management with fee-based eviction
 */
import { HybridTransaction } from '../utxo/hybrid-state-manager';
export interface FeeEstimate {
    targetBlocks: number;
    feeRate: bigint;
    confidence: number;
    estimatedFee: bigint;
}
export interface MempoolEntry {
    transaction: HybridTransaction;
    feeRate: bigint;
    absoluteFee: bigint;
    addedTime: number;
    modifiedTime: number;
    replacesTxid?: string;
    replacedByTxid?: string;
    priority: number;
}
export interface FeeHistory {
    blockHeight: number;
    feeRates: bigint[];
    transactionCount: number;
    medianFeeRate: bigint;
}
export declare class FeeMarket {
    private mempool;
    private feeHistory;
    private maxMempoolSize;
    private minRelayFeeRate;
    private blockHeight;
    private targetBlocks;
    /**
     * Estimate fee for a transaction to confirm in target blocks
     */
    estimateFee(targetBlocks: number, txSize: number): FeeEstimate;
    /**
     * Get historical fee rates for a target block confirmation
     */
    private getHistoricalFeeRates;
    /**
     * Get current mempool fee rate for target confirmation
     */
    private getCurrentMempoolFeeRate;
    /**
     * Calculate variance of fee rates
     */
    private calculateVariance;
    /**
     * Add transaction to mempool with fee calculation
     */
    addToMempool(tx: HybridTransaction): {
        success: boolean;
        error?: string;
    };
    /**
     * Replace-by-Fee (RBF) - replace a transaction with a higher fee version
     */
    replaceByFee(oldTxid: string, newTx: HybridTransaction): {
        success: boolean;
        error?: string;
    };
    /**
     * Fee bumping - increase fee for a stuck transaction
     */
    bumpFee(txid: string, bumpAmount: bigint): {
        success: boolean;
        newTx?: HybridTransaction;
        error?: string;
    };
    /**
     * Create a bumped version of a transaction with higher fee
     */
    private createBumpedTransaction;
    /**
     * Find transactions that depend on a given transaction
     */
    private findDependentTransactions;
    /**
     * Get UTXOs created by a transaction
     */
    private getCreatedUTXOs;
    /**
     * Evict lowest fee rate transactions when mempool is full
     */
    private evictLowFeeTransactions;
    /**
     * Calculate transaction size (similar to Bitcoin's vsize calculation)
     */
    private calculateTransactionSize;
    /**
     * Calculate varint size
     */
    private varintSize;
    /**
     * Calculate absolute fee from transaction
     */
    private calculateAbsoluteFee;
    /**
     * Calculate transaction priority for mining
     */
    private calculatePriority;
    /**
     * Calculate transaction ID
     */
    private calculateTxid;
    /**
     * Get transactions for block construction (sorted by fee rate)
     */
    getBlockTransactions(maxBytes: number): HybridTransaction[];
    /**
     * Update fee history after block confirmation
     */
    updateFeeHistory(blockTransactions: HybridTransaction[]): void;
    /**
     * Get mempool statistics
     */
    getMempoolStats(): {
        count: number;
        totalFee: bigint;
        medianFeeRate: bigint;
        minFeeRate: bigint;
        maxFeeRate: bigint;
    };
    /**
     * Set minimum relay fee rate
     */
    setMinRelayFeeRate(feeRate: bigint): void;
    /**
     * Set maximum mempool size
     */
    setMaxMempoolSize(size: number): void;
    /**
     * Remove transaction from mempool (when confirmed or evicted)
     */
    removeFromMempool(txid: string): boolean;
    /**
     * Get fee estimates for all standard target blocks
     */
    getFeeEstimates(txSize: number): FeeEstimate[];
    /**
     * Get smart fee recommendation
     */
    getSmartFee(targetBlocks: number, txSize: number): FeeEstimate;
}
