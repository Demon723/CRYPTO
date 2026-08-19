"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MEVResistantMempool = void 0;
exports.applyMEVProtection = applyMEVProtection;
class MEVResistantMempool {
    rules;
    pendingTransactions = [];
    mevPatterns = [];
    seenTransactions = new Set();
    commitRevealEnabled = true;
    constructor(rules) {
        this.rules = rules;
    }
    submitTransaction(tx) {
        if (this.seenTransactions.has(tx.txHash)) {
            return { accepted: false, reason: 'Duplicate transaction detected' };
        }
        if (tx.gasPrice < this.rules.minGasPrice) {
            return { accepted: false, reason: 'Gas price below minimum threshold' };
        }
        if (tx.priorityFee > this.rules.priorityFeeCap) {
            return { accepted: false, reason: 'Priority fee exceeds cap' };
        }
        if (this.pendingTransactions.length >= this.rules.maxTxPerBlock) {
            return { accepted: false, reason: 'Block transaction limit reached' };
        }
        const mevCheck = this._checkMEVPatterns(tx);
        if (mevCheck.isMEVDetected && mevCheck.confidence > 0.8) {
            return { accepted: false, reason: `MEV pattern detected: ${mevCheck.recommendedAction}` };
        }
        this.pendingTransactions.push(tx);
        this.seenTransactions.add(tx.txHash);
        return { accepted: true, reason: 'Transaction accepted' };
    }
    _checkMEVPatterns(tx) {
        const patterns = [];
        const frontRunPattern = this.pendingTransactions.filter(pending => pending.to === tx.to &&
            pending.nonce === tx.nonce &&
            pending.gasPrice < tx.gasPrice &&
            Math.abs(pending.timestamp - tx.timestamp) < 1000);
        if (frontRunPattern.length > 0) {
            patterns.push({
                type: 'front_run',
                severity: 'high',
                description: 'Potential front-running detected: transaction with higher gas price targeting same address and nonce',
                affectedTransactions: frontRunPattern.map(p => p.txHash),
                detectedAt: Date.now(),
            });
        }
        const sandwichPattern = this.pendingTransactions.filter(pending => pending.sender !== tx.sender &&
            pending.to === tx.to &&
            Math.abs(pending.timestamp - tx.timestamp) < 5000);
        if (sandwichPattern.length >= 2) {
            patterns.push({
                type: 'sandwich_attack',
                severity: 'critical',
                description: 'Potential sandwich attack: multiple transactions targeting same address in short time window',
                affectedTransactions: sandwichPattern.map(p => p.txHash),
                detectedAt: Date.now(),
            });
        }
        const backRunPattern = this.pendingTransactions.filter(pending => pending.to === tx.to &&
            pending.timestamp > tx.timestamp &&
            pending.gasPrice > tx.gasPrice);
        if (backRunPattern.length > 0) {
            patterns.push({
                type: 'back_run',
                severity: 'medium',
                description: 'Potential back-running detected: subsequent transaction with higher gas price',
                affectedTransactions: backRunPattern.map(p => p.txHash),
                detectedAt: Date.now(),
            });
        }
        const isMEVDetected = patterns.some(p => p.severity === 'critical' || p.severity === 'high');
        const avgSeverity = patterns.length > 0
            ? patterns.reduce((sum, p) => sum + (p.severity === 'critical' ? 4 : p.severity === 'high' ? 3 : p.severity === 'medium' ? 2 : 1), 0) / patterns.length
            : 0;
        return {
            isMEVDetected,
            detectedPatterns: patterns,
            recommendedAction: isMEVDetected ? 'REJECT: MEV pattern detected' : 'OK: No MEV patterns detected',
            confidence: Math.min(avgSeverity / 4, 1),
        };
    }
    getMEVProtection() {
        const allPatterns = this.mevPatterns;
        const isMEVDetected = allPatterns.some(p => p.severity === 'critical' || p.severity === 'high');
        return {
            isMEVDetected,
            detectedPatterns: allPatterns,
            recommendedAction: isMEVDetected ? 'Block contains MEV patterns - review recommended' : 'No MEV patterns detected',
            confidence: allPatterns.length > 0
                ? Math.min(allPatterns.reduce((sum, p) => sum + (p.severity === 'critical' ? 4 : p.severity === 'high' ? 3 : p.severity === 'medium' ? 2 : 1), 0) / (allPatterns.length * 4), 1)
                : 0,
        };
    }
    getPendingTransactions() {
        return [...this.pendingTransactions];
    }
    clearPending() {
        this.pendingTransactions = [];
    }
    enableCommitReveal(enabled) {
        this.commitRevealEnabled = enabled;
    }
}
exports.MEVResistantMempool = MEVResistantMempool;
function applyMEVProtection(tx, mempool) {
    const result = mempool.submitTransaction(tx);
    return {
        protected: !result.accepted,
        reason: result.reason,
    };
}
