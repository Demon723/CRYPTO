/**
 * SPV Verification with zk Proofs
 *
 * Lightweight client verification using Simplified Payment Verification (SPV)
 * with zero-knowledge proofs for efficient validation without full blockchain download.
 *
 * Designed for Raspberry Pi 4+ and other resource-constrained devices.
 */
export interface SPVHeader {
    blockNumber: number;
    blockHash: string;
    parentHash: string;
    timestamp: number;
    merkleRoot: string;
}
export interface SPVMerkleProof {
    blockHash: string;
    txIndex: number;
    merkleProof: string[];
    txHash: string;
}
export interface ZKProof {
    proof: string;
    publicInputs: string[];
    verificationKey: string;
}
export declare class SPVVerifier {
    private headers;
    private knownBlockHashes;
    private trustedCheckpoint;
    private zkVerifier;
    constructor();
    /**
     * Initialize SPV client with trusted checkpoint
     */
    initialize(checkpointBlock: number, checkpointHash: string): Promise<void>;
    /**
     * Add block header to SPV client
     */
    addHeader(header: SPVHeader): boolean;
    /**
     * Verify transaction using SPV
     */
    verifyTransaction(txHash: string, merkleProof: SPVMerkleProof): Promise<boolean>;
    /**
     * Verify transaction using zk proof (lightweight alternative)
     */
    verifyTransactionWithZKProof(txHash: string, zkProof: ZKProof): Promise<boolean>;
    /**
     * Verify merkle proof
     */
    private verifyMerkleProof;
    /**
     * Get light client sync progress
     */
    getSyncProgress(): {
        currentBlock: number;
        highestBlock: number;
        progress: number;
    };
    /**
     * Get required storage for SPV client
     */
    getStorageRequirement(): {
        headersSize: number;
        totalSize: number;
    };
    /**
     * Prune old headers to save space
     */
    pruneHeaders(keepRecent: number): void;
    /**
     * Find block number by hash
     */
    private findBlockNumberByHash;
}
/**
 * Zero-Knowledge Proof Verifier
 *
 * Verifies zk proofs for transaction validity without downloading full blockchain
 */
export declare class ZKProofVerifier {
    /**
     * Verify zk proof
     */
    verifyProof(zkProof: ZKProof): Promise<boolean>;
    /**
     * Verify proof structure
     */
    private verifyProofStructure;
    /**
     * Generate verification key from circuit
     */
    generateVerificationKey(circuit: string): Promise<string>;
    /**
     * Estimate zk proof verification time
     */
    estimateVerificationTime(): number;
    /**
     * Get memory requirement for zk verification
     */
    getMemoryRequirement(): number;
}
/**
 * Lightweight Client Configuration
 */
export interface LightweightClientConfig {
    trustedCheckpointBlock: number;
    trustedCheckpointHash: string;
    maxHeaders: number;
    enableZKProofs: boolean;
    pruneInterval: number;
    resourceLimits: {
        maxMemoryMB: number;
        maxStorageMB: number;
    };
}
/**
 * Lightweight Client
 *
 * Full lightweight client implementation for Raspberry Pi
 */
export declare class LightweightClient {
    private spvVerifier;
    private config;
    private memoryUsage;
    private storageUsage;
    constructor(config: LightweightClientConfig);
    /**
     * Initialize lightweight client
     */
    initialize(): Promise<void>;
    /**
     * Sync headers (Raspberry Pi optimized)
     */
    syncHeaders(): Promise<void>;
    /**
     * Verify transaction
     */
    verifyTransaction(txHash: string, merkleProof: SPVMerkleProof): Promise<boolean>;
    /**
     * Get resource usage
     */
    getResourceUsage(): {
        memoryMB: number;
        storageMB: number;
        cpuPercent: number;
    };
    /**
     * Check if within resource limits
     */
    isWithinResourceLimits(): boolean;
    /**
     * Prune if exceeding limits
     */
    pruneIfNeeded(): void;
}
