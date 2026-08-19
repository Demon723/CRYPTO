import { randomBytes, createCipheriv, createDecipheriv, scryptSync } from 'crypto';
import { sha256 } from '../crypto/hash';

export interface EncryptedTransaction {
  id: string;
  ciphertext: Uint8Array;
  nonce: Uint8Array;
  ephemeralPublicKey: Uint8Array;
  lockTime: number;
  threshold: number;
  total: number;
}

export interface TimeLockPuzzle {
  id: string;
  ciphertext: Uint8Array;
  solution: Uint8Array;
  timeParam: bigint;
}

export class EncryptedMempool {
  private pendingTransactions: Map<string, EncryptedTransaction> = new Map();
  private validatorShares: Map<string, Uint8Array> = new Map();
  private threshold: number;
  private totalValidators: number;

  constructor(threshold: number = 2, totalValidators: number = 3) {
    this.threshold = threshold;
    this.totalValidators = totalValidators;
  }

  submitEncrypted(transaction: EncryptedTransaction): void {
    if (transaction.lockTime > Date.now() / 1000) {
      this.pendingTransactions.set(transaction.id, transaction);
    }
  }

  decryptTransaction(id: string, shares: Uint8Array[]): Uint8Array | null {
    const tx = this.pendingTransactions.get(id);
    if (!tx) return null;

    if (shares.length < this.threshold) {
      return null;
    }

    try {
      const plaintext = this.combineShares(tx, shares);
      this.pendingTransactions.delete(id);
      return plaintext;
    } catch {
      return null;
    }
  }

  getRevealableTransactions(): EncryptedTransaction[] {
    const now = Math.floor(Date.now() / 1000);
    return Array.from(this.pendingTransactions.values()).filter(tx => tx.lockTime <= now);
  }

  private combineShares(tx: EncryptedTransaction, shares: Uint8Array[]): Uint8Array {
    const keyMaterial = Buffer.concat(shares.slice(0, this.threshold));
    const key = sha256(keyMaterial).subarray(0, 32);
    const decipher = createDecipheriv('aes-256-gcm', key, tx.nonce);
    const decrypted = Buffer.concat([decipher.update(tx.ciphertext), decipher.final()]);
    return decrypted;
  }
}

export class TimeLockPuzzleGenerator {
  static generate(message: Uint8Array, timeSeconds: number): TimeLockPuzzle {
    const iterations = Math.max(1000, timeSeconds * 1000);
    let current = sha256(message);
    for (let i = 0; i < iterations; i++) {
      current = sha256(current);
    }

    return {
      id: Buffer.from(sha256(message)).toString('hex'),
      ciphertext: current,
      solution: message,
      timeParam: BigInt(iterations),
    };
  }

  static verifySolution(puzzle: TimeLockPuzzle, claimedSolution: Uint8Array): boolean {
    let current = sha256(claimedSolution);
    for (let i = 0; i < Number(puzzle.timeParam); i++) {
      current = sha256(current);
    }
    return Buffer.from(current).equals(Buffer.from(puzzle.ciphertext));
  }
}

export class ThresholdDecryption {
  private validatorPrivateShares: Map<string, Uint8Array> = new Map();
  private publicKey: Uint8Array;

  constructor(publicKey: Uint8Array) {
    this.publicKey = publicKey;
  }

  registerValidatorShare(validatorId: string, share: Uint8Array): void {
    this.validatorPrivateShares.set(validatorId, share);
  }

  reconstructSecret(shares: Uint8Array[]): Uint8Array {
    const combined = Buffer.concat(shares.slice(0, Math.ceil(shares.length / 2) + 1));
    return sha256(combined).subarray(0, 32);
  }

  decrypt(encrypted: Uint8Array, shares: Uint8Array[]): Uint8Array | null {
    if (shares.length < Math.ceil(this.validatorPrivateShares.size / 2) + 1) {
      return null;
    }

    try {
      const key = this.reconstructSecret(shares);
      const nonce = encrypted.subarray(0, 12);
      const ciphertext = encrypted.subarray(12);
      const decipher = createDecipheriv('aes-256-gcm', key, nonce);
      return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    } catch {
      return null;
    }
  }
}
