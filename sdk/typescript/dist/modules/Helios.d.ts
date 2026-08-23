import { ethers } from 'ethers';
import { TokenState, Cardholder, TokenStatus } from '@lxon/helios-types';
export interface HeliosConfig {
    pbtAddress: string;
    cardRegistryAddress: string;
    chipRegistryAddress: string;
    rpcUrl: string;
    signer?: ethers.Signer;
}
export declare class HeliosModule {
    private provider;
    private signer;
    private pbt;
    private cardRegistry;
    private chipRegistry;
    constructor(config: HeliosConfig);
    connect(): Promise<void>;
    isConnected(): boolean;
    getTokenState(tokenId: number): Promise<TokenState>;
    isKeyValid(wallet: string): Promise<{
        valid: boolean;
        tokenId: bigint;
    }>;
    getBoundWallet(tokenId: number): Promise<string>;
    getTBA(tokenId: number): Promise<string>;
    isPremium(tokenId: number): Promise<boolean>;
    getTokenStatus(tokenId: number): Promise<TokenStatus>;
    getCardholder(tokenId: number): Promise<Cardholder>;
    isRegistered(tokenId: number): Promise<boolean>;
    getTokenByCard(cardNumber: string): Promise<bigint>;
    verifyChipSignature(tokenId: number, hash: string, signature: string): Promise<boolean>;
    isNonceUsed(chipPublicKey: string, nonce: number): Promise<boolean>;
    getTBABalance(tokenId: number): Promise<bigint>;
    getTBAContract(tokenId: number): Promise<ethers.Contract>;
    buildBindWalletMessage(tokenId: number, wallet: string, nonce: number, chainId: number): string;
    buildTapToPayMessage(tokenId: number, to: string, value: bigint, data: string, nonce: number, chainId: number): string;
    buildTransferMessage(tokenId: number, to: string, nonce: number, chainId: number): string;
    queryEvents(eventName: string, fromBlock: number, toBlock: number, args?: any[]): Promise<ethers.Log[]>;
    getTappedEvents(tokenId: number, fromBlock: number, toBlock: number): Promise<ethers.Log[]>;
    getWalletBoundEvents(tokenId: number, fromBlock: number, toBlock: number): Promise<ethers.Log[]>;
    getTapToPayEvents(tokenId: number, fromBlock: number, toBlock: number): Promise<ethers.Log[]>;
    getPremiumDepositEvents(tokenId: number, fromBlock: number, toBlock: number): Promise<ethers.Log[]>;
    private mapStatus;
}
//# sourceMappingURL=Helios.d.ts.map