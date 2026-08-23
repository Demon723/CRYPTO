"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnthemiusBlockBuilder = void 0;
exports.balanceBlock = balanceBlock;
class AnthemiusBlockBuilder {
    maxBlockGas;
    maxBlockSize;
    stateKeyFrequency = new Map();
    constructor(maxBlockGas = 30_000_000, maxBlockSize = 4_000_000) {
        this.maxBlockGas = maxBlockGas;
        this.maxBlockSize = maxBlockSize;
    }
    assembleBlock(transactions) {
        const scored = transactions.map(tx => ({
            tx,
            score: this.computeMultiDimensionalScore(tx),
        }));
        scored.sort((a, b) => b.score - a.score);
        const selected = [];
        let totalGas = 0;
        let totalSize = 0;
        const usedKeys = new Set();
        let overlapCount = 0;
        for (const { tx } of scored) {
            if (totalGas + tx.gasComplexity > this.maxBlockGas)
                continue;
            if (totalSize + tx.sizeBytes > this.maxBlockSize)
                continue;
            const conflicts = tx.stateKeys.filter(k => usedKeys.has(k)).length;
            if (conflicts > 0 && selected.length > 0) {
                overlapCount += conflicts;
            }
            selected.push(tx);
            totalGas += tx.gasComplexity;
            totalSize += tx.sizeBytes;
            for (const key of tx.stateKeys) {
                usedKeys.add(key);
                this.stateKeyFrequency.set(key, (this.stateKeyFrequency.get(key) || 0) + 1);
            }
        }
        const parallelizability = this.computeParallelizability(selected);
        const metrics = {
            totalGas,
            stateOverlapScore: overlapCount,
            parallelizability,
            estimatedThroughput: Math.floor(selected.length * parallelizability * 1000),
        };
        return { block: selected, metrics };
    }
    computeMultiDimensionalScore(tx) {
        const gasScore = 1 - Math.min(tx.gasComplexity / this.maxBlockGas, 1);
        const overlapPenalty = tx.stateKeys.length * 0.1;
        const priorityBoost = Number(tx.priorityFee) / 1e10;
        return gasScore * 0.4 + (1 - overlapPenalty) * 0.4 + priorityBoost * 0.2;
    }
    computeParallelizability(txs) {
        if (txs.length === 0)
            return 1;
        const allKeys = new Set();
        const keyTxCount = new Map();
        for (const tx of txs) {
            for (const key of tx.stateKeys) {
                allKeys.add(key);
                keyTxCount.set(key, (keyTxCount.get(key) || 0) + 1);
            }
        }
        let conflictSum = 0;
        for (const count of keyTxCount.values()) {
            if (count > 1)
                conflictSum += count - 1;
        }
        const totalKeys = allKeys.size || 1;
        const contention = conflictSum / totalKeys;
        return Math.max(0.1, 1 - contention);
    }
    getHotStateKeys(limit = 10) {
        return Array.from(this.stateKeyFrequency.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([key, count]) => ({ key, count }));
    }
    reset() {
        this.stateKeyFrequency.clear();
    }
}
exports.AnthemiusBlockBuilder = AnthemiusBlockBuilder;
function balanceBlock(transactions, targetGas, targetParallelism) {
    const builder = new AnthemiusBlockBuilder(targetGas);
    const result = builder.assembleBlock(transactions);
    return result.block;
}
