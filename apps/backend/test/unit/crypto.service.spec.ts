import { Test, TestingModule } from '@nestjs/testing';
import { CryptoService } from '../../src/modules/common/modules/crypto/crypto.service';

describe('CryptoService', () => {
  let service: CryptoService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [CryptoService],
    }).compile();

    service = moduleRef.get<CryptoService>(CryptoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should encrypt and decrypt string', () => {
    const plaintext = 'sensitive-user-data-123';
    const encrypted = service.encrypt(plaintext);
    
    expect(encrypted.ciphertext).toBeDefined();
    expect(encrypted.iv).toBeDefined();
    expect(encrypted.authTag).toBeDefined();
    expect(encrypted.ciphertext).not.toBe(plaintext);
    
    const decrypted = service.decrypt(encrypted);
    expect(decrypted).toBe(plaintext);
  });

  it('should encrypt and decrypt object', () => {
    const obj = {
      email: 'user@example.com',
      name: 'Test User',
      wallets: [{ address: '0x123', chain: 'ETH' }],
    };
    
    const encrypted = service.encryptObject(obj);
    const decrypted = service.decryptObject(encrypted);
    
    expect(decrypted).toEqual(obj);
  });

  it('should produce different ciphertext for same plaintext (random IV)', () => {
    const plaintext = 'same-data';
    const encrypted1 = service.encrypt(plaintext);
    const encrypted2 = service.encrypt(plaintext);
    
    expect(encrypted1.ciphertext).not.toBe(encrypted2.ciphertext);
    expect(encrypted1.iv).not.toBe(encrypted2.iv);
  });

  it('should fail to decrypt with wrong key', () => {
    const plaintext = 'secret-data';
    const encrypted = service.encrypt(plaintext);
    
    // Tamper with auth tag
    const tampered = {
      ...encrypted,
      authTag: '0'.repeat(32),
    };
    
    expect(() => service.decrypt(tampered)).toThrow();
  });

  it('should hash data consistently', () => {
    const data = 'test-data';
    const hash1 = service.hash(data);
    const hash2 = service.hash(data);
    
    expect(hash1).toBe(hash2);
    expect(hash1.length).toBe(64); // SHA-256 hex length
  });

  it('should generate nonce', () => {
    const nonce1 = service.generateNonce();
    const nonce2 = service.generateNonce();
    
    expect(nonce1).toBeDefined();
    expect(nonce1.length).toBe(32); // 16 bytes hex
    expect(nonce1).not.toBe(nonce2);
  });
});
