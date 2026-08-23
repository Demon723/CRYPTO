"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThresholdDecryption = exports.TimeLockPuzzleGenerator = exports.EncryptedMempool = void 0;
const crypto_1 = require("crypto");
const hash_1 = require("../crypto/hash");
class EncryptedMempool {
    pendingTransactions = new Map();
    validatorShares = new Map();
    threshold;
    totalValidators;
    constructor(threshold = 2, totalValidators = 3) {
        this.threshold = threshold;
        this.totalValidators = totalValidators;
    }
    submitEncrypted(transaction) {
        if (transaction.lockTime > Date.now() / 1000) {
            this.pendingTransactions.set(transaction.id, transaction);
        }
    }
    decryptTransaction(id, shares) {
        const tx = this.pendingTransactions.get(id);
        if (!tx)
            return null;
        if (shares.length < this.threshold) {
            return null;
        }
        try {
            const plaintext = this.combineShares(tx, shares);
            this.pendingTransactions.delete(id);
            return plaintext;
        }
        catch {
            return null;
        }
    }
    getRevealableTransactions() {
        const now = Math.floor(Date.now() / 1000);
        return Array.from(this.pendingTransactions.values()).filter(tx => tx.lockTime <= now);
    }
    combineShares(tx, shares) {
        const keyMaterial = Buffer.concat(shares.slice(0, this.threshold));
        const key = (0, hash_1.sha256)(keyMaterial).subarray(0, 32);
        const decipher = (0, crypto_1.createDecipheriv)('aes-256-gcm', key, tx.nonce);
        const decrypted = Buffer.concat([decipher.update(tx.ciphertext), decipher.final()]);
        return decrypted;
    }
}
exports.EncryptedMempool = EncryptedMempool;
class TimeLockPuzzleGenerator {
    static generate(message, timeSeconds) {
        const iterations = Math.max(1000, timeSeconds * 1000);
        let current = (0, hash_1.sha256)(message);
        for (let i = 0; i < iterations; i++) {
            current = (0, hash_1.sha256)(current);
        }
        return {
            id: Buffer.from((0, hash_1.sha256)(message)).toString('hex'),
            ciphertext: current,
            solution: message,
            timeParam: BigInt(iterations),
        };
    }
    static verifySolution(puzzle, claimedSolution) {
        let current = (0, hash_1.sha256)(claimedSolution);
        for (let i = 0; i < Number(puzzle.timeParam); i++) {
            current = (0, hash_1.sha256)(current);
        }
        return Buffer.from(current).equals(Buffer.from(puzzle.ciphertext));
    }
}
exports.TimeLockPuzzleGenerator = TimeLockPuzzleGenerator;
class ThresholdDecryption {
    validatorPrivateShares = new Map();
    publicKey;
    constructor(publicKey) {
        this.publicKey = publicKey;
    }
    registerValidatorShare(validatorId, share) {
        this.validatorPrivateShares.set(validatorId, share);
    }
    reconstructSecret(shares) {
        const combined = Buffer.concat(shares.slice(0, Math.ceil(shares.length / 2) + 1));
        return (0, hash_1.sha256)(combined).subarray(0, 32);
    }
    decrypt(encrypted, shares) {
        if (shares.length < Math.ceil(this.validatorPrivateShares.size / 2) + 1) {
            return null;
        }
        try {
            const key = this.reconstructSecret(shares);
            const nonce = encrypted.subarray(0, 12);
            const ciphertext = encrypted.subarray(12);
            const decipher = (0, crypto_1.createDecipheriv)('aes-256-gcm', key, nonce);
            return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
        }
        catch {
            return null;
        }
    }
}
exports.ThresholdDecryption = ThresholdDecryption;
