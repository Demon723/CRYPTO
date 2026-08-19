import { describe, it, expect, beforeEach } from '@jest/globals';
import { FeeMarket } from '../../src/fee/fee-market';

describe('FeeMarket', () => {
  let feeMarket: FeeMarket;

  beforeEach(() => {
    feeMarket = new FeeMarket();
  });

  describe('Bitcoin-Style Fee Estimation', () => {
    it('should estimate fee based on mempool congestion', () => {
      const mempoolSize = 1000;
      const targetConfirmations = 6;
      
      const feeEstimate = feeMarket.estimateFee(mempoolSize, targetConfirmations);
      
      expect(feeEstimate).toBeGreaterThan(0);
      expect(feeEstimate).toBeLessThan(1000); // Max fee cap
    });

    it('should increase fee with higher mempool congestion', () => {
      const targetConfirmations = 6;
      
      const lowCongestionFee = feeMarket.estimateFee(100, targetConfirmations);
      const highCongestionFee = feeMarket.estimateFee(10000, targetConfirmations);
      
      expect(highCongestionFee).toBeGreaterThan(lowCongestionFee);
    });

    it('should decrease fee with longer confirmation targets', () => {
      const mempoolSize = 1000;
      
      const fastFee = feeMarket.estimateFee(mempoolSize, 1);
      const slowFee = feeMarket.estimateFee(mempoolSize, 10);
      
      expect(fastFee).toBeGreaterThan(slowFee);
    });
  });

  describe('RBF (Replace-By-Fee)', () => {
    it('should allow RBF transaction with higher fee', () => {
      const txId = '0x123...';
      const originalFee = 100n;
      const replacementFee = 150n;
      
      feeMarket.addTransaction(txId, originalFee);
      const canReplace = feeMarket.canReplaceByFee(txId, replacementFee);
      
      expect(canReplace).toBe(true);
    });

    it('should reject RBF with insufficient fee increase', () => {
      const txId = '0x123...';
      const originalFee = 100n;
      const replacementFee = 110n; // Only 10% increase
      
      feeMarket.addTransaction(txId, originalFee);
      const canReplace = feeMarket.canReplaceByFee(txId, replacementFee);
      
      expect(canReplace).toBe(false);
    });

    it('should execute RBF transaction', () => {
      const txId = '0x123...';
      const newTxId = '0x456...';
      const originalFee = 100n;
      const replacementFee = 150n;
      
      feeMarket.addTransaction(txId, originalFee);
      feeMarket.executeReplaceByFee(txId, newTxId, replacementFee);
      
      const newTx = feeMarket.getTransaction(newTxId);
      expect(newTx?.fee).toBe(replacementFee);
      
      const oldTx = feeMarket.getTransaction(txId);
      expect(oldTx).toBeUndefined();
    });
  });

  describe('Fee Bumping', () => {
    it('should calculate minimum fee bump', () => {
      const currentFee = 100n;
      const minBump = feeMarket.calculateMinimumFeeBump(currentFee);
      
      expect(minBump).toBeGreaterThan(currentFee);
      expect(minBump).toBeLessThanOrEqual(currentFee * 125n / 100n); // Max 25% increase
    });

    it('should bump transaction fee', () => {
      const txId = '0x123...';
      const currentFee = 100n;
      const bumpedFee = 130n;
      
      feeMarket.addTransaction(txId, currentFee);
      feeMarket.bumpFee(txId, bumpedFee);
      
      const tx = feeMarket.getTransaction(txId);
      expect(tx?.fee).toBe(bumpedFee);
    });
  });

  describe('Dynamic Fee Adjustment', () => {
    it('should adjust fees based on network conditions', () => {
      const baseFee = 100n;
      
      // Low congestion
      feeMarket.updateNetworkConditions(100, 50);
      const lowCongestionFee = feeMarket.getDynamicFee(baseFee);
      
      // High congestion
      feeMarket.updateNetworkConditions(10000, 500);
      const highCongestionFee = feeMarket.getDynamicFee(baseFee);
      
      expect(highCongestionFee).toBeGreaterThan(lowCongestionFee);
    });

    it('should prevent fee spikes beyond safe limits', () => {
      const baseFee = 100n;
      
      feeMarket.updateNetworkConditions(100000, 10000); // Extreme congestion
      const dynamicFee = feeMarket.getDynamicFee(baseFee);
      
      expect(dynamicFee).toBeLessThan(baseFee * 10n); // Max 10x increase
    });
  });

  describe('Mempool Management', () => {
    it('should add transaction to mempool', () => {
      const txId = '0x123...';
      const fee = 100n;
      
      feeMarket.addTransaction(txId, fee);
      
      const tx = feeMarket.getTransaction(txId);
      expect(tx).toBeDefined();
      expect(tx?.fee).toBe(fee);
    });

    it('should prioritize transactions by fee rate', () => {
      feeMarket.addTransaction('0x111...', 50n);
      feeMarket.addTransaction('0x222...', 150n);
      feeMarket.addTransaction('0x333...', 100n);
      
      const prioritized = feeMarket.getPrioritizedTransactions(2);
      
      expect(prioritized[0].txId).toBe('0x222...'); // Highest fee
      expect(prioritized[1].txId).toBe('0x333...'); // Second highest
    });

    it('should remove transaction from mempool', () => {
      const txId = '0x123...';
      feeMarket.addTransaction(txId, 100n);
      
      feeMarket.removeTransaction(txId);
      
      const tx = feeMarket.getTransaction(txId);
      expect(tx).toBeUndefined();
    });
  });

  describe('Performance Benchmarks', () => {
    it('should handle 10,000 fee estimations in under 1 second', async () => {
      const startTime = Date.now();
      
      const promises = [];
      for (let i = 0; i < 10000; i++) {
        promises.push(
          feeMarket.estimateFee(1000 + i, 6)
        );
      }
      
      await Promise.all(promises);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(1000);
    });

    it('should handle mempool prioritization in under 100ms', () => {
      for (let i = 0; i < 1000; i++) {
        feeMarket.addTransaction(`0x${i}...`, BigInt(Math.random() * 1000));
      }
      
      const startTime = Date.now();
      const prioritized = feeMarket.getPrioritizedTransactions(100);
      const endTime = Date.now();
      
      expect(prioritized.length).toBe(100);
      expect(endTime - startTime).toBeLessThan(100);
    });
  });

  describe('Error Handling', () => {
    it('should reject invalid fee amount', () => {
      expect(() => {
        feeMarket.addTransaction('0x123...', 0n);
      }).toThrow('Invalid fee amount');
    });

    it('should reject negative mempool size', () => {
      expect(() => {
        feeMarket.estimateFee(-1, 6);
      }).toThrow('Invalid mempool size');
    });

    it('should reject invalid confirmation target', () => {
      expect(() => {
        feeMarket.estimateFee(1000, 0);
      }).toThrow('Invalid confirmation target');
    });
  });
});