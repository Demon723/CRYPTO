export type TokenTier = 0 | 1 | 2 | 3 | 4;
export type TokenStatus = 'INACTIVE' | 'ACTIVE' | 'FROZEN' | 'DEACTIVATED';
export interface TokenState {
    tokenId: bigint;
    tapCount: bigint;
    lastTapTime: bigint;
    tier: TokenTier;
    minted: boolean;
    status: TokenStatus;
    boundWallet: string;
    boundAt: bigint;
    tba: string;
    isPremium: boolean;
}
export interface Cardholder {
    cardNumber: string;
    nameHash: string;
    kycHash: string;
    registeredAt: bigint;
    registered: boolean;
}
export interface ChipSignaturePayload {
    tokenId: bigint;
    nonce: bigint;
    chainId: bigint;
}
export interface TapToPayPayload extends ChipSignaturePayload {
    to: string;
    value: bigint;
    dataHash: string;
}
export interface BindWalletPayload extends ChipSignaturePayload {
    wallet: string;
}
export interface PremiumDepositPayload {
    tokenId: bigint;
    amount: bigint;
}
export interface KeyValidationResult {
    valid: boolean;
    tokenId: bigint;
}
//# sourceMappingURL=types.d.ts.map