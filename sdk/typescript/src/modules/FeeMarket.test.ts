import { FeeMarket } from './FeeMarket';

describe('FeeMarket', () => {
  let feeMarket: FeeMarket;

  beforeEach(() => {
    feeMarket = new FeeMarket();
  });

  describe('estimateFee', () => {
    it('should estimate base fee with low mempool and 6 confirmations', () => {
      const fee = feeMarket.estimateFee(0, 6);
      expect(Number(fee)).toBe(0);
    });

    it('should increase fee with mempool congestion', () => {
      const fee = feeMarket.estimateFee(5000, 6);
      expect(Number(fee)).toBeGreaterThan(100);
    });

    it('should increase fee with lower confirmation target', () => {
      const feeLowTarget = feeMarket.estimateFee(1000, 1);
      const feeHighTarget = feeMarket.estimateFee(1000, 6);
      expect(Number(feeLowTarget)).toBeGreaterThan(Number(feeHighTarget));
    });

    it('should cap fee at maximum', () => {
      const fee = feeMarket.estimateFee(100000, 1);
      expect(Number(fee)).toBeLessThanOrEqual(1000);
    });

    it('should calculate fee correctly for moderate conditions', () => {
      const mempoolSize = 2000;
      const targetConfirmations = 3;
      const fee = feeMarket.estimateFee(mempoolSize, targetConfirmations);

      const baseFee = 100;
      const congestionMultiplier = Math.min(mempoolSize / 1000, 10);
      const targetMultiplier = Math.max(6 / targetConfirmations, 1);
      const expected = Math.min(baseFee * congestionMultiplier * targetMultiplier, 1000);

      expect(Number(fee)).toBe(expected);
    });
  });

  describe('addTransaction and getTransaction', () => {
    it('should add and retrieve a transaction', () => {
      feeMarket.addTransaction('tx1', 500n);
      const tx = feeMarket.getTransaction('tx1');

      expect(tx).toBeDefined();
      expect(tx.txId).toBe('tx1');
      expect(Number(tx.fee)).toBe(500);
      expect(tx.timestamp).toBeDefined();
    });

    it('should return undefined for non-existent transaction', () => {
      const tx = feeMarket.getTransaction('nonexistent');
      expect(tx).toBeUndefined();
    });

    it('should store multiple transactions', () => {
      feeMarket.addTransaction('tx1', 100n);
      feeMarket.addTransaction('tx2', 200n);
      feeMarket.addTransaction('tx3', 300n);

      expect(Number(feeMarket.getTransaction('tx1')?.fee)).toBe(100);
      expect(Number(feeMarket.getTransaction('tx2')?.fee)).toBe(200);
      expect(Number(feeMarket.getTransaction('tx3')?.fee)).toBe(300);
    });
  });

  describe('canReplaceByFee', () => {
    beforeEach(() => {
      feeMarket.addTransaction('tx1', 100n);
    });

    it('should allow RBF with sufficient fee increase', () => {
      expect(feeMarket.canReplaceByFee('tx1', 130n)).toBe(true);
    });

    it('should reject RBF with insufficient fee increase', () => {
      expect(feeMarket.canReplaceByFee('tx1', 120n)).toBe(false);
    });

    it('should reject RBF for non-existent transaction', () => {
      expect(feeMarket.canReplaceByFee('nonexistent', 200n)).toBe(false);
    });

    it('should allow RBF with exactly 25% increase', () => {
      expect(feeMarket.canReplaceByFee('tx1', 125n)).toBe(true);
    });

    it('should reject RBF with just below 25% increase', () => {
      expect(feeMarket.canReplaceByFee('tx1', 124n)).toBe(false);
    });
  });

  describe('executeReplaceByFee', () => {
    it('should replace transaction with higher fee', () => {
      feeMarket.addTransaction('tx1', 100n);
      feeMarket.executeReplaceByFee('tx1', 'tx2', 150n);

      expect(feeMarket.getTransaction('tx1')).toBeUndefined();
      expect(feeMarket.getTransaction('tx2')).toBeDefined();
      expect(Number(feeMarket.getTransaction('tx2')?.fee)).toBe(150);
    });

    it('should not replace transaction with insufficient fee', () => {
      feeMarket.addTransaction('tx1', 100n);
      feeMarket.executeReplaceByFee('tx1', 'tx2', 110n);

      expect(feeMarket.getTransaction('tx1')).toBeDefined();
      expect(feeMarket.getTransaction('tx2')).toBeUndefined();
    });

    it('should not replace non-existent transaction', () => {
      feeMarket.executeReplaceByFee('nonexistent', 'tx2', 200n);
      expect(feeMarket.getTransaction('tx2')).toBeUndefined();
    });
  });

  describe('calculateMinimumFeeBump', () => {
    it('should calculate 25% fee bump', () => {
      expect(feeMarket.calculateMinimumFeeBump(100n)).toBe(125n);
      expect(feeMarket.calculateMinimumFeeBump(200n)).toBe(250n);
      expect(feeMarket.calculateMinimumFeeBump(1000n)).toBe(1250n);
    });
  });

  describe('bumpFee', () => {
    it('should update transaction fee', () => {
      feeMarket.addTransaction('tx1', 100n);
      feeMarket.bumpFee('tx1', 200n);

      expect(Number(feeMarket.getTransaction('tx1')?.fee)).toBe(200);
    });

    it('should not modify non-existent transaction', () => {
      feeMarket.bumpFee('nonexistent', 200n);
      expect(feeMarket.getTransaction('nonexistent')).toBeUndefined();
    });
  });

  describe('updateNetworkConditions', () => {
    it('should not throw on network condition update', () => {
      expect(() => {
        feeMarket.updateNetworkConditions(5000, 1000000);
      }).not.toThrow();
    });
  });

  describe('getDynamicFee', () => {
    it('should return dynamic fee based on network conditions', () => {
      const baseFee = 100n;
      const dynamicFee = feeMarket.getDynamicFee(baseFee);
      expect(Number(dynamicFee)).toBe(100);
    });
  });

  describe('getPrioritizedTransactions', () => {
    beforeEach(() => {
      feeMarket.addTransaction('tx1', 100n);
      feeMarket.addTransaction('tx2', 300n);
      feeMarket.addTransaction('tx3', 200n);
    });

    it('should return transactions sorted by fee descending', () => {
      const prioritized = feeMarket.getPrioritizedTransactions(3);

      expect(prioritized).toHaveLength(3);
      expect(Number(prioritized[0].fee)).toBe(300);
      expect(Number(prioritized[1].fee)).toBe(200);
      expect(Number(prioritized[2].fee)).toBe(100);
    });

    it('should return limited number of transactions', () => {
      const prioritized = feeMarket.getPrioritizedTransactions(2);
      expect(prioritized).toHaveLength(2);
    });

    it('should return all transactions when count exceeds total', () => {
      const prioritized = feeMarket.getPrioritizedTransactions(10);
      expect(prioritized).toHaveLength(3);
    });
  });

  describe('removeTransaction', () => {
    it('should remove transaction', () => {
      feeMarket.addTransaction('tx1', 100n);
      feeMarket.removeTransaction('tx1');

      expect(feeMarket.getTransaction('tx1')).toBeUndefined();
    });

    it('should not throw when removing non-existent transaction', () => {
      expect(() => {
        feeMarket.removeTransaction('nonexistent');
      }).not.toThrow();
    });
  });
});
