import { IsString, IsNotEmpty, IsIn, Length, Matches } from 'class-validator';

export class IndexTransactionsDto {
  @IsString()
  @IsNotEmpty()
  @Length(42, 42, { message: 'Wallet address must be 42 characters (0x + 40 hex)' })
  @Matches(/^0x[a-fA-F0-9]{40}$/, { message: 'Invalid Ethereum address format' })
  walletAddress: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['ethereum', 'polygon', 'bsc', 'arbitrum', 'base', 'avalanche'], {
    message: 'Chain must be ethereum, polygon, bsc, arbitrum, base, or avalanche',
  })
  chain: string;
}
