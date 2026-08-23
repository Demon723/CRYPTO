"use strict";
/**
 * UTXO Module
 *
 * Bitcoin-style UTXO management with hybrid state model support
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HybridStateManager = void 0;
class HybridStateManager {
    constructor() {
        this.utxos = new Map();
        this.checkpoints = [];
    }
    createUTXO(txId, outputIndex, amount, owner) {
        const utxo = {
            txId,
            outputIndex,
            amount,
            owner,
            spent: false
        };
        this.utxos.set(`${txId}:${outputIndex}`, utxo);
        return utxo;
    }
    spendUTXO(txId, outputIndex) {
        const key = `${txId}:${outputIndex}`;
        const utxo = this.utxos.get(key);
        if (utxo) {
            utxo.spent = true;
        }
    }
    getUTXO(txId, outputIndex) {
        return this.utxos.get(`${txId}:${outputIndex}`);
    }
    getAccountBalance(address) {
        let balance = 0n;
        for (const utxo of this.utxos.values()) {
            if (utxo.owner === address && !utxo.spent) {
                balance += utxo.amount;
            }
        }
        return balance;
    }
    createCheckpoint() {
        const utxoCopy = new Map(Array.from(this.utxos.entries()).map(([key, utxo]) => [
            key,
            { ...utxo }
        ]));
        const checkpoint = {
            timestamp: Date.now(),
            utxos: utxoCopy
        };
        this.checkpoints.push(checkpoint);
        return checkpoint;
    }
    revertToCheckpoint(checkpoint) {
        this.utxos = new Map(checkpoint.utxos);
    }
    getUTXOCount() {
        return this.utxos.size;
    }
}
exports.HybridStateManager = HybridStateManager;
//# sourceMappingURL=UTXO.js.map