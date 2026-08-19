import { ethers } from 'ethers';
import { HybridStateManager } from './modules/UTXO';
import { FeeMarket } from './modules/FeeMarket';
import { EnhancedScripting } from './modules/Scripting';
import { QuantumResistantCrypto } from './modules/QuantumCrypto';
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
export class LXONClient {
  private provider: ethers.JsonRpcProvider;
  private signer: ethers.Signer | null;
  private utxoManager: HybridStateManager;
  private feeMarket: FeeMarket;
  private scripting: EnhancedScripting;
  private quantumCrypto: QuantumResistantCrypto;
  private helios: HeliosModule | null;
  private connected: boolean;

  /**
   * LXON Client configuration
   */
  constructor(config: LXONClientConfig) {
    this.provider = new ethers.JsonRpcProvider(config.rpcUrl);
    this.signer = config.signer || null;
    this.connected = false;
    this.helios = null;

    // Initialize modules
    this.utxoManager = new HybridStateManager();
    this.feeMarket = new FeeMarket();
    this.scripting = new EnhancedScripting();
    this.quantumCrypto = new QuantumResistantCrypto();

    if (config.helios) {
      this.helios = new HeliosModule(config.helios);
    }
  }

  /**
   * Connect to the LXON network
   */
  async connect(): Promise<void> {
    try {
      await this.provider.getNetwork();
      this.connected = true;
    } catch (error) {
      throw new Error(`Failed to connect to LXON network: ${error}`);
    }
  }

  /**
   * Check if client is connected
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Get network information
   */
  async getNetworkInfo(): Promise<NetworkInfo> {
    if (!this.connected) {
      throw new Error('Client not connected');
    }

    const network = await this.provider.getNetwork();
    const blockNumber = await this.provider.getBlockNumber();
    const block = await this.provider.getBlock(blockNumber);

    return {
      chainId: Number(network.chainId),
      name: network.name,
      blockNumber,
      blockHash: block?.hash ?? undefined,
      blockTimestamp: block?.timestamp ? Number(block.timestamp) : 0
    };
  }

  /**
   * Get account balance (hybrid UTXO + Account model)
   */
  async getBalance(address: string): Promise<BalanceInfo> {
    if (!this.connected) {
      throw new Error('Client not connected');
    }

    const balance = await this.provider.getBalance(address);
    const utxoBalance = this.utxoManager.getAccountBalance(address);
    const totalBalance = balance + utxoBalance;

    return {
      address,
      accountBalance: balance,
      utxoBalance,
      totalBalance
    };
  }

  /**
   * Estimate transaction fee
   */
  async estimateFee(confirmations: number = 6): Promise<FeeEstimate> {
    if (!this.connected) {
      throw new Error('Client not connected');
    }

    const latestBlock = await this.provider.getBlock('latest');
    const mempoolSize = 1000; // Would get from actual mempool

    const feePerGas = await this.provider.getFeeData();
    const estimatedFee = this.feeMarket.estimateFee(mempoolSize, confirmations);

    return {
      gasPrice: feePerGas.gasPrice?.toString() || '0',
      maxFeePerGas: feePerGas.maxFeePerGas?.toString() || '0',
      maxPriorityFeePerGas: feePerGas.maxPriorityFeePerGas?.toString() || '0',
      estimatedFee: estimatedFee.toString(),
      confirmations
    };
  }

  /**
   * Create and sign transaction
   */
  async createTransaction(tx: TransactionRequest): Promise<string> {
    if (!this.signer) {
      throw new Error('No signer configured');
    }

    const feeEstimate = await this.estimateFee(6);
    const transaction = {
      ...tx,
      gasPrice: feeEstimate.gasPrice
    };

    const signedTx = await this.signer.signTransaction(transaction);
    return signedTx;
  }

  /**
   * Send transaction
   */
  async sendTransaction(signedTx: string): Promise<TransactionResponse> {
    if (!this.connected) {
      throw new Error('Client not connected');
    }

    const txHash = await this.provider.send('eth_sendRawTransaction', [signedTx]);
    const receipt = await this.provider.getTransactionReceipt(txHash);

    return {
      hash: txHash,
      blockNumber: receipt?.blockNumber || 0,
      gasUsed: receipt?.gasUsed?.toString() || '0',
      status: receipt?.status === 1 ? 'success' : 'failed'
    };
  }

  /**
   * Create UTXO
   */
  createUTXO(txId: string, outputIndex: number, amount: bigint, owner: string): UTXO {
    return this.utxoManager.createUTXO(txId, outputIndex, amount, owner);
  }

  /**
   * Spend UTXO
   */
  spendUTXO(txId: string, outputIndex: number): void {
    this.utxoManager.spendUTXO(txId, outputIndex);
  }

  /**
   * Compile Miniscript
   */
  compileMiniscript(miniscript: string): string {
    return this.scripting.compileMiniscript(miniscript);
  }

  /**
   * Generate hybrid key pair (quantum-resistant)
   */
  generateHybridKeyPair(): HybridKeyPair {
    return this.quantumCrypto.generateHybridKeyPair();
  }

  /**
   * Sign message with hybrid signature
   */
  signHybrid(keyPair: HybridKeyPair, message: string): HybridSignature {
    return this.quantumCrypto.signHybrid(keyPair, message);
  }

  /**
   * Verify hybrid signature
   */
  verifyHybrid(keyPair: HybridKeyPair, message: string, signature: HybridSignature): boolean {
    return this.quantumCrypto.verifyHybrid(keyPair, message, signature);
  }

  /**
   * Disconnect from network
   */
  disconnect(): void {
    this.connected = false;
  }

  /**
   * Get Helios module for PBT/TBA/card operations
   */
  getHelios(): HeliosModule | null {
    return this.helios;
  }
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