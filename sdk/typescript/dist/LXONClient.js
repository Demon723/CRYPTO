"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LXONClient = void 0;
const ethers_1 = require("ethers");
const UTXO_1 = require("./modules/UTXO");
const FeeMarket_1 = require("./modules/FeeMarket");
const Scripting_1 = require("./modules/Scripting");
const QuantumCrypto_1 = require("./modules/QuantumCrypto");
const Helios_1 = require("./modules/Helios");
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
class LXONClient {
    /**
     * LXON Client configuration
     */
    constructor(config) {
        this.provider = new ethers_1.ethers.JsonRpcProvider(config.rpcUrl);
        this.signer = config.signer || null;
        this.connected = false;
        this.helios = null;
        // Initialize modules
        this.utxoManager = new UTXO_1.HybridStateManager();
        this.feeMarket = new FeeMarket_1.FeeMarket();
        this.scripting = new Scripting_1.EnhancedScripting();
        this.quantumCrypto = new QuantumCrypto_1.QuantumResistantCrypto();
        if (config.helios) {
            this.helios = new Helios_1.HeliosModule(config.helios);
        }
    }
    /**
     * Connect to the LXON network
     */
    async connect() {
        try {
            await this.provider.getNetwork();
            this.connected = true;
        }
        catch (error) {
            throw new Error(`Failed to connect to LXON network: ${error}`);
        }
    }
    /**
     * Check if client is connected
     */
    isConnected() {
        return this.connected;
    }
    /**
     * Get network information
     */
    async getNetworkInfo() {
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
    async getBalance(address) {
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
    async estimateFee(confirmations = 6) {
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
    async createTransaction(tx) {
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
    async sendTransaction(signedTx) {
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
    createUTXO(txId, outputIndex, amount, owner) {
        return this.utxoManager.createUTXO(txId, outputIndex, amount, owner);
    }
    /**
     * Spend UTXO
     */
    spendUTXO(txId, outputIndex) {
        this.utxoManager.spendUTXO(txId, outputIndex);
    }
    /**
     * Compile Miniscript
     */
    compileMiniscript(miniscript) {
        return this.scripting.compileMiniscript(miniscript);
    }
    /**
     * Generate hybrid key pair (quantum-resistant)
     */
    generateHybridKeyPair() {
        return this.quantumCrypto.generateHybridKeyPair();
    }
    /**
     * Sign message with hybrid signature
     */
    signHybrid(keyPair, message) {
        return this.quantumCrypto.signHybrid(keyPair, message);
    }
    /**
     * Verify hybrid signature
     */
    verifyHybrid(keyPair, message, signature) {
        return this.quantumCrypto.verifyHybrid(keyPair, message, signature);
    }
    /**
     * Disconnect from network
     */
    disconnect() {
        this.connected = false;
    }
    /**
     * Get Helios module for PBT/TBA/card operations
     */
    getHelios() {
        return this.helios;
    }
}
exports.LXONClient = LXONClient;
//# sourceMappingURL=LXONClient.js.map