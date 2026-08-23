/**
 * Hybrid State Manager for LXON Blockchain
 *
 * Integrates Bitcoin-style UTXO model with account-based state
 * to enhance parallelization and privacy while maintaining smart contract flexibility.
 *
 * UTXO Benefits:
 * - Parallel validation of independent transactions
 * - Enhanced privacy through address reuse prevention
 * - Proven security model from Bitcoin
 *
 * Account Model Benefits:
 * - Smart contract compatibility
 * - DeFi composability
 * - Developer familiarity
 */
export interface UTXO {
    txid: string;
    outputIndex: number;
    value: bigint;
    lockingScript: Buffer;
    address: string;
    blockHeight: number;
    confirmations: number;
    isCoinbase: boolean;
    scriptType: 'p2pkh' | 'p2sh' | 'p2wpkh' | 'p2wsh' | 'p2tr' | 'lxon-contract';
}
export interface UTXOKey {
    txid: string;
    outputIndex: number;
}
export interface AccountState {
    address: string;
    balance: bigint;
    nonce: number;
    contractCode?: Buffer;
    storageRoot: string;
}
export interface TransactionInput {
    utxoKey: UTXOKey;
    unlockingScript: Buffer;
    sequence: number;
    witness?: Buffer[];
}
export interface TransactionOutput {
    value: bigint;
    lockingScript: Buffer;
    address: string;
    scriptType: 'p2pkh' | 'p2sh' | 'p2wpkh' | 'p2wsh' | 'p2tr' | 'lxon-contract';
}
export interface HybridTransaction {
    txid?: string;
    version: number;
    inputs: TransactionInput[];
    outputs: TransactionOutput[];
    locktime: number;
    witness?: Buffer[][];
    isUTXOBased: boolean;
    contractCall?: {
        toAddress: string;
        data: Buffer;
        value: bigint;
    };
}
export declare class HybridStateManager {
    private utxoSet;
    private accountState;
    private utxoIndex;
    private blockHeight;
    /**
     * Generate UTXO key for map lookup
     */
    private utxoKeyToString;
    /**
     * Add a new UTXO to the set (from transaction output)
     */
    addUTXO(utxo: UTXO): void;
    /**
     * Spend a UTXO (remove from set)
     */
    spendUTXO(key: UTXOKey): boolean;
    /**
     * Get UTXO by key
     */
    getUTXO(key: UTXOKey): UTXO | undefined;
    /**
     * Get all UTXOs for an address (like Bitcoin's wallet scanning)
     */
    getUTXOsForAddress(address: string): UTXO[];
    /**
     * Get account balance (sum of all UTXOs + account balance)
     */
    getAddressBalance(address: string): bigint;
    /**
     * Update account state (for smart contracts)
     */
    updateAccountState(address: string, updates: Partial<AccountState>): void;
    /**
     * Get account state
     */
    getAccountState(address: string): AccountState | undefined;
    /**
     * Validate UTXO spend (Bitcoin-style validation)
     */
    validateUTXOSpend(input: TransactionInput, expectedValue: bigint): boolean;
    /**
     * Verify script (simplified Bitcoin script validation)
     */
    private verifyScript;
    private verifyP2PKH;
    private verifyP2WPKH;
    private verifyP2TR;
    /**
     * Hash160 (RIPEMD160(SHA256(data))) - Bitcoin standard
     */
    private hash160;
    /**
     * Double SHA256 (Bitcoin standard)
     */
    private doubleSha256;
    /**
     * Empty storage root hash
     */
    private emptyStorageRoot;
    /**
     * Process a hybrid transaction
     */
    processTransaction(tx: HybridTransaction): {
        success: boolean;
        error?: string;
    };
    /**
     * Compute transaction ID (Bitcoin style)
     */
    private computeTransactionID;
    /**
     * Serialize transaction for hashing
     */
    private serializeTransaction;
    /**
     * Convert bigint to 64-bit little-endian buffer
     */
    private bigIntToLE;
    /**
     * Set current block height
     */
    setBlockHeight(height: number): void;
    /**
     * Get current block height
     */
    getBlockHeight(): number;
    /**
     * Get UTXO set statistics
     */
    getStatistics(): {
        totalUTXOs: number;
        totalValue: bigint;
        totalAccounts: number;
        blockHeight: number;
    };
    /**
     * Parallel validation of independent UTXO spends
     * This is where UTXO model shines - independent txs can be validated in parallel
     */
    validateUTXOSpendsParallel(inputs: TransactionInput[]): Promise<boolean[]>;
    /**
     * Create coinbase transaction (like Bitcoin)
     */
    createCoinbaseTransaction(minerAddress: string, blockReward: bigint, blockHeight: number): HybridTransaction;
    /**
     * Create P2PKH locking script
     */
    private createP2PKHScript;
    /**
     * Decode address to hash (simplified)
     */
    private decodeAddressToHash;
    /**
     * Prune spent UTXOs below a certain block height (for storage optimization)
     */
    pruneOldUTXOs(maxBlockHeight: number): number;
}
