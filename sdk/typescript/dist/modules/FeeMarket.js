"use strict";
/**
 * Fee Market Module
 *
 * Bitcoin-style fee estimation with RBF and dynamic adjustment
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeeMarket = void 0;
class FeeMarket {
    constructor() {
        this.transactions = new Map();
    }
    estimateFee(mempoolSize, targetConfirmations) {
        // Base fee calculation
        const baseFee = 100n;
        // Adjust for mempool congestion
        const congestionMultiplier = BigInt(Math.min(mempoolSize / 1000, 10));
        // Adjust for confirmation target
        const targetMultiplier = BigInt(Math.max(6 / targetConfirmations, 1));
        const estimatedFee = baseFee * congestionMultiplier * targetMultiplier;
        // Cap at maximum fee
        const maxFee = 1000n;
        return estimatedFee > maxFee ? maxFee : estimatedFee;
    }
    addTransaction(txId, fee) {
        this.transactions.set(txId, {
            txId,
            fee,
            timestamp: Date.now()
        });
    }
    canReplaceByFee(txId, newFee) {
        const tx = this.transactions.get(txId);
        if (!tx)
            return false;
        // Require at least 25% fee increase
        const minIncrease = (tx.fee * 125n) / 100n;
        return newFee >= minIncrease;
    }
    executeReplaceByFee(txId, newTxId, newFee) {
        if (this.canReplaceByFee(txId, newFee)) {
            this.transactions.delete(txId);
            this.addTransaction(newTxId, newFee);
        }
    }
    calculateMinimumFeeBump(currentFee) {
        return (currentFee * 125n) / 100n;
    }
    bumpFee(txId, newFee) {
        const tx = this.transactions.get(txId);
        if (tx) {
            tx.fee = newFee;
        }
    }
    updateNetworkConditions(mempoolSize, blockSize) {
        // Update internal state based on network conditions
        // Would be used for dynamic fee adjustment
    }
    getDynamicFee(baseFee) {
        // Calculate dynamic fee based on current network conditions
        const congestion = this.getCongestionLevel();
        return baseFee * BigInt(congestion);
    }
    getTransaction(txId) {
        return this.transactions.get(txId);
    }
    getPrioritizedTransactions(count) {
        const allTxs = Array.from(this.transactions.values());
        return allTxs
            .sort((a, b) => Number(b.fee - a.fee))
            .slice(0, count);
    }
    removeTransaction(txId) {
        this.transactions.delete(txId);
    }
    getCongestionLevel() {
        // Simplified congestion calculation
        return 1;
    }
}
exports.FeeMarket = FeeMarket;
//# sourceMappingURL=FeeMarket.js.map