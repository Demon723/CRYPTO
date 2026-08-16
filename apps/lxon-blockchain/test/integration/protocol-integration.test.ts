import { describe, it, expect, beforeEach } from '@jest/globals';
import { HybridStateManager } from '../../src/utxo/hybrid-state-manager';
import { FeeMarket } from '../../src/fee/fee-market';
import { EnhancedScripting } from '../../src/script/enhanced-scripting';
import { QuantumResistantCrypto } from '../../src/crypto/quantum-resistant';

describe('Protocol Integration Tests', () => {
  let stateManager: HybridStateManager;
  let feeMarket: FeeMarket;
  let scripting: EnhancedScripting;
  let crypto: QuantumResistantCrypto;

  beforeEach(() => {
    stateManager = new HybridStateManager();
    feeMarket = new FeeMarket();
    scripting = new EnhancedScripting();
    crypto = new QuantumResistantCrypto();
  });

  describe('End-to-End Transaction Flow', () => {
    it('should process complete transaction with all components', async () => {
      // Generate keys
      const senderKey = crypto.generateHybridKeyPair();
      const receiverKey = crypto.generateHybridKeyPair();
      
      // Create UTXO
      const txId = '0x111...';
      stateManager.createUTXO(txId, 0, 1000n, senderKey.classicalKey);
      
      // Estimate fee
      const fee = feeMarket.estimateFee(1000, 6);
      
      // Create script
      const script = scripting.compileMiniscript('pk(A)');
      
      // Sign transaction
      const message = 'transaction_data';
      const signature = crypto.signHybrid(senderKey, message);
      
      // Execute transaction
      const result = stateManager.spendUTXO(txId, 0);
      
      expect(result).toBeDefined();
      expect(fee).toBeGreaterThan(0);
      expect(script).toBeDefined();
      expect(signature).toBeDefined();
    });

    it('should handle concurrent transactions safely', async () => {
      const promises = [];
      
      for (let i = 0; i < 100; i++) {
        const keyPair = crypto.generateHybridKeyPair();
        const txId = `0x${i}...`;
        
        stateManager.createUTXO(txId, 0, 1000n, keyPair.classicalKey);
        
        promises.push(
          Promise.resolve().then(() => {
            stateManager.spendUTXO(txId, 0);
          })
        );
      }
      
      await Promise.all(promises);
      
      const utxoCount = stateManager.getUTXOCount();
      expect(utxoCount).toBe(0); // All spent
    });
  });

  describe('Component Interaction', () => {
    it('should integrate UTXO with fee market', () => {
      const txId = '0x111...';
      stateManager.createUTXO(txId, 0, 1000n, '0xabc...');
      
      const fee = feeMarket.estimateFee(1000, 6);
      const canAffordFee = stateManager.getAccountBalance('0xabc...') >= fee;
      
      expect(canAffordFee).toBe(true);
    });

    it('should integrate scripting with state management', () => {
      const script = scripting.compileMiniscript('pk(A)');
      const valid = scripting.validateScript(script);
      
      expect(valid).toBe(true);
      
      // Script can be attached to UTXO
      const txId = '0x111...';
      stateManager.createUTXO(txId, 0, 1000n, '0xabc...');
      
      const utxo = stateManager.getUTXO(txId, 0);
      expect(utxo).toBeDefined();
    });

    it('should integrate quantum crypto with transaction signing', () => {
      const keyPair = crypto.generateHybridKeyPair();
      const message = 'transaction_data';
      
      const signature = crypto.signHybrid(keyPair, message);
      const valid = crypto.verifyHybrid(keyPair, message, signature);
      
      expect(valid).toBe(true);
    });
  });

  describe('Performance Integration', () => {
    it('should handle 1,000 complete transactions in under 10 seconds', async () => {
      const startTime = Date.now();
      
      const promises = [];
      for (let i = 0; i < 1000; i++) {
        const keyPair = crypto.generateHybridKeyPair();
        const txId = `0x${i}...`;
        
        promises.push(
          Promise.resolve().then(() => {
            stateManager.createUTXO(txId, 0, 1000n, keyPair.classicalKey);
            const fee = feeMarket.estimateFee(1000, 6);
            const script = scripting.compileMiniscript('pk(A)');
            const signature = crypto.signHybrid(keyPair, 'tx_data');
            stateManager.spendUTXO(txId, 0);
          })
        );
      }
      
      await Promise.all(promises);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(10000);
    });
  });

  describe('Error Recovery', () => {
    it('should recover from component failures', () => {
      const txId = '0x111...';
      stateManager.createUTXO(txId, 0, 1000n, '0xabc...');
      
      const checkpoint = stateManager.createCheckpoint();
      
      // Simulate failure
      stateManager.spendUTXO(txId, 0);
      
      // Recover
      stateManager.revertToCheckpoint(checkpoint);
      
      const utxo = stateManager.getUTXO(txId, 0);
      expect(utxo?.spent).toBe(false);
    });

    it('should handle partial transaction failures', () => {
      const txId1 = '0x111...';
      const txId2 = '0x222...';
      
      stateManager.createUTXO(txId1, 0, 1000n, '0xabc...');
      stateManager.createUTXO(txId2, 0, 1000n, '0xdef...');
      
      // First succeeds
      stateManager.spendUTXO(txId1, 0);
      
      // Second fails (doesn't exist)
      expect(() => {
        stateManager.spendUTXO('0x999...', 0);
      }).toThrow();
      
      // First should still be spent
      const utxo1 = stateManager.getUTXO(txId1, 0);
      expect(utxo1?.spent).toBe(true);
    });
  });

  describe('Data Consistency', () => {
    it('should maintain consistency across components', () => {
      const txId = '0x111...';
      const amount = 1000n;
      const owner = '0xabc...';
      
      stateManager.createUTXO(txId, 0, amount, owner);
      
      const utxo = stateManager.getUTXO(txId, 0);
      const balance = stateManager.getAccountBalance(owner);
      
      expect(utxo?.amount).toBe(amount);
      expect(balance).toBe(amount);
    });

    it('should handle concurrent state updates safely', async () => {
      const promises = [];
      
      for (let i = 0; i < 100; i++) {
        promises.push(
          Promise.resolve().then(() => {
            const txId = `0x${i}...`;
            stateManager.createUTXO(txId, 0, 1000n, `0xowner${i}...`);
          })
        );
      }
      
      await Promise.all(promises);
      
      const utxoCount = stateManager.getUTXOCount();
      expect(utxoCount).toBe(100);
    });
  });

  describe('Security Integration', () => {
    it('should validate transaction with quantum-resistant signatures', () => {
      const keyPair = crypto.generateHybridKeyPair();
      const message = 'transaction_data';
      const signature = crypto.signHybrid(keyPair, message);
      
      const valid = crypto.verifyHybrid(keyPair, message, signature);
      
      expect(valid).toBe(true);
      
      // Invalid signature should fail
      const invalid = crypto.verifyHybrid(keyPair, 'different_message', signature);
      expect(invalid).toBe(false);
    });

    it('should prevent script execution exploits', () => {
      const maliciousScript = 'OP_1 OP_DUP '.repeat(10000);
      
      expect(() => {
        scripting.executeScript(maliciousScript);
      }).toThrow();
    });
  });
});