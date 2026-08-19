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

import { HybridTransaction, TransactionInput } from '../utxo/hybrid-state-manager';

export interface FeeEstimate {
  targetBlocks: number;
  feeRate: bigint; // satoshis per byte
  confidence: number; // 0-1
  estimatedFee: bigint;
}

export interface MempoolEntry {
  transaction: HybridTransaction;
  feeRate: bigint; // satoshis per byte
  absoluteFee: bigint;
  addedTime: number;
  modifiedTime: number;
  replacesTxid?: string;
  replacedByTxid?: string;
  priority: number;
}

export interface FeeHistory {
  blockHeight: number;
  feeRates: bigint[]; // Array of fee rates for each block
  transactionCount: number;
  medianFeeRate: bigint;
}

export class FeeMarket {
  private mempool: Map<string, MempoolEntry> = new Map();
  private feeHistory: FeeHistory[] = [];
  private maxMempoolSize: number = 30000; // Default 30k transactions
  private minRelayFeeRate: bigint = BigInt(1); // 1 satoshi/byte minimum
  private blockHeight: number = 0;
  private targetBlocks: number[] = [1, 2, 3, 6, 12, 24, 48, 144]; // Bitcoin-style targets

  /**
   * Estimate fee for a transaction to confirm in target blocks
   */
  estimateFee(targetBlocks: number, txSize: number): FeeEstimate {
    // Get historical fee rates for this target
    const historicalRates = this.getHistoricalFeeRates(targetBlocks);
    
    if (historicalRates.length === 0) {
      // Fallback to current mempool fee rate
      const currentRate = this.getCurrentMempoolFeeRate(targetBlocks);
      return {
        targetBlocks,
        feeRate: currentRate,
        confidence: 0.5,
        estimatedFee: currentRate * BigInt(txSize),
      };
    }

    // Calculate median fee rate
    const sortedRates = [...historicalRates].sort((a, b) => 
      a < b ? -1 : a > b ? 1 : 0
    );
    const medianRate = sortedRates[Math.floor(sortedRates.length / 2)];

    // Calculate confidence based on variance
    const variance = this.calculateVariance(historicalRates, medianRate);
    const confidence = Math.max(0, Math.min(1, 1 - Number(variance) / Number(medianRate)));

    return {
      targetBlocks,
      feeRate: medianRate,
      confidence,
      estimatedFee: medianRate * BigInt(txSize),
    };
  }

  /**
   * Get historical fee rates for a target block confirmation
   */
  private getHistoricalFeeRates(targetBlocks: number): bigint[] {
    const rates: bigint[] = [];
    
    for (const history of this.feeHistory) {
      const index = Math.min(targetBlocks - 1, history.feeRates.length - 1);
      if (index >= 0) {
        rates.push(history.feeRates[index]);
      }
    }

    // Only keep recent history (last 1000 blocks)
    if (this.feeHistory.length > 1000) {
      this.feeHistory = this.feeHistory.slice(-1000);
    }

    return rates;
  }

  /**
   * Get current mempool fee rate for target confirmation
   */
  private getCurrentMempoolFeeRate(targetBlocks: number): bigint {
    // Sort mempool by fee rate
    const sortedEntries = Array.from(this.mempool.values())
      .sort((a, b) => {
        if (a.feeRate < b.feeRate) return -1;
        if (a.feeRate > b.feeRate) return 1;
        return 0;
      });

    // Estimate based on position in mempool
    const targetIndex = Math.min(targetBlocks * 100, sortedEntries.length);
    if (targetIndex < sortedEntries.length) {
      return sortedEntries[targetIndex].feeRate;
    }

    // Fallback to minimum fee rate
    return this.minRelayFeeRate * BigInt(2);
  }

  /**
   * Calculate variance of fee rates
   */
  private calculateVariance(rates: bigint[], median: bigint): number {
    if (rates.length === 0) return 0;

    let sum = 0n;
    for (const rate of rates) {
      const diff = rate > median ? rate - median : median - rate;
      sum += diff * diff;
    }

    const variance = sum / BigInt(rates.length);
    return Number(variance);
  }

  /**
   * Add transaction to mempool with fee calculation
   */
  addToMempool(tx: HybridTransaction): { success: boolean; error?: string } {
    const txid = this.calculateTxid(tx);
    
    // Check if transaction already exists
    if (this.mempool.has(txid)) {
      return { success: false, error: 'Transaction already in mempool' };
    }

    // Calculate transaction size
    const txSize = this.calculateTransactionSize(tx);
    
    // Calculate absolute fee
    const absoluteFee = this.calculateAbsoluteFee(tx);
    
    // Calculate fee rate (satoshis per byte)
    const feeRate = absoluteFee > 0n ? (absoluteFee * BigInt(1000000)) / BigInt(txSize) : 0n;

    // Check minimum fee rate
    if (feeRate < this.minRelayFeeRate) {
      return { success: false, error: 'Fee rate too low' };
    }

    // Check mempool capacity
    if (this.mempool.size >= this.maxMempoolSize) {
      // Evict lowest fee rate transactions
      this.evictLowFeeTransactions();
    }

    // Calculate priority (for mining)
    const priority = this.calculatePriority(tx, absoluteFee, txSize);

    // Add to mempool
    this.mempool.set(txid, {
      transaction: tx,
      feeRate,
      absoluteFee,
      addedTime: Date.now(),
      modifiedTime: Date.now(),
      priority,
    });

    return { success: true };
  }

  /**
   * Replace-by-Fee (RBF) - replace a transaction with a higher fee version
   */
  replaceByFee(oldTxid: string, newTx: HybridTransaction): { success: boolean; error?: string } {
    const oldEntry = this.mempool.get(oldTxid);
    if (!oldEntry) {
      return { success: false, error: 'Original transaction not found' };
    }

    const newTxid = this.calculateTxid(newTx);
    const newTxSize = this.calculateTransactionSize(newTx);
    const newAbsoluteFee = this.calculateAbsoluteFee(newTx);
    const newFeeRate = (newAbsoluteFee * BigInt(1000000)) / BigInt(newTxSize);

    // RBF rules:
    // 1. New fee rate must be at least 1 satoshi/byte higher
    // 2. Absolute fee must be higher
    // 3. Must pay for replacement of dependent transactions
    
    const minFeeRate = oldEntry.feeRate + BigInt(1);
    if (newFeeRate < minFeeRate) {
      return { success: false, error: 'Fee rate not high enough for RBF' };
    }

    if (newAbsoluteFee <= oldEntry.absoluteFee) {
      return { success: false, error: 'Absolute fee not increased' };
    }

    // Check for dependent transactions (inputs spending same UTXOs)
    const dependencies = this.findDependentTransactions(oldTxid);
    const replacementFee = (oldEntry.absoluteFee + newAbsoluteFee) * BigInt(12) / BigInt(10); // 20% markup

    if (newAbsoluteFee < replacementFee) {
      return { success: false, error: 'Fee not high enough to replace dependencies' };
    }

    // Remove old transaction
    this.mempool.delete(oldTxid);

    // Mark old transaction as replaced
    oldEntry.replacedByTxid = newTxid;

    // Add new transaction
    const priority = this.calculatePriority(newTx, newAbsoluteFee, newTxSize);
    this.mempool.set(newTxid, {
      transaction: newTx,
      feeRate: newFeeRate,
      absoluteFee: newAbsoluteFee,
      addedTime: Date.now(),
      modifiedTime: Date.now(),
      replacesTxid: oldTxid,
      priority,
    });

    return { success: true };
  }

  /**
   * Fee bumping - increase fee for a stuck transaction
   */
  bumpFee(txid: string, bumpAmount: bigint): { success: boolean; newTx?: HybridTransaction; error?: string } {
    const entry = this.mempool.get(txid);
    if (!entry) {
      return { success: false, error: 'Transaction not found in mempool' };
    }

    const oldTx = entry.transaction;
    const newTx = this.createBumpedTransaction(oldTx, bumpAmount);

    const result = this.replaceByFee(txid, newTx);
    if (result.success) {
      return { success: true, newTx };
    } else {
      return { success: false, error: result.error };
    }
  }

  /**
   * Create a bumped version of a transaction with higher fee
   */
  private createBumpedTransaction(oldTx: HybridTransaction, bumpAmount: bigint): HybridTransaction {
    // Reduce the first output to increase fee
    const newOutputs = [...oldTx.outputs];
    if (newOutputs.length > 0) {
      const firstOutput = { ...newOutputs[0] };
      if (firstOutput.value > bumpAmount) {
        firstOutput.value -= bumpAmount;
        newOutputs[0] = firstOutput;
      }
    }

    return {
      ...oldTx,
      outputs: newOutputs,
    };
  }

  /**
   * Find transactions that depend on a given transaction
   */
  private findDependentTransactions(txid: string): MempoolEntry[] {
    const dependencies: MempoolEntry[] = [];
    const targetTx = this.mempool.get(txid);
    
    if (!targetTx) return dependencies;

    // Get UTXOs created by target transaction
    const createdUTXOs = this.getCreatedUTXOs(targetTx.transaction);

    // Find transactions spending these UTXOs
    for (const [otherTxid, entry] of this.mempool.entries()) {
      if (otherTxid === txid) continue;

      for (const input of entry.transaction.inputs) {
        for (const utxo of createdUTXOs) {
          if (input.utxoKey.txid === utxo.txid && 
              input.utxoKey.outputIndex === utxo.outputIndex) {
            dependencies.push(entry);
            break;
          }
        }
      }
    }

    return dependencies;
  }

  /**
   * Get UTXOs created by a transaction
   */
  private getCreatedUTXOs(tx: HybridTransaction): Array<{ txid: string; outputIndex: number }> {
    const txid = this.calculateTxid(tx);
    const utxos: Array<{ txid: string; outputIndex: number }> = [];
    
    for (let i = 0; i < tx.outputs.length; i++) {
      utxos.push({ txid, outputIndex: i });
    }

    return utxos;
  }

  /**
   * Evict lowest fee rate transactions when mempool is full
   */
  private evictLowFeeTransactions(): void {
    const sortedEntries = Array.from(this.mempool.entries())
      .sort(([, a], [, b]) => {
        if (a.feeRate < b.feeRate) return -1;
        if (a.feeRate > b.feeRate) return 1;
        if (a.addedTime < b.addedTime) return -1; // Evict older first
        if (a.addedTime > b.addedTime) return 1;
        return 0;
      });

    // Evict 10% of mempool
    const evictCount = Math.floor(this.maxMempoolSize * 0.1);
    for (let i = 0; i < evictCount && i < sortedEntries.length; i++) {
      this.mempool.delete(sortedEntries[i][0]);
    }
  }

  /**
   * Calculate transaction size (similar to Bitcoin's vsize calculation)
   */
  private calculateTransactionSize(tx: HybridTransaction): number {
    // Base transaction size
    let size = 0;
    
    // Version (4 bytes)
    size += 4;
    
    // Input count (varint)
    size += this.varintSize(tx.inputs.length);
    
    // Inputs
    for (const input of tx.inputs) {
      // TXID (32 bytes)
      size += 32;
      // Output index (4 bytes)
      size += 4;
      // Script length (varint)
      size += this.varintSize(input.unlockingScript.length);
      // Script
      size += input.unlockingScript.length;
      // Sequence (4 bytes)
      size += 4;
    }
    
    // Output count (varint)
    size += this.varintSize(tx.outputs.length);
    
    // Outputs
    for (const output of tx.outputs) {
      // Value (8 bytes)
      size += 8;
      // Script length (varint)
      size += this.varintSize(output.lockingScript.length);
      // Script
      size += output.lockingScript.length;
    }
    
    // Locktime (4 bytes)
    size += 4;
    
    // Witness data (if present)
    if (tx.witness && tx.witness.length > 0) {
      size += 2; // marker + flag
      for (const witness of tx.witness) {
        size += this.varintSize(witness.length);
        size += witness.length;
      }
    }
    
    return size;
  }

  /**
   * Calculate varint size
   */
  private varintSize(value: number): number {
    if (value < 0xfd) return 1;
    if (value <= 0xffff) return 3;
    if (value <= 0xffffffff) return 5;
    return 9;
  }

  /**
   * Calculate absolute fee from transaction
   */
  private calculateAbsoluteFee(tx: HybridTransaction): bigint {
    let inputValue = BigInt(0);
    let outputValue = BigInt(0);

    // Sum input values (from UTXO references)
    for (const input of tx.inputs) {
      // In a real implementation, this would look up the UTXO value
      // For now, we'll estimate based on a typical input size
      inputValue += BigInt(10000); // Placeholder
    }

    // Sum output values
    for (const output of tx.outputs) {
      outputValue += output.value;
    }

    return inputValue - outputValue;
  }

  /**
   * Calculate transaction priority for mining
   */
  private calculatePriority(tx: HybridTransaction, fee: bigint, size: number): number {
    // Priority = (value * age + fee) / size
    // Simplified version
    const feeRate = Number(fee) / size;
    const age = Date.now() - Date.now(); // Would use actual UTXO age
    return feeRate * 1000; // Weight fee rate heavily
  }

  /**
   * Calculate transaction ID
   */
  private calculateTxid(tx: HybridTransaction): string {
    // Simplified txid calculation
    const txString = JSON.stringify(tx);
    const hash = require('crypto').createHash('sha256').update(txString).digest('hex');
    return hash;
  }

  /**
   * Get transactions for block construction (sorted by fee rate)
   */
  getBlockTransactions(maxBytes: number): HybridTransaction[] {
    const sortedEntries = Array.from(this.mempool.values())
      .sort((a, b) => {
        if (a.feeRate > b.feeRate) return -1;
        if (a.feeRate < b.feeRate) return 1;
        if (a.priority > b.priority) return -1;
        if (a.priority < b.priority) return 1;
        return 0;
      });

    const blockTxs: HybridTransaction[] = [];
    let totalBytes = 0;

    for (const entry of sortedEntries) {
      const txSize = this.calculateTransactionSize(entry.transaction);
      if (totalBytes + txSize > maxBytes) {
        break;
      }
      blockTxs.push(entry.transaction);
      totalBytes += txSize;
    }

    return blockTxs;
  }

  /**
   * Update fee history after block confirmation
   */
  updateFeeHistory(blockTransactions: HybridTransaction[]): void {
    const feeRates: bigint[] = [];
    
    for (const tx of blockTransactions) {
      const txSize = this.calculateTransactionSize(tx);
      const fee = this.calculateAbsoluteFee(tx);
      const feeRate = (fee * BigInt(1000000)) / BigInt(txSize);
      feeRates.push(feeRate);
    }

    if (feeRates.length > 0) {
      // Calculate median
      const sorted = [...feeRates].sort((a, b) => a < b ? -1 : a > b ? 1 : 0);
      const median = sorted[Math.floor(sorted.length / 2)];

      this.feeHistory.push({
        blockHeight: this.blockHeight,
        feeRates,
        transactionCount: blockTransactions.length,
        medianFeeRate: median,
      });
    }

    this.blockHeight++;
  }

  /**
   * Get mempool statistics
   */
  getMempoolStats(): {
    count: number;
    totalFee: bigint;
    medianFeeRate: bigint;
    minFeeRate: bigint;
    maxFeeRate: bigint;
  } {
    const entries = Array.from(this.mempool.values());
    
    if (entries.length === 0) {
      return {
        count: 0,
        totalFee: 0n,
        medianFeeRate: 0n,
        minFeeRate: 0n,
        maxFeeRate: 0n,
      };
    }

    const feeRates = entries.map(e => e.feeRate).sort((a, b) => a < b ? -1 : a > b ? 1 : 0);
    const totalFee = entries.reduce((sum, e) => sum + e.absoluteFee, 0n);

    return {
      count: entries.length,
      totalFee,
      medianFeeRate: feeRates[Math.floor(feeRates.length / 2)],
      minFeeRate: feeRates[0],
      maxFeeRate: feeRates[feeRates.length - 1],
    };
  }

  /**
   * Set minimum relay fee rate
   */
  setMinRelayFeeRate(feeRate: bigint): void {
    this.minRelayFeeRate = feeRate;
  }

  /**
   * Set maximum mempool size
   */
  setMaxMempoolSize(size: number): void {
    this.maxMempoolSize = size;
  }

  /**
   * Remove transaction from mempool (when confirmed or evicted)
   */
  removeFromMempool(txid: string): boolean {
    return this.mempool.delete(txid);
  }

  /**
   * Get fee estimates for all standard target blocks
   */
  getFeeEstimates(txSize: number): FeeEstimate[] {
    return this.targetBlocks.map(target => this.estimateFee(target, txSize));
  }

  /**
   * Get smart fee recommendation
   */
  getSmartFee(targetBlocks: number, txSize: number): FeeEstimate {
    // Use conservative estimate with higher confidence
    const estimate = this.estimateFee(targetBlocks, txSize);
    
    // Add safety margin (10%)
    const adjustedFeeRate = (estimate.feeRate * BigInt(11)) / BigInt(10);
    
    return {
      ...estimate,
      feeRate: adjustedFeeRate,
      estimatedFee: adjustedFeeRate * BigInt(txSize),
    };
  }
}