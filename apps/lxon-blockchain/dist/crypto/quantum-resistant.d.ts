/**
 * Quantum-Resistant Cryptography for LXON Blockchain
 *
 * Implements post-quantum cryptographic algorithms to protect against
 * future quantum computer attacks that could break classical cryptography:
 * - Lattice-based cryptography (Kyber, Dilithium)
 * - Hash-based signatures (XMSS, SPHINCS+)
 * - Code-based cryptography (McEliece)
 * - Multivariate cryptography (Rainbow)
 * - Isogeny-based cryptography (SIKE)
 * - Hybrid classical/post-quantum schemes
 *
 * This provides:
 * - Long-term security against quantum attacks
 * - Gradual migration path from classical to post-quantum
 * - Hybrid schemes for immediate security improvements
 * - Compatibility with existing systems during transition
 */
export interface HybridSignature {
    classicalSignature: Buffer;
    postQuantumSignature: Buffer;
    publicKey: Buffer;
    algorithmId: number;
}
export interface HybridPublicKey {
    classicalKey: Buffer;
    postQuantumKey: Buffer;
    algorithmId: number;
}
export declare class HybridSigner {
    /**
     * Generate hybrid key pair
     */
    generateKeyPair(): {
        privateKey: Buffer;
        publicKey: HybridPublicKey;
    };
    /**
     * Sign message with hybrid scheme
     */
    sign(message: Buffer, privateKey: Buffer): HybridSignature;
    /**
     * Verify hybrid signature
     */
    verify(message: Buffer, signature: HybridSignature, publicKey: HybridPublicKey): boolean;
    /**
     * Derive classical public key from private key
     */
    private deriveClassicalPublicKey;
    /**
     * Sign with ECDSA (classical)
     */
    private signECDSA;
    /**
     * Verify ECDSA signature
     */
    private verifyECDSA;
    /**
     * Generate Dilithium key pair (post-quantum)
     */
    private generateDilithiumKeyPair;
    /**
     * Sign with Dilithium (post-quantum)
     */
    private signDilithium;
    /**
     * Verify Dilithium signature
     */
    private verifyDilithium;
}
export interface KyberKeyPair {
    publicKey: Buffer;
    privateKey: Buffer;
}
export interface KyberCiphertext {
    ciphertext: Buffer;
    encapsulatedKey: Buffer;
}
export declare class KyberKEM {
    /**
     * Generate Kyber key pair
     */
    generateKeyPair(): KyberKeyPair;
    /**
     * Encapsulate shared secret
     */
    encapsulate(publicKey: Buffer): {
        ciphertext: KyberCiphertext;
        sharedSecret: Buffer;
    };
    /**
     * Decapsulate shared secret
     */
    decapsulate(ciphertext: KyberCiphertext, privateKey: Buffer): Buffer;
    /**
     * Generate lattice public key
     */
    private generateLatticePublicKey;
    /**
     * Generate lattice matrix
     */
    private generateLatticeMatrix;
    /**
     * Encrypt with lattice
     */
    private encryptLattice;
    /**
     * Decrypt with lattice
     */
    private decryptLattice;
}
export interface XMSSKeyPair {
    publicKey: Buffer;
    privateKey: Buffer;
    treeHeight: number;
}
export interface XMSSSignature {
    signature: Buffer;
    index: number;
    authPath: Buffer[];
}
export declare class XMSSSigner {
    private treeHeight;
    /**
     * Generate XMSS key pair
     */
    generateKeyPair(): XMSSKeyPair;
    /**
     * Sign with XMSS
     */
    sign(message: Buffer, privateKey: Buffer, index: number): XMSSSignature;
    /**
     * Verify XMSS signature
     */
    verify(message: Buffer, signature: XMSSSignature, publicKey: Buffer): boolean;
    /**
     * Generate XMSS private key
     */
    private generateXMSSPrivateKey;
    /**
     * Derive XMSS public key
     */
    private deriveXMSSPublicKey;
    /**
     * Generate one-time signature
     */
    private generateOneTimeSignature;
    /**
     * Verify one-time signature
     */
    private verifyOneTimeSignature;
    /**
     * Generate authentication path
     */
    private generateAuthPath;
    /**
     * Verify authentication path
     */
    private verifyAuthPath;
}
export interface McElieceKeyPair {
    publicKey: Buffer;
    privateKey: Buffer;
    parameters: {
        n: number;
        k: number;
        t: number;
    };
}
export declare class McElieceEncryptor {
    private parameters;
    /**
     * Generate McEliece key pair
     */
    generateKeyPair(): McElieceKeyPair;
    /**
     * Encrypt message
     */
    encrypt(message: Buffer, publicKey: Buffer): Buffer;
    /**
     * Decrypt message
     */
    decrypt(ciphertext: Buffer, privateKey: Buffer): Buffer;
    /**
     * Generate private key
     */
    private generatePrivateKey;
    /**
     * Derive public key from private key
     */
    private derivePublicKey;
    /**
     * Generate parity check matrix
     */
    private generateParityCheckMatrix;
    /**
     * Generate permutation
     */
    private generatePermutation;
    /**
     * Pad message to required length
     */
    private padMessage;
    /**
     * Unpad message
     */
    private unpadMessage;
    /**
     * Apply error vector
     */
    private applyErrorVector;
    /**
     * Generate error vector
     */
    private generateErrorVector;
    /**
     * Correct errors using private key
     */
    private correctErrors;
}
export interface QuantumResistantKEX {
    algorithm: 'kyber' | 'mceliece' | 'hybrid';
    keyPair: any;
    encapsulate: (publicKey: Buffer) => {
        ciphertext: Buffer;
        sharedSecret: Buffer;
    };
    decapsulate: (ciphertext: Buffer, privateKey: Buffer) => Buffer;
}
export declare class QuantumKeyExchange {
    private kyber;
    private mceliece;
    constructor();
    /**
     * Perform quantum-resistant key exchange
     */
    performKeyExchange(algorithm?: 'kyber' | 'mceliece' | 'hybrid'): {
        localKeyPair: any;
        sharedSecret: Buffer;
        outgoingData: Buffer;
    };
    /**
     * Complete key exchange (receive side)
     */
    completeKeyExchange(incomingData: Buffer, privateKey: any, algorithm?: 'kyber' | 'mceliece' | 'hybrid'): Buffer;
}
export declare class QuantumResistantManager {
    private hybridSigner;
    private xmssSigner;
    private keyExchange;
    constructor();
    /**
     * Generate quantum-resistant key pair
     */
    generateKeyPair(scheme?: 'hybrid' | 'xmss'): any;
    /**
     * Sign message with quantum-resistant scheme
     */
    sign(message: Buffer, privateKey: Buffer, scheme?: 'hybrid' | 'xmss', index?: number): any;
    /**
     * Verify quantum-resistant signature
     */
    verify(message: Buffer, signature: any, publicKey: any, scheme?: 'hybrid' | 'xmss'): boolean;
    /**
     * Perform quantum-resistant key exchange
     */
    performKeyExchange(algorithm?: 'kyber' | 'mceliece' | 'hybrid'): any;
    /**
     * Complete quantum-resistant key exchange
     */
    completeKeyExchange(incomingData: Buffer, privateKey: any, algorithm?: 'kyber' | 'mceliece' | 'hybrid'): Buffer;
    /**
     * Get quantum-resistant capabilities
     */
    getCapabilities(): {
        supportedSchemes: string[];
        defaultScheme: string;
        securityLevel: string;
        nistStatus: string;
    };
    /**
     * Migrate classical key to quantum-resistant
     */
    migrateKey(classicalPrivateKey: Buffer): Buffer;
    /**
     * Verify migration compatibility
     */
    verifyMigrationCompatibility(oldKey: Buffer, newKey: Buffer): boolean;
    /**
     * Get quantum security recommendations
     */
    getSecurityRecommendations(): {
        recommendedScheme: string;
        keySize: number;
        signatureSize: number;
        migrationTimeline: string;
    };
}
