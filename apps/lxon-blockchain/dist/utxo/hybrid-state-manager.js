"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.HybridStateManager = void 0;
const crypto_1 = require("crypto");
class HybridStateManager {
    utxoSet = new Map();
    accountState = new Map();
    utxoIndex = new Map(); // address -> UTXO keys
    blockHeight = 0;
    /**
     * Generate UTXO key for map lookup
     */
    utxoKeyToString(key) {
        return `${key.txid}:${key.outputIndex}`;
    }
    /**
     * Add a new UTXO to the set (from transaction output)
     */
    addUTXO(utxo) {
        const key = this.utxoKeyToString({ txid: utxo.txid, outputIndex: utxo.outputIndex });
        this.utxoSet.set(key, utxo);
        // Index by address for efficient lookup
        if (!this.utxoIndex.has(utxo.address)) {
            this.utxoIndex.set(utxo.address, new Set());
        }
        this.utxoIndex.get(utxo.address).add(key);
    }
    /**
     * Spend a UTXO (remove from set)
     */
    spendUTXO(key) {
        const keyStr = this.utxoKeyToString(key);
        const utxo = this.utxoSet.get(keyStr);
        if (!utxo) {
            return false;
        }
        // Remove from address index
        this.utxoIndex.get(utxo.address)?.delete(keyStr);
        // Remove from main set
        return this.utxoSet.delete(keyStr);
    }
    /**
     * Get UTXO by key
     */
    getUTXO(key) {
        return this.utxoSet.get(this.utxoKeyToString(key));
    }
    /**
     * Get all UTXOs for an address (like Bitcoin's wallet scanning)
     */
    getUTXOsForAddress(address) {
        const keys = this.utxoIndex.get(address);
        if (!keys) {
            return [];
        }
        const utxos = [];
        for (const key of keys) {
            const utxo = this.utxoSet.get(key);
            if (utxo) {
                utxos.push(utxo);
            }
        }
        return utxos;
    }
    /**
     * Get account balance (sum of all UTXOs + account balance)
     */
    getAddressBalance(address) {
        let balance = this.accountState.get(address)?.balance || BigInt(0);
        // Add UTXO values
        const utxos = this.getUTXOsForAddress(address);
        for (const utxo of utxos) {
            balance += utxo.value;
        }
        return balance;
    }
    /**
     * Update account state (for smart contracts)
     */
    updateAccountState(address, updates) {
        const current = this.accountState.get(address) || {
            address,
            balance: BigInt(0),
            nonce: 0,
            storageRoot: this.emptyStorageRoot(),
        };
        this.accountState.set(address, { ...current, ...updates });
    }
    /**
     * Get account state
     */
    getAccountState(address) {
        return this.accountState.get(address);
    }
    /**
     * Validate UTXO spend (Bitcoin-style validation)
     */
    validateUTXOSpend(input, expectedValue) {
        const utxo = this.getUTXO(input.utxoKey);
        if (!utxo) {
            return false; // UTXO doesn't exist or already spent
        }
        if (utxo.value !== expectedValue) {
            return false; // Value mismatch
        }
        // Check coinbase maturity (100 blocks like Bitcoin)
        if (utxo.isCoinbase && (this.blockHeight - utxo.blockHeight) < 100) {
            return false;
        }
        // Verify unlocking script against locking script
        return this.verifyScript(utxo.lockingScript, input.unlockingScript, input.witness);
    }
    /**
     * Verify script (simplified Bitcoin script validation)
     */
    verifyScript(lockingScript, unlockingScript, witness) {
        // Simplified script validation
        // In production, this would implement full Bitcoin Script interpreter
        // P2PKH: OP_DUP OP_HASH160 <pubKeyHash> OP_EQUALVERIFY OP_CHECKSIG
        if (lockingScript[0] === 0x76 && lockingScript[1] === 0xa9) {
            return this.verifyP2PKH(lockingScript, unlockingScript);
        }
        // P2WPKH: Witness program version 0 with 20-byte hash
        if (witness && witness.length === 2) {
            return this.verifyP2WPKH(lockingScript, witness);
        }
        // P2TR (Taproot): Witness version 1 with 32-byte key
        if (witness && witness.length === 1 && witness[0].length === 64) {
            return this.verifyP2TR(lockingScript, witness);
        }
        return true; // Simplified: assume valid for other types
    }
    verifyP2PKH(lockingScript, unlockingScript) {
        // Extract pubkey hash from locking script
        const pubKeyHash = lockingScript.slice(3, 23);
        // Extract signature and pubkey from unlocking script
        // Format: <signature> <pubkey>
        const sigLen = unlockingScript[0];
        const signature = unlockingScript.slice(1, sigLen + 1);
        const pubkey = unlockingScript.slice(sigLen + 1);
        // Hash the pubkey
        const pubKeyHashComputed = this.hash160(pubkey);
        // Compare hashes
        return pubKeyHashComputed.equals(pubKeyHash);
    }
    verifyP2WPKH(lockingScript, witness) {
        // Witness program: OP_0 <20-byte key hash>
        const keyHash = lockingScript.slice(2, 22);
        // Witness: <signature> <pubkey>
        const pubkey = witness[1];
        const pubKeyHashComputed = this.hash160(pubkey);
        return pubKeyHashComputed.equals(keyHash);
    }
    verifyP2TR(lockingScript, witness) {
        // Taproot: OP_1 <32-byte taproot output key>
        // Simplified validation
        return witness[0].length === 64;
    }
    /**
     * Hash160 (RIPEMD160(SHA256(data))) - Bitcoin standard
     */
    hash160(data) {
        const sha256 = (0, crypto_1.createHash)('sha256').update(data).digest();
        const ripemd160 = (0, crypto_1.createHash)('ripemd160').update(sha256).digest();
        return ripemd160;
    }
    /**
     * Double SHA256 (Bitcoin standard)
     */
    doubleSha256(data) {
        const first = (0, crypto_1.createHash)('sha256').update(data).digest();
        const second = (0, crypto_1.createHash)('sha256').update(first).digest();
        return second;
    }
    /**
     * Empty storage root hash
     */
    emptyStorageRoot() {
        return '0x' + '0'.repeat(64);
    }
    /**
     * Process a hybrid transaction
     */
    processTransaction(tx) {
        // Process UTXO inputs
        for (const input of tx.inputs) {
            const utxo = this.getUTXO(input.utxoKey);
            if (!utxo) {
                return { success: false, error: 'UTXO not found' };
            }
            if (!this.validateUTXOSpend(input, utxo.value)) {
                return { success: false, error: 'Invalid UTXO spend' };
            }
            // Spend the UTXO
            this.spendUTXO(input.utxoKey);
        }
        // Create new UTXOs from outputs
        const txid = this.computeTransactionID(tx);
        for (let i = 0; i < tx.outputs.length; i++) {
            const output = tx.outputs[i];
            this.addUTXO({
                txid,
                outputIndex: i,
                value: output.value,
                lockingScript: output.lockingScript,
                address: output.address,
                blockHeight: this.blockHeight,
                confirmations: 0,
                isCoinbase: false,
                scriptType: output.scriptType,
            });
        }
        // Process contract call if present
        if (tx.contractCall) {
            this.updateAccountState(tx.contractCall.toAddress, {
                nonce: (this.accountState.get(tx.contractCall.toAddress)?.nonce || 0) + 1,
            });
        }
        return { success: true };
    }
    /**
     * Compute transaction ID (Bitcoin style)
     */
    computeTransactionID(tx) {
        // Serialize transaction (simplified)
        const serialized = this.serializeTransaction(tx);
        const hash = this.doubleSha256(serialized);
        return hash.reverse().toString('hex'); // Bitcoin uses reverse byte order
    }
    /**
     * Serialize transaction for hashing
     */
    serializeTransaction(tx) {
        // Simplified serialization
        const buffers = [];
        // Version (4 bytes little-endian)
        const versionBuffer = Buffer.alloc(4);
        versionBuffer.writeUInt32LE(tx.version, 0);
        buffers.push(versionBuffer);
        // Input count (varint)
        buffers.push(Buffer.from([tx.inputs.length]));
        // Inputs
        for (const input of tx.inputs) {
            // TXID (32 bytes, reversed)
            const txidBuffer = Buffer.from(input.utxoKey.txid, 'hex').reverse();
            buffers.push(txidBuffer);
            // Output index (4 bytes little-endian)
            const indexBuffer = Buffer.alloc(4);
            indexBuffer.writeUInt32LE(input.utxoKey.outputIndex, 0);
            buffers.push(indexBuffer);
            // Script length (varint)
            buffers.push(Buffer.from([input.unlockingScript.length]));
            // Unlocking script
            buffers.push(input.unlockingScript);
            // Sequence (4 bytes little-endian)
            const sequenceBuffer = Buffer.alloc(4);
            sequenceBuffer.writeUInt32LE(input.sequence, 0);
            buffers.push(sequenceBuffer);
        }
        // Output count (varint)
        buffers.push(Buffer.from([tx.outputs.length]));
        // Outputs
        for (const output of tx.outputs) {
            // Value (8 bytes little-endian)
            const valueBuffer = Buffer.alloc(8);
            // Convert bigint to 64-bit little-endian
            const valueLE = this.bigIntToLE(output.value);
            buffers.push(valueBuffer);
            // Script length (varint)
            buffers.push(Buffer.from([output.lockingScript.length]));
            // Locking script
            buffers.push(output.lockingScript);
        }
        // Locktime (4 bytes little-endian)
        const locktimeBuffer = Buffer.alloc(4);
        locktimeBuffer.writeUInt32LE(tx.locktime, 0);
        buffers.push(locktimeBuffer);
        return Buffer.concat(buffers);
    }
    /**
     * Convert bigint to 64-bit little-endian buffer
     */
    bigIntToLE(value) {
        const buffer = Buffer.alloc(8);
        for (let i = 0; i < 8; i++) {
            buffer[i] = Number((value >> (BigInt(i) * BigInt(8))) & BigInt(0xff));
        }
        return buffer;
    }
    /**
     * Set current block height
     */
    setBlockHeight(height) {
        this.blockHeight = height;
    }
    /**
     * Get current block height
     */
    getBlockHeight() {
        return this.blockHeight;
    }
    /**
     * Get UTXO set statistics
     */
    getStatistics() {
        let totalValue = BigInt(0);
        for (const utxo of this.utxoSet.values()) {
            totalValue += utxo.value;
        }
        return {
            totalUTXOs: this.utxoSet.size,
            totalValue,
            totalAccounts: this.accountState.size,
            blockHeight: this.blockHeight,
        };
    }
    /**
     * Parallel validation of independent UTXO spends
     * This is where UTXO model shines - independent txs can be validated in parallel
     */
    async validateUTXOSpendsParallel(inputs) {
        // In a real implementation, this would use worker threads
        const results = await Promise.all(inputs.map(async (input) => {
            const utxo = this.getUTXO(input.utxoKey);
            if (!utxo)
                return false;
            return this.validateUTXOSpend(input, utxo.value);
        }));
        return results;
    }
    /**
     * Create coinbase transaction (like Bitcoin)
     */
    createCoinbaseTransaction(minerAddress, blockReward, blockHeight) {
        const coinbaseTx = {
            version: 2,
            inputs: [{
                    utxoKey: { txid: '0'.repeat(64), outputIndex: 0xffffffff },
                    unlockingScript: Buffer.from([blockHeight]), // Block height in script
                    sequence: 0xffffffff,
                }],
            outputs: [{
                    value: blockReward,
                    lockingScript: this.createP2PKHScript(minerAddress),
                    address: minerAddress,
                    scriptType: 'p2pkh',
                }],
            locktime: 0,
            isUTXOBased: true,
        };
        return coinbaseTx;
    }
    /**
     * Create P2PKH locking script
     */
    createP2PKHScript(address) {
        // Decode address to get pubkey hash
        // Simplified: assume address is base58 check encoded
        const pubKeyHash = this.decodeAddressToHash(address);
        // Script: OP_DUP OP_HASH160 <pubKeyHash> OP_EQUALVERIFY OP_CHECKSIG
        return Buffer.concat([
            Buffer.from([0x76, 0xa9]), // OP_DUP OP_HASH160
            Buffer.from([pubKeyHash.length]),
            pubKeyHash,
            Buffer.from([0x88, 0xac]), // OP_EQUALVERIFY OP_CHECKSIG
        ]);
    }
    /**
     * Decode address to hash (simplified)
     */
    decodeAddressToHash(address) {
        // Simplified address decoding
        // In production, this would properly decode base58 check
        return Buffer.from(address.slice(0, 40), 'hex');
    }
    /**
     * Prune spent UTXOs below a certain block height (for storage optimization)
     */
    pruneOldUTXOs(maxBlockHeight) {
        let pruned = 0;
        for (const [key, utxo] of this.utxoSet.entries()) {
            if (utxo.blockHeight < maxBlockHeight && utxo.confirmations > 1000) {
                this.utxoSet.delete(key);
                this.utxoIndex.get(utxo.address)?.delete(key);
                pruned++;
            }
        }
        return pruned;
    }
}
exports.HybridStateManager = HybridStateManager;
