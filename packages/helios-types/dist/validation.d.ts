import { z } from 'zod';
export declare const CardNumberSchema: z.ZodString;
export declare const TokenIdSchema: z.ZodNumber;
export declare const TierSchema: z.ZodNumber;
export declare const WalletAddressSchema: z.ZodString;
export declare const TokenStatusSchema: z.ZodEnum<["INACTIVE", "ACTIVE", "FROZEN", "DEACTIVATED"]>;
export declare const TokenStateSchema: z.ZodObject<{
    tokenId: z.ZodNumber;
    tapCount: z.ZodNumber;
    lastTapTime: z.ZodNumber;
    tier: z.ZodNumber;
    minted: z.ZodBoolean;
    status: z.ZodEnum<["INACTIVE", "ACTIVE", "FROZEN", "DEACTIVATED"]>;
    boundWallet: z.ZodString;
    boundAt: z.ZodNumber;
    tba: z.ZodString;
    isPremium: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    tokenId: number;
    tapCount: number;
    lastTapTime: number;
    tier: number;
    minted: boolean;
    status: "INACTIVE" | "ACTIVE" | "FROZEN" | "DEACTIVATED";
    boundWallet: string;
    boundAt: number;
    tba: string;
    isPremium: boolean;
}, {
    tokenId: number;
    tapCount: number;
    lastTapTime: number;
    tier: number;
    minted: boolean;
    status: "INACTIVE" | "ACTIVE" | "FROZEN" | "DEACTIVATED";
    boundWallet: string;
    boundAt: number;
    tba: string;
    isPremium: boolean;
}>;
export declare const CardholderSchema: z.ZodObject<{
    cardNumber: z.ZodString;
    nameHash: z.ZodString;
    kycHash: z.ZodString;
    registeredAt: z.ZodNumber;
    registered: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    cardNumber: string;
    nameHash: string;
    kycHash: string;
    registeredAt: number;
    registered: boolean;
}, {
    cardNumber: string;
    nameHash: string;
    kycHash: string;
    registeredAt: number;
    registered: boolean;
}>;
export type ValidatedCardNumber = z.infer<typeof CardNumberSchema>;
export type ValidatedTokenState = z.infer<typeof TokenStateSchema>;
export type ValidatedCardholder = z.infer<typeof CardholderSchema>;
//# sourceMappingURL=validation.d.ts.map