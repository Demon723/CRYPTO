import type { HDWallet } from './hd-wallet';
export interface AstroKeypair {
    classicalPrivateKey: Uint8Array;
    classicalPublicKey: Uint8Array;
    arcPrivateKey: Uint8Array;
    arcPublicKey: Uint8Array;
    address: string;
    astroAddress: string;
}
export interface AstroWallet extends HDWallet {
    astroKeypair: AstroKeypair;
    astroPath: string;
}
export declare function generateAstroWallet(mnemonic?: string, passphrase?: string, astroPath?: string): AstroWallet;
export declare function signAstroTransaction(wallet: AstroWallet, message: Uint8Array, algorithmId?: number): {
    classicalSig: Uint8Array;
    arcSigma: Uint8Array;
    nonce: bigint;
};
export declare function verifyAstroSignature(classicalPublicKey: Uint8Array, arcPublicKey: Uint8Array, message: Uint8Array, classicalSigHex: string, arcSigma: Uint8Array, algorithmId: number): boolean;
export declare function deriveAddress(publicKey: Uint8Array): string;
export declare function deriveAstroAddress(classicalPub: Uint8Array, arcPub: Uint8Array): string;
