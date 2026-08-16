import { describe, it, expect, beforeEach } from '@jest/globals';
import { QuantumResistantCrypto } from '../../src/crypto/quantum-resistant';

describe('QuantumResistantCrypto', () => {
  let crypto: QuantumResistantCrypto;

  beforeEach(() => {
    crypto = new QuantumResistantCrypto();
  });

  describe('Hybrid Signatures', () => {
    it('should generate hybrid key pair', () => {
      const keyPair = crypto.generateHybridKeyPair();
      
      expect(keyPair).toBeDefined();
      expect(keyPair.classicalKey).toBeDefined();
      expect(keyPair.postQuantumKey).toBeDefined();
    });

    it('should sign message with hybrid signature', () => {
      const keyPair = crypto.generateHybridKeyPair();
      const message = 'test message';
      
      const signature = crypto.signHybrid(keyPair, message);
      
      expect(signature).toBeDefined();
      expect(signature.classicalSignature).toBeDefined();
      expect(signature.postQuantumSignature).toBeDefined();
    });

    it('should verify hybrid signature', () => {
      const keyPair = crypto.generateHybridKeyPair();
      const message = 'test message';
      const signature = crypto.signHybrid(keyPair, message);
      
      const valid = crypto.verifyHybrid(keyPair, message, signature);
      
      expect(valid).toBe(true);
    });

    it('should reject invalid hybrid signature', () => {
      const keyPair = crypto.generateHybridKeyPair();
      const message = 'test message';
      const signature = crypto.signHybrid(keyPair, message);
      
      const valid = crypto.verifyHybrid(keyPair, 'different message', signature);
      
      expect(valid).toBe(false);
    });
  });

  describe('Lattice-Based Cryptography', () => {
    it('should generate lattice key pair', () => {
      const keyPair = crypto.generateLatticeKeyPair();
      
      expect(keyPair).toBeDefined();
      expect(keyPair.publicKey).toBeDefined();
      expect(keyPair.privateKey).toBeDefined();
    });

    it('should sign with lattice signature', () => {
      const keyPair = crypto.generateLatticeKeyPair();
      const message = 'test message';
      
      const signature = crypto.signLattice(keyPair, message);
      
      expect(signature).toBeDefined();
    });

    it('should verify lattice signature', () => {
      const keyPair = crypto.generateLatticeKeyPair();
      const message = 'test message';
      const signature = crypto.signLattice(keyPair, message);
      
      const valid = crypto.verifyLattice(keyPair.publicKey, message, signature);
      
      expect(valid).toBe(true);
    });
  });

  describe('Hash-Based Signatures', () => {
    it('should generate hash-based key pair', () => {
      const keyPair = crypto.generateHashBasedKeyPair();
      
      expect(keyPair).toBeDefined();
      expect(keyPair.publicKey).toBeDefined();
      expect(keyPair.privateKey).toBeDefined();
    });

    it('should sign with hash-based signature', () => {
      const keyPair = crypto.generateHashBasedKeyPair();
      const message = 'test message';
      
      const signature = crypto.signHashBased(keyPair, message);
      
      expect(signature).toBeDefined();
    });

    it('should verify hash-based signature', () => {
      const keyPair = crypto.generateHashBasedKeyPair();
      const message = 'test message';
      const signature = crypto.signHashBased(keyPair, message);
      
      const valid = crypto.verifyHashBased(keyPair.publicKey, message, signature);
      
      expect(valid).toBe(true);
    });

    it('should limit signature count for hash-based signatures', () => {
      const keyPair = crypto.generateHashBasedKeyPair();
      const message = 'test message';
      
      // Sign multiple times
      crypto.signHashBased(keyPair, message);
      crypto.signHashBased(keyPair, message);
      
      // Check remaining signatures
      const remaining = crypto.getRemainingSignatures(keyPair);
      expect(remaining).toBeLessThan(10); // Assuming 10 signature limit
    });
  });

  describe('Post-Quantum Encryption', () => {
    it('should encrypt with post-quantum algorithm', () => {
      const keyPair = crypto.generateLatticeKeyPair();
      const plaintext = 'secret message';
      
      const ciphertext = crypto.encryptPostQuantum(keyPair.publicKey, plaintext);
      
      expect(ciphertext).toBeDefined();
      expect(ciphertext).not.toBe(plaintext);
    });

    it('should decrypt post-quantum ciphertext', () => {
      const keyPair = crypto.generateLatticeKeyPair();
      const plaintext = 'secret message';
      const ciphertext = crypto.encryptPostQuantum(keyPair.publicKey, plaintext);
      
      const decrypted = crypto.decryptPostQuantum(keyPair.privateKey, ciphertext);
      
      expect(decrypted).toBe(plaintext);
    });

    it('should fail decryption with wrong key', () => {
      const keyPair1 = crypto.generateLatticeKeyPair();
      const keyPair2 = crypto.generateLatticeKeyPair();
      const plaintext = 'secret message';
      const ciphertext = crypto.encryptPostQuantum(keyPair1.publicKey, plaintext);
      
      expect(() => {
        crypto.decryptPostQuantum(keyPair2.privateKey, ciphertext);
      }).toThrow('Decryption failed');
    });
  });

  describe('Key Exchange', () => {
    it('should perform hybrid key exchange', () => {
      const keyPair1 = crypto.generateHybridKeyPair();
      const keyPair2 = crypto.generateHybridKeyPair();
      
      const sharedSecret1 = crypto.performKeyExchange(keyPair1, keyPair2.publicKey);
      const sharedSecret2 = crypto.performKeyExchange(keyPair2, keyPair1.publicKey);
      
      expect(sharedSecret1).toEqual(sharedSecret2);
    });

    it('should derive symmetric key from shared secret', () => {
      const keyPair1 = crypto.generateHybridKeyPair();
      const keyPair2 = crypto.generateHybridKeyPair();
      
      const sharedSecret = crypto.performKeyExchange(keyPair1, keyPair2.publicKey);
      const symmetricKey = crypto.deriveSymmetricKey(sharedSecret);
      
      expect(symmetricKey).toBeDefined();
      expect(symmetricKey.length).toBe(32); // 256-bit key
    });
  });

  describe('Performance Benchmarks', () => {
    it('should generate hybrid key pair in under 100ms', () => {
      const startTime = Date.now();
      
      crypto.generateHybridKeyPair();
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(100);
    });

    it('should sign with hybrid signature in under 200ms', () => {
      const keyPair = crypto.generateHybridKeyPair();
      const message = 'test message';
      
      const startTime = Date.now();
      crypto.signHybrid(keyPair, message);
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(200);
    });

    it('should verify hybrid signature in under 100ms', () => {
      const keyPair = crypto.generateHybridKeyPair();
      const message = 'test message';
      const signature = crypto.signHybrid(keyPair, message);
      
      const startTime = Date.now();
      crypto.verifyHybrid(keyPair, message, signature);
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(100);
    });
  });

  describe('Security Validation', () => {
    it('should validate key strength', () => {
      const keyPair = crypto.generateHybridKeyPair();
      
      const strength = crypto.validateKeyStrength(keyPair);
      
      expect(strength).toBeGreaterThan(128); // At least 128-bit security
    });

    it('should reject weak keys', () => {
      const weakKey = {
        classicalKey: 'weak_key',
        postQuantumKey: 'weak_key'
      };
      
      const strength = crypto.validateKeyStrength(weakKey);
      
      expect(strength).toBeLessThan(128);
    });

    it('should detect quantum vulnerability', () => {
      const classicalOnlyKey = {
        classicalKey: 'classical_key',
        postQuantumKey: null
      };
      
      const vulnerable = crypto.detectQuantumVulnerability(classicalOnlyKey);
      
      expect(vulnerable).toBe(true);
    });
  });

  describe('Migration Support', () => {
    it('should support gradual migration from classical to post-quantum', () => {
      const classicalKey = crypto.generateClassicalKeyPair();
      const postQuantumKey = crypto.generateLatticeKeyPair();
      
      const hybridKey = crypto.createHybridFromMigration(classicalKey, postQuantumKey);
      
      expect(hybridKey).toBeDefined();
      expect(hybridKey.classicalKey).toBeDefined();
      expect(hybridKey.postQuantumKey).toBeDefined();
    });

    it('should validate hybrid key during migration', () => {
      const classicalKey = crypto.generateClassicalKeyPair();
      const postQuantumKey = crypto.generateLatticeKeyPair();
      const hybridKey = crypto.createHybridFromMigration(classicalKey, postQuantumKey);
      
      const valid = crypto.validateHybridKey(hybridKey);
      
      expect(valid).toBe(true);
    });
  });
});