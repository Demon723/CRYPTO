/**
 * Quantum-Resistant Cryptography Module
 *
 * Hybrid signatures, lattice-based cryptography, and hash-based signatures
 */
export declare class QuantumResistantCrypto {
    private keyCounter;
    generateHybridKeyPair(): any;
    signHybrid(keyPair: any, message: string): any;
    verifyHybrid(keyPair: any, message: string, signature: any): boolean;
    generateLatticeKeyPair(): any;
    signLattice(keyPair: any, message: string): string;
    verifyLattice(publicKey: string, message: string, signature: string): boolean;
    generateHashBasedKeyPair(): any;
    signHashBased(keyPair: any, message: string): string;
    verifyHashBased(publicKey: string, message: string, signature: string): boolean;
    getRemainingSignatures(keyPair: any): number;
    encryptPostQuantum(publicKey: string, plaintext: string): string;
    decryptPostQuantum(privateKey: string, ciphertext: string): string;
    performKeyExchange(keyPair1: any, publicKey2: string): string;
    deriveSymmetricKey(sharedSecret: string): string;
    validateKeyStrength(keyPair: any): number;
    detectQuantumVulnerability(keyPair: any): boolean;
    generateClassicalKey(): string;
    generatePostQuantumKey(): string;
    signClassical(key: string, message: string): string;
    verifyClassical(key: string, message: string, signature: string): boolean;
    signPostQuantum(key: string, message: string): string;
    verifyPostQuantum(key: string, message: string, signature: string): boolean;
    generateLatticePublicKey(): string;
    generateLatticePrivateKey(): string;
    generateHashBasedPublicKey(): string;
    generateHashBasedPrivateKey(): string;
    createHybridFromMigration(classicalKey: any, postQuantumKey: any): any;
    validateHybridKey(keyPair: any): boolean;
}
//# sourceMappingURL=QuantumCrypto.d.ts.map