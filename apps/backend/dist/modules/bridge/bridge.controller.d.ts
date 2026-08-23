import { BridgeService } from './bridge.service';
import { BridgeTransfer, BridgeChain, BridgeToken, BridgeTransferRequest } from './bridge.types';
export declare class BridgeController {
    private readonly bridgeService;
    constructor(bridgeService: BridgeService);
    getSupportedChains(): BridgeChain[];
    getSupportedTokens(): BridgeToken[];
    initiateTransfer(req: any, body: BridgeTransferRequest): Promise<BridgeTransfer>;
    getTransferStatus(id: string): Promise<BridgeTransfer | null>;
    getTransferHistory(address: string): Promise<BridgeTransfer[]>;
    estimateFee(body: {
        fromChainId: number;
        toChainId: number;
        amount: string;
    }): Promise<{
        fee: string;
    }>;
}
