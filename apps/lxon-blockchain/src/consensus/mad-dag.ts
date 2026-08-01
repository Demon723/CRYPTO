export interface MaddagRules {
  maxBlockGas: bigint;
  minGasPrice: bigint;
  maxTxPerBlock: number;
  priorityFeeCap: bigint;
  blobFeeCap: bigint;
  maxBlobPerBlock: number;
}

export interface MEVProtection {
  isMEVDetected: boolean;
  detectedPatterns: MEVPattern[];
  recommendedAction: string;
  confidence: number;
}

export interface MEVPattern {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedTransactions: string[];
  detectedAt: number;
}

export interface TransactionSignature {
  txHash: string;
  sender: string;
  nonce: number;
  gasPrice: bigint;
  gasLimit: bigint;
  value: bigint;
  to: string;
  data: Buffer;
  timestamp: number;
  priorityFee: bigint;
}

export class MEVResistantMempool {
  private pendingTransactions: TransactionSignature[] = [];
  private mevPatterns: MEVPattern[] = [];
  private seenTransactions: Set<string> = new Set();
  private commitRevealEnabled: boolean = true;

  constructor(public rules: MaddagRules) {}

  submitTransaction(tx: TransactionSignature): { accepted: boolean; reason: string } {
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

  private _checkMEVPatterns(tx: TransactionSignature): MEVProtection {
    const patterns: MEVPattern[] = [];

    const frontRunPattern = this.pendingTransactions.filter(
      pending =>
        pending.to === tx.to &&
        pending.nonce === tx.nonce &&
        pending.gasPrice < tx.gasPrice &&
        Math.abs(pending.timestamp - tx.timestamp) < 1000,
    );

    if (frontRunPattern.length > 0) {
      patterns.push({
        type: 'front_run',
        severity: 'high',
        description: 'Potential front-running detected: transaction with higher gas price targeting same address and nonce',
        affectedTransactions: frontRunPattern.map(p => p.txHash),
        detectedAt: Date.now(),
      });
    }

    const sandwichPattern = this.pendingTransactions.filter(
      pending =>
        pending.sender !== tx.sender &&
        pending.to === tx.to &&
        Math.abs(pending.timestamp - tx.timestamp) < 5000,
    );

    if (sandwichPattern.length >= 2) {
      patterns.push({
        type: 'sandwich_attack',
        severity: 'critical',
        description: 'Potential sandwich attack: multiple transactions targeting same address in short time window',
        affectedTransactions: sandwichPattern.map(p => p.txHash),
        detectedAt: Date.now(),
      });
    }

    const backRunPattern = this.pendingTransactions.filter(
      pending =>
        pending.to === tx.to &&
        pending.timestamp > tx.timestamp &&
        pending.gasPrice > tx.gasPrice,
    );

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

  getMEVProtection(): MEVProtection {
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

  getPendingTransactions(): TransactionSignature[] {
    return [...this.pendingTransactions];
  }

  clearPending(): void {
    this.pendingTransactions = [];
  }

  enableCommitReveal(enabled: boolean): void {
    this.commitRevealEnabled = enabled;
  }
}

export function applyMEVProtection(
  tx: TransactionSignature,
  mempool: MEVResistantMempool,
): { protected: boolean; reason: string } {
  const result = mempool.submitTransaction(tx);
  return {
    protected: !result.accepted,
    reason: result.reason,
  };
}