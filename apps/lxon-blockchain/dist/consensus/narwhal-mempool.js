"use strict";
/**
 * Narwhal DAG Mempool for LXON Blockchain
 *
 * Separates transaction dissemination from ordering using a DAG-based
 * mempool protocol. Achieves high-throughput reliable dissemination
 * and storage of causal histories of transactions.
 *
 * Based on: Narwhal and Tusk (arXiv:2105.11827)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NarwhalMempool = void 0;
class NarwhalMempool {
    dag = new Map();
    pendingTransactions = [];
    batchCertificates = new Map();
    validators;
    currentRound = 0;
    constructor(validatorAddresses, totalStake) {
        const validatorCount = validatorAddresses.length;
        const byzantineThreshold = Math.floor((validatorCount - 1) / 3);
        this.validators = {
            validators: new Map(validatorAddresses.map((addr) => [addr, totalStake / BigInt(validatorCount)])),
            byzantineThreshold,
        };
    }
    submitTransaction(tx) {
        this.pendingTransactions.push(tx);
    }
    formBatch(round, author) {
        const batchTxs = this.pendingTransactions.splice(0, 100);
        if (batchTxs.length === 0) {
            return { batchHash: '', transactions: [] };
        }
        const batchHash = this.computeBatchHash(batchTxs, round, author);
        const vertex = {
            hash: batchHash,
            transaction: batchTxs[0],
            parents: this.getActiveParentHashes(),
            round,
            author,
            timestamp: Date.now(),
        };
        this.dag.set(batchHash, vertex);
        return { batchHash, transactions: batchTxs };
    }
    verifyBatchCertificate(cert) {
        const requiredQuorum = 2 * this.validators.byzantineThreshold + 1;
        if (cert.signatures.length < requiredQuorum) {
            return false;
        }
        const uniqueSigners = new Set(cert.signatures.map((s) => s.validatorId));
        if (uniqueSigners.size < requiredQuorum) {
            return false;
        }
        for (const signer of uniqueSigners) {
            if (!this.validators.validators.has(signer)) {
                return false;
            }
        }
        return true;
    }
    getActiveParentHashes() {
        const recentHashes = Array.from(this.dag.keys()).slice(-10);
        return recentHashes.length > 0 ? recentHashes : [];
    }
    computeBatchHash(transactions, round, author) {
        const data = transactions
            .map((tx) => `${tx.id}${tx.sender}${tx.recipient}${tx.value}${tx.nonce}`)
            .join('');
        const input = `${data}${round}${author}${Date.now()}`;
        let hash = 0;
        for (let i = 0; i < input.length; i++) {
            const char = input.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash |= 0;
        }
        return `0x${Math.abs(hash).toString(16).padStart(64, '0')}`;
    }
    getDAGState() {
        return {
            vertices: Array.from(this.dag.values()),
            pendingCount: this.pendingTransactions.length,
            currentRound: this.currentRound,
            validatorCount: this.validators.validators.size,
        };
    }
    advanceRound(author) {
        this.currentRound++;
        return this.formBatch(this.currentRound, author);
    }
}
exports.NarwhalMempool = NarwhalMempool;
