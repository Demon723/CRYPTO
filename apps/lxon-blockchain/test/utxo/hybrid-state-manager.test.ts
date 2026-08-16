import { describe, it, expect, beforeEach } from '@jest/globals';
import { HybridStateManager } from '../../src/utxo/hybrid-state-manager';

describe('HybridStateManager', () => {
  let stateManager: HybridStateManager;

  beforeEach(() => {
    stateManager = new HybridStateManager();
  });

  describe('UTXO Model Integration', () => {
    it('should create UTXO from transaction', () => {
      const txId = '0x123...';
      const outputIndex = 0;
      const amount = 1000n;
      const owner = '0xabc...';

      const utxo = stateManager.createUTXO(txId, outputIndex, amount, owner);
      
      expect(utxo.txId).toBe(txId);
      expect(utxo.outputIndex).toBe(outputIndex);
      expect(utxo.amount).toBe(amount);
      expect(utxo.owner).toBe(owner);
      expect(utxo.spent).toBe(false);
    });

    it('should spend UTXO correctly', () => {
      const txId = '0x123...';
      const utxo = stateManager.createUTXO(txId, 0, 1000n, '0xabc...');
      
      stateManager.spendUTXO(txId, 0);
      
      const spentUTXO = stateManager.getUTXO(txId, 0);
      expect(spentUTXO?.spent).toBe(true);
    });

    it('should validate UTXO spend conditions', () => {
      const txId = '0x123...';
      stateManager.createUTXO(txId, 0, 1000n, '0xabc...');
      
      // Valid spend
      expect(stateManager.canSpendUTXO(txId, 0, '0xabc...')).toBe(true);
      
      // Invalid owner
      expect(stateManager.canSpendUTXO(txId, 0, '0xdef...')).toBe(false);
      
      // Already spent
      stateManager.spendUTXO(txId, 0);
      expect(stateManager.canSpendUTXO(txId, 0, '0xabc...')).toBe(false);
    });

    it('should calculate account balance from UTXOs', () => {
      const owner = '0xabc...';
      
      stateManager.createUTXO('0x111...', 0, 500n, owner);
      stateManager.createUTXO('0x222...', 0, 300n, owner);
      stateManager.createUTXO('0x333...', 0, 200n, owner);
      
      const balance = stateManager.getAccountBalance(owner);
      expect(balance).toBe(1000n);
    });

    it('should handle hybrid state model (UTXO + Account)', () => {
      const owner = '0xabc...';
      
      // UTXO balance
      stateManager.createUTXO('0x111...', 0, 500n, owner);
      
      // Account balance
      stateManager.setAccountBalance(owner, 300n);
      
      const totalBalance = stateManager.getTotalBalance(owner);
      expect(totalBalance).toBe(800n);
    });
  });

  describe('State Transitions', () => {
    it('should create state checkpoint', () => {
      stateManager.createUTXO('0x111...', 0, 1000n, '0xabc...');
      
      const checkpoint = stateManager.createCheckpoint();
      
      expect(checkpoint).toBeDefined();
      expect(checkpoint.timestamp).toBeDefined();
    });

    it('should revert to checkpoint', () => {
      stateManager.createUTXO('0x111...', 0, 1000n, '0xabc...');
      const checkpoint = stateManager.createCheckpoint();
      
      stateManager.spendUTXO('0x111...', 0);
      stateManager.revertToCheckpoint(checkpoint);
      
      const utxo = stateManager.getUTXO('0x111...', 0);
      expect(utxo?.spent).toBe(false);
    });

    it('should handle parallel state transitions', async () => {
      const promises = [];
      
      for (let i = 0; i < 100; i++) {
        promises.push(
          stateManager.createUTXO(`0x${i}...`, 0, BigInt(i * 10), `0xowner${i}...`)
        );
      }
      
      await Promise.all(promises);
      
      const utxoCount = stateManager.getUTXOCount();
      expect(utxoCount).toBe(100);
    });
  });

  describe('Performance Benchmarks', () => {
    it('should handle 10,000 UTXO creation in under 1 second', async () => {
      const startTime = Date.now();
      
      const promises = [];
      for (let i = 0; i < 10000; i++) {
        promises.push(
          stateManager.createUTXO(`0x${i}...`, 0, 1000n, `0xowner...`)
        );
      }
      
      await Promise.all(promises);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(1000);
    });

    it('should handle UTXO lookup in under 1ms', () => {
      stateManager.createUTXO('0x111...', 0, 1000n, '0xabc...');
      
      const startTime = Date.now();
      const utxo = stateManager.getUTXO('0x111...', 0);
      const endTime = Date.now();
      
      expect(utxo).toBeDefined();
      expect(endTime - startTime).toBeLessThan(1);
    });
  });

  describe('Error Handling', () => {
    it('should reject duplicate UTXO creation', () => {
      stateManager.createUTXO('0x111...', 0, 1000n, '0xabc...');
      
      expect(() => {
        stateManager.createUTXO('0x111...', 0, 1000n, '0xdef...');
      }).toThrow('UTXO already exists');
    });

    it('should reject spending non-existent UTXO', () => {
      expect(() => {
        stateManager.spendUTXO('0x999...', 0);
      }).toThrow('UTXO not found');
    });

    it('should reject spending already spent UTXO', () => {
      stateManager.createUTXO('0x111...', 0, 1000n, '0xabc...');
      stateManager.spendUTXO('0x111...', 0);
      
      expect(() => {
        stateManager.spendUTXO('0x111...', 0);
      }).toThrow('UTXO already spent');
    });
  });
});