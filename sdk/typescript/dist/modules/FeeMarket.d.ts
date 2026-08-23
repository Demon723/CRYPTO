/**
 * Fee Market Module
 *
 * Bitcoin-style fee estimation with RBF and dynamic adjustment
 */
export declare class FeeMarket {
    private transactions;
    constructor();
    estimateFee(mempoolSize: number, targetConfirmations: number): bigint;
    addTransaction(txId: string, fee: bigint): void;
    canReplaceByFee(txId: string, newFee: bigint): boolean;
    executeReplaceByFee(txId: string, newTxId: string, newFee: bigint): void;
    calculateMinimumFeeBump(currentFee: bigint): bigint;
    bumpFee(txId: string, newFee: bigint): void;
    updateNetworkConditions(mempoolSize: number, blockSize: number): void;
    getDynamicFee(baseFee: bigint): bigint;
    getTransaction(txId: string): any;
    getPrioritizedTransactions(count: number): any[];
    removeTransaction(txId: string): void;
    private getCongestionLevel;
}
//# sourceMappingURL=FeeMarket.d.ts.map