import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';

export interface EncryptedPayload {
  ciphertext: string;
  iv: string;
  authTag: string;
}

@Injectable()
export class CryptoService {
  private readonly logger = new Logger(CryptoService.name);
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32;
  private readonly ivLength = 16;
  private readonly tagLength = 16;
  private readonly ownerKey: Buffer;

  constructor() {
    const secret = process.env.SYNEX_OWNER_KEY;
    
    if (!secret) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('SYNEX_OWNER_KEY environment variable is required in production');
      }
      // Development fallback with warning
      this.logger.warn('SYNEX_OWNER_KEY not set. Using development fallback key. DO NOT USE IN PRODUCTION.');
      this.ownerKey = crypto.scryptSync('synex-dev-only-key-change-in-production', 'owner-salt', this.keyLength);
    } else {
      this.ownerKey = crypto.scryptSync(secret, 'owner-salt', this.keyLength);
      this.logger.log('Owner encryption key loaded from SYNEX_OWNER_KEY environment variable');
    }
  }

  encrypt(plaintext: string): EncryptedPayload {
    const iv = crypto.randomBytes(this.ivLength);
    const cipher = crypto.createCipheriv(this.algorithm, this.ownerKey, iv);
    
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      ciphertext: encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
    };
  }

  decrypt(payload: EncryptedPayload): string {
    const decipher = crypto.createDecipheriv(
      this.algorithm,
      this.ownerKey,
      Buffer.from(payload.iv, 'hex'),
    );
    
    decipher.setAuthTag(Buffer.from(payload.authTag, 'hex'));
    
    let decrypted = decipher.update(payload.ciphertext, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  encryptObject(obj: Record<string, any>): EncryptedPayload {
    return this.encrypt(JSON.stringify(obj));
  }

  decryptObject<T = any>(payload: EncryptedPayload): T {
    const decrypted = this.decrypt(payload);
    return JSON.parse(decrypted) as T;
  }

  hash(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  generateNonce(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  verifyHash(data: string, expectedHash: string): boolean {
    const computedHash = this.hash(data);
    return crypto.timingSafeEqual(
      Buffer.from(computedHash),
      Buffer.from(expectedHash),
    );
  }
}
