export declare function isPremiumTier(tier: number): boolean;
export declare function tierLabel(tier: number): string;
export declare function generateCardNumber(tokenId: number, tier: number): string;
export declare function luhnChecksum(digits: string): number;
export declare function validateCardNumber(cardNumber: string): boolean;
export declare function parseTapToPayMessage(tokenId: number, to: string, value: bigint, data: string, nonce: number, chainId: number): string;
//# sourceMappingURL=utils.d.ts.map