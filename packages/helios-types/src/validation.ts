import { z } from 'zod';

export const CardNumberSchema = z.string().regex(/^H-\d{4}-\d{4}-\d{4}-\d$/, {
  message: 'Invalid Helios card number format. Expected H-XXXX-XXXX-XXXX-X',
});

export const TokenIdSchema = z.number().int().positive();
export const TierSchema = z.number().int().min(0).max(4);
export const WalletAddressSchema = z.string().regex(/^0x[a-fA-F0-9]{40}$/, {
  message: 'Invalid Ethereum address',
});

export const TokenStatusSchema = z.enum(['INACTIVE', 'ACTIVE', 'FROZEN', 'DEACTIVATED']);

export const TokenStateSchema = z.object({
  tokenId: TokenIdSchema,
  tapCount: z.number().int().nonnegative(),
  lastTapTime: z.number().int().nonnegative(),
  tier: TierSchema,
  minted: z.boolean(),
  status: TokenStatusSchema,
  boundWallet: WalletAddressSchema,
  boundAt: z.number().int().nonnegative(),
  tba: WalletAddressSchema,
  isPremium: z.boolean(),
});

export const CardholderSchema = z.object({
  cardNumber: CardNumberSchema,
  nameHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
  kycHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
  registeredAt: z.number().int().nonnegative(),
  registered: z.boolean(),
});

export type ValidatedCardNumber = z.infer<typeof CardNumberSchema>;
export type ValidatedTokenState = z.infer<typeof TokenStateSchema>;
export type ValidatedCardholder = z.infer<typeof CardholderSchema>;
