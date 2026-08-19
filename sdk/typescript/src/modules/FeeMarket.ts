/**
 * Fee Market Module
 * 
 * Bitcoin-style fee estimation with RBF and dynamic adjustment
 */

export class FeeMarket {
  private transactions: Map<string, any>;

  constructor() {
    this.transactions = new Map();
  }

  estimateFee(mempoolSize: number, targetConfirmations: number): bigint {
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

  addTransaction(txId: string, fee: bigint): void {
    this.transactions.set(txId, {
      txId,
      fee,
      timestamp: Date.now()
    });
  }

  canReplaceByFee(txId: string, newFee: bigint): boolean {
    const tx = this.transactions.get(txId);
    if (!tx) return false;
    
    // Require at least 25% fee increase
    const minIncrease = (tx.fee * 125n) / 100n;
    return newFee >= minIncrease;
  }

  executeReplaceByFee(txId: string, newTxId: string, newFee: bigint): void {
    if (this.canReplaceByFee(txId, newFee)) {
      this.transactions.delete(txId);
      this.addTransaction(newTxId, newFee);
    }
  }

  calculateMinimumFeeBump(currentFee: bigint): bigint {
    return (currentFee * 125n) / 100n;
  }

  bumpFee(txId: string, newFee: bigint): void {
    const tx = this.transactions.get(txId);
    if (tx) {
      tx.fee = newFee;
    }
  }

  updateNetworkConditions(mempoolSize: number, blockSize: number): void {
    // Update internal state based on network conditions
    // Would be used for dynamic fee adjustment
  }

  getDynamicFee(baseFee: bigint): bigint {
    // Calculate dynamic fee based on current network conditions
    const congestion = this.getCongestionLevel();
    return baseFee * BigInt(congestion);
  }

  getTransaction(txId: string): any {
    return this.transactions.get(txId);
  }

  getPrioritizedTransactions(count: number): any[] {
    const allTxs = Array.from(this.transactions.values());
    return allTxs
      .sort((a, b) => Number(b.fee - a.fee))
      .slice(0, count);
  }

  removeTransaction(txId: string): void {
    this.transactions.delete(txId);
  }

  private getCongestionLevel(): number {
    // Simplified congestion calculation
    return 1;
  }
}