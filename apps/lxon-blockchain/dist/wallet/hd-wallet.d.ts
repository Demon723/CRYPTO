export interface HDNode {
    privateKey: Uint8Array;
    publicKey: Uint8Array;
    chainCode: Uint8Array;
    depth: number;
    index: number;
    parentFingerprint: number;
}
export interface HDWallet {
    mnemonic: string;
    seed: Uint8Array;
    root: HDNode;
}
export interface BIP44Path {
    coinType: number;
    account: number;
    change: number;
    addressIndex: number;
}
export declare function generateMnemonic(strength?: number): string;
export declare function mnemonicToSeed(mnemonic: string, passphrase?: string): Uint8Array;
export declare function seedToRootNode(seed: Uint8Array): HDNode;
export declare function derivePath(node: HDNode, path: string): HDNode;
export declare function deriveChild(parent: HDNode, index: number): HDNode;
export declare function getAddress(publicKey: Uint8Array, scriptType?: 'p2pkh' | 'p2wpkh' | 'p2tr'): string;
export declare function getBIP44Address(node: HDNode, coinType?: number, account?: number, change?: number, addressIndex?: number): string;
