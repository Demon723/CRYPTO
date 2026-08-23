export interface CoinJoinInput {
    txid: Uint8Array;
    vout: number;
    value: bigint;
    scriptPubKey: Uint8Array;
    signature?: Buffer;
    publicKey?: Uint8Array;
}
export interface CoinJoinOutput {
    value: bigint;
    scriptPubKey: Uint8Array;
    address: string;
}
export interface CoinJoinTransaction {
    inputs: CoinJoinInput[];
    outputs: CoinJoinOutput[];
    fee: bigint;
    coordinatorPublicKey?: Uint8Array;
}
export interface CoinJoinRound {
    id: Uint8Array;
    participants: string[];
    inputs: Map<string, CoinJoinInput>;
    outputs: Map<string, CoinJoinOutput>;
    feeRate: bigint;
    status: 'pending' | 'signed' | 'broadcast';
}
export declare class CoinJoinProtocol {
    static createRound(participants: string[], feeRate: bigint): CoinJoinRound;
    static addParticipantInput(round: CoinJoinRound, participant: string, input: CoinJoinInput): void;
    static addParticipantOutput(round: CoinJoinRound, participant: string, output: CoinJoinOutput): void;
    static buildTransaction(round: CoinJoinRound): CoinJoinTransaction;
    static signInput(tx: CoinJoinTransaction, inputIndex: number, privateKey: Uint8Array): Buffer;
    static verifyInputSignature(tx: CoinJoinTransaction, inputIndex: number, signature: Buffer, publicKey: Uint8Array): boolean;
    private static computeTxDigest;
}
