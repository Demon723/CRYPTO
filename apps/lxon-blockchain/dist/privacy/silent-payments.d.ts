export interface SilentPaymentKeys {
    scanPublicKey: Uint8Array;
    spendPublicKey: Uint8Array;
}
export interface SilentPaymentAddress {
    address: string;
    paymentCode: Uint8Array;
    tweakedPublicKey: Uint8Array;
}
export interface SilentPaymentInput {
    txid: Uint8Array;
    vout: number;
    value: bigint;
    scriptPubKey: Uint8Array;
    isSilentPayment: boolean;
    spendingKey?: Uint8Array;
}
export declare class SilentPaymentsProtocol {
    static generateKeys(): {
        scanPrivateKey: Uint8Array;
        spendPrivateKey: Uint8Array;
    };
    static generatePaymentCode(scanPublicKey: Uint8Array, spendPublicKey: Uint8Array): Uint8Array;
    static createSilentPaymentAddress(senderScanPublic: Uint8Array, receiverScanPublic: Uint8Array, receiverSpendPublic: Uint8Array, label?: Uint8Array): SilentPaymentAddress;
    static computeSharedSecret(senderScanPublic: Uint8Array, receiverScanPublic: Uint8Array): Uint8Array;
    static tweakPublicKey(publicKey: Uint8Array, tweak: Uint8Array, label?: Uint8Array): Uint8Array;
    static verifySilentPayment(input: SilentPaymentInput, receiverScanPrivate: Uint8Array, receiverSpendPrivate: Uint8Array): boolean;
    static computeSpendingKey(scanPrivate: Uint8Array, spendPrivate: Uint8Array, txid: Uint8Array): Uint8Array;
    static detectSilentPaymentOutput(outputScript: Uint8Array): boolean;
    static extractOutputPublicKey(outputScript: Uint8Array): Uint8Array | null;
    private static publicKeyToAddress;
    private static base58Check;
}
