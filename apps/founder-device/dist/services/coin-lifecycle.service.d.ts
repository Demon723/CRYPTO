export interface CoinLifecycleResult {
    success: boolean;
    txHash?: string;
    action: string;
    tokenId: number;
    error?: string;
}
export interface CardholderRegistration {
    tokenId: number;
    nameHash: string;
    kycHash: string;
}
export declare class FounderCoinService {
    private provider;
    private signer?;
    private pbt?;
    private cardRegistry?;
    constructor();
    init(): Promise<void>;
    isReady(): boolean;
    activate(tokenId: number, reason?: string): Promise<CoinLifecycleResult>;
    freeze(tokenId: number, reason?: string): Promise<CoinLifecycleResult>;
    deactivate(tokenId: number, reason?: string): Promise<CoinLifecycleResult>;
    registerCardholder(dto: CardholderRegistration): Promise<CoinLifecycleResult>;
    getTokenStatus(tokenId: number): Promise<{
        status: string;
        boundWallet: string;
        isPremium: boolean;
    }>;
    batchActivate(tokenIds: number[]): Promise<CoinLifecycleResult[]>;
    batchFreeze(tokenIds: number[], reason: string): Promise<CoinLifecycleResult[]>;
    batchDeactivate(tokenIds: number[], reason: string): Promise<CoinLifecycleResult[]>;
}
