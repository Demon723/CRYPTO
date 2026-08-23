/**
 * Hardware Wallet Integration for LXON Blockchain
 *
 * Implements Bitcoin-standard hardware wallet support for:
 * - Ledger Nano X/S integration
 * - Trezor One/T integration
 * - BIP39 mnemonic phrase management
 * - BIP44/BIP84 derivation paths
 * - PSBT (Partially Signed Bitcoin Transaction) support
 * - Secure key storage and signing
 *
 * This provides:
 * - Cold storage security
 * - User-friendly hardware wallet experience
 * - Compatibility with existing Bitcoin hardware wallets
 * - Secure transaction signing
 */
import { HybridTransaction } from '../utxo/hybrid-state-manager';
export interface BIP39Mnemonic {
    phrase: string;
    passphrase?: string;
    language: 'english' | 'japanese' | 'korean' | 'spanish' | 'chinese_simplified' | 'chinese_traditional' | 'french' | 'italian' | 'czech';
}
export declare class BIP39Manager {
    private wordlists;
    constructor();
    /**
     * Generate a new BIP39 mnemonic phrase
     */
    generateMnemonic(strength?: number, language?: string): BIP39Mnemonic;
    /**
     * Validate a BIP39 mnemonic phrase
     */
    validateMnemonic(phrase: string, language?: string): boolean;
    /**
     * Convert mnemonic to seed
     */
    mnemonicToSeed(mnemonic: BIP39Mnemonic): Buffer;
    /**
     * Calculate checksum for entropy
     */
    private calculateChecksum;
    /**
     * Convert entropy to mnemonic words
     */
    private entropyToMnemonic;
    /**
     * Convert mnemonic words to entropy
     */
    private mnemonicToEntropy;
    /**
     * Extract bits from buffer
     */
    private extractBits;
    /**
     * PBKDF2 implementation
     */
    private pbkdf2;
    /**
     * Initialize BIP39 wordlists
     */
    private initializeWordlists;
}
export interface DerivationPath {
    purpose: number;
    coinType: number;
    account: number;
    change: number;
    addressIndex: number;
}
export declare class HDWallet {
    private seed;
    private rootKey;
    constructor(seed: Buffer);
    /**
     * Derive child key from derivation path
     */
    deriveKey(path: DerivationPath): Buffer;
    /**
     * Derive root key from seed
     */
    private deriveRootKey;
    /**
     * Derive child key using BIP32
     */
    private deriveChildKey;
    /**
     * Get public key from private key
     */
    private getPublicKey;
    /**
     * Convert index to buffer
     */
    private indexToBuffer;
    /**
     * Get address from derivation path
     */
    getAddress(path: DerivationPath): string;
    /**
     * Convert hash to address
     */
    private hashToAddress;
}
export interface HardwareWallet {
    name: string;
    model: string;
    isConnected: boolean;
    connect(): Promise<boolean>;
    disconnect(): void;
    getAddress(path: DerivationPath): Promise<string>;
    signTransaction(tx: HybridTransaction, path: DerivationPath): Promise<Buffer>;
    signMessage(message: Buffer, path: DerivationPath): Promise<Buffer>;
    getDeviceInfo(): DeviceInfo;
}
export interface DeviceInfo {
    vendor: string;
    product: string;
    version: string;
    firmware: string;
    serial: string;
}
export declare class LedgerWallet implements HardwareWallet {
    name: string;
    model: string;
    isConnected: boolean;
    private transport;
    connect(): Promise<boolean>;
    disconnect(): void;
    getAddress(path: DerivationPath): Promise<string>;
    signTransaction(tx: HybridTransaction, path: DerivationPath): Promise<Buffer>;
    signMessage(message: Buffer, path: DerivationPath): Promise<Buffer>;
    getDeviceInfo(): DeviceInfo;
    private encodeDerivationPath;
    private serializeTransaction;
}
export declare class TrezorWallet implements HardwareWallet {
    name: string;
    model: string;
    isConnected: boolean;
    private transport;
    connect(): Promise<boolean>;
    disconnect(): void;
    getAddress(path: DerivationPath): Promise<string>;
    signTransaction(tx: HybridTransaction, path: DerivationPath): Promise<Buffer>;
    signMessage(message: Buffer, path: DerivationPath): Promise<Buffer>;
    getDeviceInfo(): DeviceInfo;
    private derivationPathToArray;
    private formatInputs;
    private formatOutputs;
}
export interface PSBTInput {
    previousTxid: string;
    previousOutputIndex: number;
    sequence: number;
    partialSig?: Array<{
        pubkey: Buffer;
        signature: Buffer;
    }>;
    sighashType?: number;
    redeemScript?: Buffer;
    witnessScript?: Buffer;
    bip32Derivation?: Map<Buffer, {
        fingerprint: Buffer;
        path: number[];
    }>;
}
export interface PSBTOutput {
    amount: bigint;
    script: Buffer;
    redeemScript?: Buffer;
    witnessScript?: Buffer;
    bip32Derivation?: Map<Buffer, {
        fingerprint: Buffer;
        path: number[];
    }>;
}
export interface PSBT {
    global: {
        unsignedTx: HybridTransaction;
        xpub?: Map<Buffer, {
            masterKeyFingerprint: Buffer;
            path: number[];
        }>;
        version: number;
    };
    inputs: PSBTInput[];
    outputs: PSBTOutput[];
}
export declare class PSBTManager {
    /**
     * Create PSBT from transaction
     */
    createPSBT(tx: HybridTransaction): PSBT;
    /**
     * Sign PSBT input with hardware wallet
     */
    signPSBTInput(psbt: PSBT, inputIndex: number, wallet: HardwareWallet, path: DerivationPath): Promise<PSBT>;
    /**
     * Finalize PSBT (combine signatures and create final transaction)
     */
    finalizePSBT(psbt: PSBT): HybridTransaction;
    /**
     * Combine signatures into unlocking script
     */
    private combineSignatures;
    /**
     * Extract transaction from finalized PSBT
     */
    extractTransaction(psbt: PSBT): HybridTransaction;
    /**
     * Serialize PSBT to base64
     */
    serializePSBT(psbt: PSBT): string;
    /**
     * Deserialize PSBT from base64
     */
    deserializePSBT(data: string): PSBT;
}
export declare class HardwareWalletManager {
    private wallets;
    private bip39Manager;
    private psbtManager;
    constructor();
    /**
     * Register hardware wallet
     */
    registerWallet(id: string, wallet: HardwareWallet): void;
    /**
     * Connect to hardware wallet
     */
    connectWallet(id: string): Promise<boolean>;
    /**
     * Disconnect from hardware wallet
     */
    disconnectWallet(id: string): void;
    /**
     * Get address from hardware wallet
     */
    getAddress(id: string, path: DerivationPath): Promise<string>;
    /**
     * Sign transaction with hardware wallet
     */
    signTransaction(id: string, tx: HybridTransaction, path: DerivationPath): Promise<Buffer>;
    /**
     * Create and sign PSBT
     */
    createAndSignPSBT(tx: HybridTransaction, walletId: string, paths: DerivationPath[]): Promise<HybridTransaction>;
    /**
     * Generate mnemonic phrase
     */
    generateMnemonic(strength?: number, language?: string): BIP39Mnemonic;
    /**
     * Validate mnemonic phrase
     */
    validateMnemonic(phrase: string, language?: string): boolean;
    /**
     * Get list of connected wallets
     */
    getConnectedWallets(): Array<{
        id: string;
        name: string;
        model: string;
    }>;
    /**
     * Get device info
     */
    getDeviceInfo(id: string): DeviceInfo | undefined;
}
