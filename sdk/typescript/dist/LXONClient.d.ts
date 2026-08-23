import { ethers } from 'ethers';
import { HeliosModule, HeliosConfig } from './modules/Helios';
/**
 * LXON TypeScript SDK
 *
 * A comprehensive TypeScript SDK for interacting with the LXON blockchain.
 * Supports UTXO model, fee market, enhanced scripting, and quantum-resistant cryptography.
 *
 * @example
 * ```typescript
 * const client = new LXONClient({
 *   rpcUrl: 'https://lxon.network/rpc',
 *   chainId: 1
 * });
 *
 * await client.connect();
 * const balance = await client.getBalance('0x...');
 * ```
 */
export declare class LXONClient {
    private provider;
    private signer;
    private utxoManager;
    private feeMarket;
    private scripting;
    private quantumCrypto;
    private helios;
    private connected;
    /**
     * LXON Client configuration
     */
    constructor(config: LXONClientConfig);
    /**
     * Connect to the LXON network
     */
    connect(): Promise<void>;
    /**
     * Check if client is connected
     */
    isConnected(): boolean;
    /**
     * Get network information
     */
    getNetworkInfo(): Promise<NetworkInfo>;
    /**
     * Get account balance (hybrid UTXO + Account model)
     */
    getBalance(address: string): Promise<BalanceInfo>;
    /**
     * Estimate transaction fee
     */
    estimateFee(confirmations?: number): Promise<FeeEstimate>;
    /**
     * Create and sign transaction
     */
    createTransaction(tx: TransactionRequest): Promise<string>;
    /**
     * Send transaction
     */
    sendTransaction(signedTx: string): Promise<TransactionResponse>;
    /**
     * Create UTXO
     */
    createUTXO(txId: string, outputIndex: number, amount: bigint, owner: string): UTXO;
    /**
     * Spend UTXO
     */
    spendUTXO(txId: string, outputIndex: number): void;
    /**
     * Compile Miniscript
     */
    compileMiniscript(miniscript: string): string;
    /**
     * Generate hybrid key pair (quantum-resistant)
     */
    generateHybridKeyPair(): HybridKeyPair;
    /**
     * Sign message with hybrid signature
     */
    signHybrid(keyPair: HybridKeyPair, message: string): HybridSignature;
    /**
     * Verify hybrid signature
     */
    verifyHybrid(keyPair: HybridKeyPair, message: string, signature: HybridSignature): boolean;
    /**
     * Disconnect from network
     */
    disconnect(): void;
    /**
     * Get Helios module for PBT/TBA/card operations
     */
    getHelios(): HeliosModule | null;
}
/**
 * Configuration for LXON Client
 */
export interface LXONClientConfig {
    rpcUrl: string;
    chainId?: number;
    signer?: ethers.Signer;
    helios?: HeliosConfig;
}
/**
 * Network information
 */
export interface NetworkInfo {
    chainId: number;
    name: string;
    blockNumber: number;
    blockHash?: string;
    blockTimestamp: number;
}
/**
 * Balance information
 */
export interface BalanceInfo {
    address: string;
    accountBalance: bigint;
    utxoBalance: bigint;
    totalBalance: bigint;
}
/**
 * Fee estimate
 */
export interface FeeEstimate {
    gasPrice: string;
    maxFeePerGas: string;
    maxPriorityFeePerGas: string;
    estimatedFee: string;
    confirmations: number;
}
/**
 * Transaction request
 */
export interface TransactionRequest {
    to: string;
    value?: string;
    data?: string;
    gasLimit?: string;
}
/**
 * Transaction response
 */
export interface TransactionResponse {
    hash: string;
    blockNumber: number;
    gasUsed: string;
    status: 'success' | 'failed';
}
/**
 * UTXO
 */
export interface UTXO {
    txId: string;
    outputIndex: number;
    amount: bigint;
    owner: string;
    spent: boolean;
}
/**
 * Hybrid key pair
 */
export interface HybridKeyPair {
    classicalKey: string;
    postQuantumKey: string;
}
/**
 * Hybrid signature
 */
export interface HybridSignature {
    classicalSignature: string;
    postQuantumSignature: string;
}
//# sourceMappingURL=LXONClient.d.ts.map