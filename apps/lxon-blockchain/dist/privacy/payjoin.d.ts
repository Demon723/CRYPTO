export interface PayJoinInput {
    txid: Uint8Array;
    vout: number;
    value: bigint;
    scriptPubKey: Uint8Array;
    signature?: Buffer;
    publicKey?: Uint8Array;
}
export interface PayJoinOutput {
    value: bigint;
    scriptPubKey: Uint8Array;
    address: string;
    isChange: boolean;
}
export interface PayJoinProposal {
    originalOutputValue: bigint;
    originalOutputScript: Uint8Array;
    senderInputs: PayJoinInput[];
    receiverInputs: PayJoinInput[];
    outputs: PayJoinOutput[];
    fee: bigint;
    receiverPublicKey: Uint8Array;
}
export interface PayJoinResponse {
    addedInputs: PayJoinInput[];
    adjustedOutputs: PayJoinOutput[];
    totalAdded: bigint;
}
export declare class PayJoinProtocol {
    static createProposal(originalOutputValue: bigint, originalOutputScript: Uint8Array, senderInputs: PayJoinInput[], receiverPublicKey: Uint8Array): PayJoinProposal;
    static receiverRespond(proposal: PayJoinProposal, receiverInputs: PayJoinInput[], receiverChangeAddress: string): PayJoinResponse;
    static signInput(tx: PayJoinProposal, inputIndex: number, privateKey: Uint8Array): Buffer;
    static verifyInputSignature(tx: PayJoinProposal, inputIndex: number, signature: Buffer, publicKey: Uint8Array): boolean;
    private static computeTxDigest;
}
