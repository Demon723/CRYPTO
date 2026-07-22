import { IsString, IsNotEmpty, Length, Matches } from 'class-validator';

export class SyncNftWalletDto {
  @IsString()
  @IsNotEmpty()
  @Length(42, 42, { message: 'Wallet address must be 42 characters (0x + 40 hex)' })
  @Matches(/^0x[a-fA-F0-9]{40}$/, { message: 'Invalid Ethereum address format' })
  walletId: string;
}
