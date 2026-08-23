import { BridgeChain, BridgeToken, BridgeTransfer, BridgeValidator, BridgeStatus } from './bridge.types';
export declare const SUPPORTED_CHAINS: BridgeChain[];
export declare const SUPPORTED_TOKENS: BridgeToken[];
export declare class BridgeService {
    private transfers;
    private validators;
    private minConfirmations;
    private maxTransferAmount;
    private feePercentage;
    private listeners;
    getSupportedChains(): BridgeChain[];
    getSupportedTokens(): BridgeToken[];
    initiateTransfer(params: {
        fromChainId: number;
        toChainId: number;
        tokenSymbol: string;
        amount: string;
        sender: string;
        recipient: string;
    }): Promise<BridgeTransfer>;
    getTransferStatus(transferId: string): Promise<BridgeTransfer | null>;
    getTransferHistory(address: string): BridgeTransfer[];
    estimateFee(fromChainId: number, toChainId: number, amount: string): Promise<string>;
    getValidators(): BridgeValidator[];
    addValidator(validator: BridgeValidator): void;
    onStatusChange(callback: (status: BridgeStatus) => void): () => void;
    private generateRandomHash;
    private emit;
}
