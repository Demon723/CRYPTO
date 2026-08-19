import { HybridStateManager } from './UTXO';

describe('HybridStateManager', () => {
  let manager: HybridStateManager;

  beforeEach(() => {
    manager = new HybridStateManager();
  });

  describe('createUTXO', () => {
    it('should create a new UTXO', () => {
      const utxo = manager.createUTXO('tx1', 0, 1000n, 'address1');

      expect(utxo).toHaveProperty('txId', 'tx1');
      expect(utxo).toHaveProperty('outputIndex', 0);
      expect(utxo).toHaveProperty('amount', 1000n);
      expect(utxo).toHaveProperty('owner', 'address1');
      expect(utxo).toHaveProperty('spent', false);
    });

    it('should create multiple UTXOs', () => {
      manager.createUTXO('tx1', 0, 1000n, 'address1');
      manager.createUTXO('tx1', 1, 2000n, 'address1');
      manager.createUTXO('tx2', 0, 500n, 'address2');

      expect(manager.getUTXOCount()).toBe(3);
    });

    it('should store UTXO with composite key', () => {
      manager.createUTXO('tx1', 0, 1000n, 'address1');
      const retrieved = manager.getUTXO('tx1', 0);

      expect(retrieved).toBeDefined();
      expect(retrieved?.txId).toBe('tx1');
      expect(retrieved?.outputIndex).toBe(0);
    });
  });

  describe('spendUTXO', () => {
    it('should mark UTXO as spent', () => {
      manager.createUTXO('tx1', 0, 1000n, 'address1');
      manager.spendUTXO('tx1', 0);

      const utxo = manager.getUTXO('tx1', 0);
      expect(utxo?.spent).toBe(true);
    });

    it('should not throw when spending non-existent UTXO', () => {
      expect(() => {
        manager.spendUTXO('nonexistent', 0);
      }).not.toThrow();
    });
  });

  describe('getUTXO', () => {
    it('should return undefined for non-existent UTXO', () => {
      const utxo = manager.getUTXO('nonexistent', 0);
      expect(utxo).toBeUndefined();
    });

    it('should return correct UTXO', () => {
      manager.createUTXO('tx1', 0, 1000n, 'address1');
      const utxo = manager.getUTXO('tx1', 0);

      expect(utxo?.amount).toBe(1000n);
      expect(utxo?.owner).toBe('address1');
    });
  });

  describe('getAccountBalance', () => {
    beforeEach(() => {
      manager.createUTXO('tx1', 0, 1000n, 'address1');
      manager.createUTXO('tx1', 1, 2000n, 'address1');
      manager.createUTXO('tx2', 0, 500n, 'address2');
    });

    it('should calculate balance for address with multiple UTXOs', () => {
      const balance = manager.getAccountBalance('address1');
      expect(balance).toBe(3000n);
    });

    it('should calculate balance for address with single UTXO', () => {
      const balance = manager.getAccountBalance('address2');
      expect(balance).toBe(500n);
    });

    it('should return zero for address with no UTXOs', () => {
      const balance = manager.getAccountBalance('nonexistent');
      expect(balance).toBe(0n);
    });

    it('should exclude spent UTXOs from balance', () => {
      manager.spendUTXO('tx1', 0);
      const balance = manager.getAccountBalance('address1');
      expect(balance).toBe(2000n);
    });

    it('should return zero when all UTXOs are spent', () => {
      manager.spendUTXO('tx1', 0);
      manager.spendUTXO('tx1', 1);
      manager.spendUTXO('tx2', 0);

      expect(manager.getAccountBalance('address1')).toBe(0n);
      expect(manager.getAccountBalance('address2')).toBe(0n);
    });
  });

  describe('createCheckpoint and revertToCheckpoint', () => {
    it('should create checkpoint with current state', () => {
      manager.createUTXO('tx1', 0, 1000n, 'address1');
      const checkpoint = manager.createCheckpoint();

      expect(checkpoint).toHaveProperty('timestamp');
      expect(checkpoint).toHaveProperty('utxos');
      expect(checkpoint.utxos.size).toBe(1);
    });

    it('should revert to checkpoint', () => {
      manager.createUTXO('tx1', 0, 1000n, 'address1');
      const checkpoint = manager.createCheckpoint();

      manager.createUTXO('tx2', 0, 2000n, 'address2');
      expect(manager.getUTXOCount()).toBe(2);

      manager.revertToCheckpoint(checkpoint);
      expect(manager.getUTXOCount()).toBe(1);
      expect(manager.getUTXO('tx1', 0)).toBeDefined();
      expect(manager.getUTXO('tx2', 0)).toBeUndefined();
    });

    it('should revert spent UTXOs to unspent', () => {
      manager.createUTXO('tx1', 0, 1000n, 'address1');
      const checkpoint = manager.createCheckpoint();

      manager.spendUTXO('tx1', 0);
      expect(manager.getUTXO('tx1', 0)?.spent).toBe(true);

      manager.revertToCheckpoint(checkpoint);
      expect(manager.getUTXO('tx1', 0)?.spent).toBe(false);
    });
  });

  describe('getUTXOCount', () => {
    it('should return zero for empty manager', () => {
      expect(manager.getUTXOCount()).toBe(0);
    });

    it('should return correct count after adding UTXOs', () => {
      manager.createUTXO('tx1', 0, 1000n, 'address1');
      manager.createUTXO('tx1', 1, 2000n, 'address1');
      expect(manager.getUTXOCount()).toBe(2);
    });

    it('should not decrease count when spending UTXO', () => {
      manager.createUTXO('tx1', 0, 1000n, 'address1');
      manager.spendUTXO('tx1', 0);
      expect(manager.getUTXOCount()).toBe(1);
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete transaction flow', () => {
      manager.createUTXO('tx1', 0, 5000n, 'alice');
      manager.createUTXO('tx1', 1, 3000n, 'bob');

      expect(manager.getAccountBalance('alice')).toBe(5000n);
      expect(manager.getAccountBalance('bob')).toBe(3000n);

      manager.spendUTXO('tx1', 0);
      expect(manager.getAccountBalance('alice')).toBe(0n);

      const checkpoint = manager.createCheckpoint();
      manager.createUTXO('tx2', 0, 2000n, 'alice');
      expect(manager.getAccountBalance('alice')).toBe(2000n);

      manager.revertToCheckpoint(checkpoint);
      expect(manager.getAccountBalance('alice')).toBe(0n);
    });
  });
});
