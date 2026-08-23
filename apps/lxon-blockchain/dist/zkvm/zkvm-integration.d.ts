/**
 * zkVM Integration for LXON Blockchain
 *
 * Implements RISC-V Zero-Knowledge Virtual Machine support for:
 * - Privacy-preserving smart contract execution
 * - Verifiable off-chain computation
 * - Recursive SNARK compression
 * - Cross-chain bridging with proof verification
 * - General-purpose zero-knowledge proofs
 *
 * Based on next-generation zkVM architectures like:
 * - RISC Zero (RISC-V zkVM)
 * - SP1 (Scalar zkVM)
 * - Succinct Proofs
 *
 * This provides:
 * - Private smart contract execution
 * - Scalable off-chain computation
 * - Trustless cross-chain bridges
 * - Quantum-resistant cryptography foundation
 */
export interface RISCVProgram {
    binary: Buffer;
    entryPoint: number;
    memorySize: number;
    cycles: number;
}
export interface ZKVMInput {
    privateInput: Buffer;
    publicInput: Buffer;
    inputDescriptor: Buffer;
}
export interface ZKVMOutput {
    publicOutput: Buffer;
    exitCode: number;
    cyclesUsed: number;
}
export interface ZKVMProof {
    proof: Buffer;
    journal: Buffer;
    receipt: Buffer;
    cycles: number;
    verifyTime: number;
}
export declare class RISCVzkVM {
    /**
     * Execute RISC-V program and generate proof
     */
    execute(program: RISCVProgram, input: ZKVMInput): Promise<ZKVMProof>;
    /**
     * Verify zkVM proof
     */
    verifyProof(proof: ZKVMProof, publicInput: Buffer): Promise<boolean>;
    /**
     * Execute RISC-V program (simplified)
     */
    private executeProgram;
    /**
     * Generate zero-knowledge proof
     */
    private generateProof;
    /**
     * Create execution receipt
     */
    private createReceipt;
    /**
     * Verify receipt
     */
    private verifyReceipt;
    /**
     * Compress proof recursively (for large proofs)
     */
    compressProof(proof: ZKVMProof): Promise<ZKVMProof>;
    /**
     * Compress receipt
     */
    private compressReceipt;
}
export interface BridgeTransaction {
    sourceChain: string;
    targetChain: string;
    asset: string;
    amount: bigint;
    sender: string;
    recipient: string;
    proof: ZKVMProof;
    nonce: number;
}
export interface BridgeState {
    supportedChains: string[];
    pendingTransactions: Map<string, BridgeTransaction>;
    confirmedTransactions: Map<string, BridgeTransaction>;
    bridgeContracts: Map<string, string>;
}
export declare class ZKVMBridge {
    private state;
    private zkvm;
    constructor();
    /**
     * Initiate cross-chain transfer
     */
    initiateTransfer(sourceChain: string, targetChain: string, asset: string, amount: bigint, sender: string, recipient: string): Promise<{
        txId: string;
        proof: ZKVMProof;
    }>;
    /**
     * Complete cross-chain transfer
     */
    completeTransfer(txId: string): Promise<boolean>;
    /**
     * Create bridge program
     */
    private createBridgeProgram;
    /**
     * Generate transaction ID
     */
    private generateTxId;
    /**
     * Get bridge status
     */
    getBridgeStatus(): {
        supportedChains: string[];
        pendingTransfers: number;
        confirmedTransfers: number;
    };
}
export interface ZKContract {
    contractId: string;
    bytecode: Buffer;
    initialState: Buffer;
    verificationKey: Buffer;
}
export interface ZKContractCall {
    contractId: string;
    functionName: string;
    privateInput: Buffer;
    publicInput: Buffer;
    caller: string;
}
export interface ZKContractResult {
    output: Buffer;
    proof: ZKVMProof;
    gasUsed: number;
}
export declare class ZKContractExecutor {
    private contracts;
    private zkvm;
    constructor();
    /**
     * Deploy zero-knowledge contract
     */
    deployContract(bytecode: Buffer, initialState: Buffer): ZKContract;
    /**
     * Execute contract call with zero-knowledge proof
     */
    executeContract(call: ZKContractCall): Promise<ZKContractResult>;
    /**
     * Verify contract execution proof
     */
    verifyContractExecution(contractId: string, result: ZKContractResult): Promise<boolean>;
    /**
     * Generate contract ID
     */
    private generateContractId;
    /**
     * Generate verification key
     */
    private generateVerificationKey;
    /**
     * Get contract information
     */
    getContract(contractId: string): ZKContract | undefined;
    /**
     * Get all contracts
     */
    getAllContracts(): ZKContract[];
}
export interface ZKOracleQuery {
    oracleId: string;
    query: Buffer;
    dataSource: string;
    timestamp: number;
}
export interface ZKOracleResponse {
    queryId: string;
    response: Buffer;
    proof: ZKVMProof;
    timestamp: number;
}
export declare class ZKOracle {
    private queries;
    private responses;
    private zkvm;
    constructor();
    /**
     * Query oracle with zero-knowledge proof
     */
    queryOracle(oracleId: string, query: Buffer, dataSource: string): Promise<{
        queryId: string;
        proof: ZKVMProof;
    }>;
    /**
     * Submit oracle response with proof
     */
    submitResponse(queryId: string, response: Buffer, proof: ZKVMProof): Promise<boolean>;
    /**
     * Get oracle response
     */
    getResponse(queryId: string): ZKOracleResponse | undefined;
    /**
     * Create oracle program
     */
    private createOracleProgram;
    /**
     * Generate query ID
     */
    private generateQueryId;
}
export declare class ZKVMManager {
    private zkvm;
    private zkvmBridge;
    private contractExecutor;
    private zkvmOracle;
    constructor();
    /**
     * Execute zkVM program
     */
    execute(program: RISCVProgram, input: ZKVMInput): Promise<ZKVMProof>;
    /**
     * Verify zkVM proof
     */
    verifyProof(proof: ZKVMProof, publicInput: Buffer): Promise<boolean>;
    /**
     * Compress proof
     */
    compressProof(proof: ZKVMProof): Promise<ZKVMProof>;
    /**
     * Bridge operations
     */
    get bridge(): ZKVMBridge;
    /**
     * Contract operations
     */
    get contracts(): ZKContractExecutor;
    /**
     * Oracle operations
     */
    get oracle(): ZKOracle;
    /**
     * Get zkVM statistics
     */
    getStatistics(): {
        bridgeStatus: ReturnType<ZKVMBridge['getBridgeStatus']>;
        contractCount: number;
        oracleQueries: number;
        oracleResponses: number;
    };
    /**
     * Create standard zkVM program for common operations
     */
    createStandardProgram(operation: 'transfer' | 'swap' | 'vote' | 'compute'): RISCVProgram;
    /**
     * Get default cycles for operation
     */
    private getDefaultCycles;
    /**
     * Estimate execution cost
     */
    estimateCost(program: RISCVProgram): bigint;
    /**
     * Verify batch of proofs
     */
    verifyProofBatch(proofs: Array<{
        proof: ZKVMProof;
        publicInput: Buffer;
    }>): Promise<boolean[]>;
    /**
     * Create recursive proof composition
     */
    composeRecursiveProofs(proofs: ZKVMProof[]): Promise<ZKVMProof>;
    /**
     * Create combined receipt
     */
    private createCombinedReceipt;
}
