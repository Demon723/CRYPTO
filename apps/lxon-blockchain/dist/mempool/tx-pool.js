"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionPool = void 0;
class TransactionPool {
    pending = new Map();
    bySender = new Map();
    config;
    nonces = new Map();
    confirmedCount = 0;
    rejectedCount = 0;
    constructor(config = {}) {
        this.config = {
            maxPending: 10000,
            maxPerSender: 100,
            minFee: 1000n,
            expiryMs: 24 * 60 * 60 * 1000,
            ...config,
        };
    }
    addTransaction(tx, sender, fee) {
        if (this.pending.size >= this.config.maxPending) {
            return { accepted: false, reason: 'Pool full' };
        }
        if (fee < this.config.minFee) {
            return { accepted: false, reason: 'Fee too low' };
        }
        const senderEntry = this.bySender.get(sender);
        const senderCount = senderEntry ? senderEntry.size : 0;
        if (senderCount >= this.config.maxPerSender) {
            return { accepted: false, reason: 'Too many txs from sender' };
        }
        const nonce = this.nonces.get(sender) || 0;
        const txNonce = tx.nonce || nonce;
        if (txNonce < nonce) {
            return { accepted: false, reason: 'Nonce too low' };
        }
        const hash = this.computeHash(tx);
        if (this.pending.has(hash)) {
            return { accepted: false, reason: 'Duplicate transaction' };
        }
        const pendingTx = {
            hash,
            transaction: tx,
            sender,
            fee,
            nonce: tx.nonce || nonce,
            timestamp: Date.now(),
            status: 'pending',
            priority: Number(fee),
        };
        this.pending.set(hash, pendingTx);
        if (!this.bySender.has(sender)) {
            this.bySender.set(sender, new Set());
        }
        this.bySender.get(sender).add(hash);
        this.nonces.set(sender, nonce + 1);
        return { accepted: true };
    }
    removeTransaction(hash) {
        const tx = this.pending.get(hash);
        if (!tx)
            return false;
        this.pending.delete(hash);
        const senderMap = this.bySender.get(tx.sender);
        if (senderMap)
            senderMap.delete(hash);
        return true;
    }
    getPendingTransactions(limit = 100) {
        const sorted = Array.from(this.pending.values())
            .filter(tx => tx.status === 'pending')
            .sort((a, b) => b.priority - a.priority);
        return sorted.slice(0, limit);
    }
    getTransactionsBySender(sender) {
        const hashes = this.bySender.get(sender) || new Set();
        return Array.from(hashes)
            .map(hash => this.pending.get(hash))
            .filter(tx => tx && tx.status === 'pending');
    }
    confirmTransaction(hash) {
        const tx = this.pending.get(hash);
        if (!tx)
            return false;
        tx.status = 'confirmed';
        this.pending.delete(hash);
        const senderMap = this.bySender.get(tx.sender);
        if (senderMap)
            senderMap.delete(hash);
        this.confirmedCount++;
        return true;
    }
    rejectTransaction(hash, reason) {
        const tx = this.pending.get(hash);
        if (!tx)
            return false;
        tx.status = 'rejected';
        this.pending.delete(hash);
        const senderMap = this.bySender.get(tx.sender);
        if (senderMap)
            senderMap.delete(hash);
        this.rejectedCount++;
        return true;
    }
    cleanupExpired() {
        const now = Date.now();
        let removed = 0;
        for (const [hash, tx] of this.pending.entries()) {
            if (now - tx.timestamp > this.config.expiryMs) {
                this.removeTransaction(hash);
                removed++;
            }
        }
        return removed;
    }
    getStats() {
        return {
            pending: this.pending.size,
            confirmed: this.confirmedCount,
            rejected: this.rejectedCount,
        };
    }
    computeHash(tx) {
        const data = JSON.stringify(tx);
        return Buffer.from(data).toString('hex').slice(0, 64);
    }
}
exports.TransactionPool = TransactionPool;
