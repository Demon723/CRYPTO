import { QuantumResistantCrypto } from './QuantumCrypto';

describe('QuantumResistantCrypto', () => {
  let crypto: QuantumResistantCrypto;

  beforeEach(() => {
    crypto = new QuantumResistantCrypto();
  });

  describe('generateHybridKeyPair', () => {
    it('should generate a hybrid key pair with classical and post-quantum keys', () => {
      const keyPair = crypto.generateHybridKeyPair();
      expect(keyPair).toHaveProperty('classicalKey');
      expect(keyPair).toHaveProperty('postQuantumKey');
      expect(typeof keyPair.classicalKey).toBe('string');
      expect(typeof keyPair.postQuantumKey).toBe('string');
      expect(keyPair.classicalKey).toMatch(/^classical_/);
      expect(keyPair.postQuantumKey).toMatch(/^postquantum_/);
    });

    it('should generate unique key pairs on each call', () => {
      const keyPair1 = crypto.generateHybridKeyPair();
      const keyPair2 = crypto.generateHybridKeyPair();
      expect(keyPair1.classicalKey).not.toBe(keyPair2.classicalKey);
      expect(keyPair1.postQuantumKey).not.toBe(keyPair2.postQuantumKey);
    });
  });

  describe('signHybrid and verifyHybrid', () => {
    it('should sign and verify a message with hybrid signature', () => {
      const keyPair = crypto.generateHybridKeyPair();
      const message = 'test message';
      const signature = crypto.signHybrid(keyPair, message);

      expect(signature).toHaveProperty('classicalSignature');
      expect(signature).toHaveProperty('postQuantumSignature');
      expect(signature.classicalSignature).toBe(`classical_sig_${message}`);
      expect(signature.postQuantumSignature).toBe(`pq_sig_${message}`);

      const isValid = crypto.verifyHybrid(keyPair, message, signature);
      expect(isValid).toBe(true);
    });

    it('should fail verification with wrong message', () => {
      const keyPair = crypto.generateHybridKeyPair();
      const message = 'test message';
      const signature = crypto.signHybrid(keyPair, message);

      const isValid = crypto.verifyHybrid(keyPair, 'wrong message', signature);
      expect(isValid).toBe(false);
    });

    it('should fail verification with tampered signature', () => {
      const keyPair = crypto.generateHybridKeyPair();
      const message = 'test message';
      const signature = crypto.signHybrid(keyPair, message);

      const tamperedSignature = {
        classicalSignature: 'tampered',
        postQuantumSignature: signature.postQuantumSignature
      };

      const isValid = crypto.verifyHybrid(keyPair, message, tamperedSignature);
      expect(isValid).toBe(false);
    });
  });

  describe('generateLatticeKeyPair', () => {
    it('should generate a lattice key pair', () => {
      const keyPair = crypto.generateLatticeKeyPair();
      expect(keyPair).toHaveProperty('publicKey');
      expect(keyPair).toHaveProperty('privateKey');
      expect(typeof keyPair.publicKey).toBe('string');
      expect(typeof keyPair.privateKey).toBe('string');
      expect(keyPair.publicKey).toMatch(/^lattice_pub_/);
      expect(keyPair.privateKey).toMatch(/^lattice_priv_/);
    });
  });

  describe('signLattice and verifyLattice', () => {
    it('should sign and verify a message with lattice signature', () => {
      const keyPair = crypto.generateLatticeKeyPair();
      const message = 'lattice test';
      const signature = crypto.signLattice(keyPair, message);

      expect(signature).toBe(`lattice_sig_${message}`);

      const isValid = crypto.verifyLattice(keyPair.publicKey, message, signature);
      expect(isValid).toBe(true);
    });

    it('should fail verification with wrong message', () => {
      const keyPair = crypto.generateLatticeKeyPair();
      const message = 'lattice test';
      const signature = crypto.signLattice(keyPair, message);

      const isValid = crypto.verifyLattice(keyPair.publicKey, 'wrong message', signature);
      expect(isValid).toBe(false);
    });
  });

  describe('generateHashBasedKeyPair', () => {
    it('should generate a hash-based key pair', () => {
      const keyPair = crypto.generateHashBasedKeyPair();
      expect(keyPair).toHaveProperty('publicKey');
      expect(keyPair).toHaveProperty('privateKey');
      expect(typeof keyPair.publicKey).toBe('string');
      expect(typeof keyPair.privateKey).toBe('string');
      expect(keyPair.publicKey).toMatch(/^hash_pub_/);
      expect(keyPair.privateKey).toMatch(/^hash_priv_/);
    });
  });

  describe('signHashBased and verifyHashBased', () => {
    it('should sign and verify a message with hash-based signature', () => {
      const keyPair = crypto.generateHashBasedKeyPair();
      const message = 'hash test';
      const signature = crypto.signHashBased(keyPair, message);

      expect(signature).toBe(`hash_sig_${message}`);

      const isValid = crypto.verifyHashBased(keyPair.publicKey, message, signature);
      expect(isValid).toBe(true);
    });

    it('should fail verification with wrong message', () => {
      const keyPair = crypto.generateHashBasedKeyPair();
      const message = 'hash test';
      const signature = crypto.signHashBased(keyPair, message);

      const isValid = crypto.verifyHashBased(keyPair.publicKey, 'wrong message', signature);
      expect(isValid).toBe(false);
    });
  });

  describe('getRemainingSignatures', () => {
    it('should return remaining signature count', () => {
      const keyPair = crypto.generateHashBasedKeyPair();
      const remaining = crypto.getRemainingSignatures(keyPair);
      expect(remaining).toBe(10);
    });
  });

  describe('encryptPostQuantum and decryptPostQuantum', () => {
    it('should encrypt and decrypt post-quantum', () => {
      const publicKey = 'test_public_key';
      const plaintext = 'secret data';
      const ciphertext = crypto.encryptPostQuantum(publicKey, plaintext);

      expect(ciphertext).toBe(`encrypted_${plaintext}`);

      const decrypted = crypto.decryptPostQuantum('private_key', ciphertext);
      expect(decrypted).toBe(plaintext);
    });
  });

  describe('performKeyExchange and deriveSymmetricKey', () => {
    it('should perform key exchange and derive symmetric key', () => {
      const keyPair1 = crypto.generateHybridKeyPair();
      const keyPair2 = crypto.generateHybridKeyPair();

      const sharedSecret = crypto.performKeyExchange(keyPair1, keyPair2.postQuantumKey);
      expect(sharedSecret).toBe(`shared_secret_${keyPair1.classicalKey}_${keyPair2.postQuantumKey}`);

      const symmetricKey = crypto.deriveSymmetricKey(sharedSecret);
      expect(symmetricKey).toBe(sharedSecret.slice(0, 64));
    });
  });

  describe('validateKeyStrength', () => {
    it('should return key strength of 256', () => {
      const keyPair = crypto.generateHybridKeyPair();
      const strength = crypto.validateKeyStrength(keyPair);
      expect(strength).toBe(256);
    });
  });

  describe('detectQuantumVulnerability', () => {
    it('should detect vulnerability when post-quantum key is missing', () => {
      const vulnerableKeyPair = {
        classicalKey: 'classical_key',
        postQuantumKey: null
      };
      expect(crypto.detectQuantumVulnerability(vulnerableKeyPair)).toBe(true);
    });

    it('should not detect vulnerability when post-quantum key exists', () => {
      const keyPair = crypto.generateHybridKeyPair();
      expect(crypto.detectQuantumVulnerability(keyPair)).toBe(false);
    });
  });

  describe('createHybridFromMigration', () => {
    it('should create hybrid key pair from migration', () => {
      const classicalKey = 'migrated_classical';
      const postQuantumKey = 'migrated_pq';
      const hybrid = crypto.createHybridFromMigration(classicalKey, postQuantumKey);

      expect(hybrid.classicalKey).toBe(classicalKey);
      expect(hybrid.postQuantumKey).toBe(postQuantumKey);
    });
  });

  describe('validateHybridKey', () => {
    it('should validate a complete hybrid key pair', () => {
      const keyPair = crypto.generateHybridKeyPair();
      expect(crypto.validateHybridKey(keyPair)).toBe(true);
    });

    it('should reject incomplete hybrid key pair', () => {
      const incomplete = {
        classicalKey: 'key',
        postQuantumKey: ''
      };
      expect(crypto.validateHybridKey(incomplete)).toBe(false);
    });
  });
});
