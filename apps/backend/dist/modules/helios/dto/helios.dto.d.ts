export declare class BindWalletDto {
    tokenId: number;
    wallet: string;
    nonce: number;
    chipSignature: string;
}
export declare class TapToPayDto {
    tokenId: number;
    to: string;
    value: string;
    data: string;
    nonce: number;
    chipSignature: string;
}
export declare class RegisterCardholderDto {
    tokenId: number;
    nameHash: string;
    kycHash: string;
}
export declare class DepositToTbaDto {
    tokenId: number;
    amount: string;
}
export declare class FounderActivateDto {
    tokenId: number;
}
export declare class FounderFreezeDto {
    tokenId: number;
    reason: string;
}
export declare class FounderDeactivateDto {
    tokenId: number;
    reason: string;
}
