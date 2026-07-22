import { IsString, IsOptional, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Chain } from '../entities/wallet.entity';

export class WalletCreateDto {
  @ApiPropertyOptional({ description: 'Wallet address', example: '0x...' })
  @IsString()
  address: string;

  @ApiPropertyOptional({ description: 'Blockchain chain', enum: Chain })
  @IsEnum(Chain)
  chain: Chain;

  @ApiPropertyOptional({ description: 'Wallet label', example: 'My Wallet' })
  @IsOptional()
  @IsString()
  label?: string;

  @ApiPropertyOptional({ description: 'Wallet type', enum: ['EOA', 'SMART_CONTRACT', 'MULTISIG'] })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ description: 'Is watch-only wallet', default: false })
  @IsOptional()
  isWatchOnly?: boolean;
}

export class WalletSyncDto {
  @ApiPropertyOptional({ description: 'Wallet ID to sync', example: 'uuid' })
  @IsOptional()
  @IsString()
  walletId?: string;
}
