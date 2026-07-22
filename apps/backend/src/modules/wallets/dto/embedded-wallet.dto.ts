import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Chain } from '../entities/wallet.entity';

export class CreateEmbeddedWalletDto {
  @ApiProperty({ enum: Chain })
  @IsEnum(Chain)
  chain: Chain;

  @ApiProperty({ enum: ['EMAIL', 'SOCIAL', 'PASSWORD'] })
  @IsEnum(['EMAIL', 'SOCIAL', 'PASSWORD'])
  recoveryMethod: 'EMAIL' | 'SOCIAL' | 'PASSWORD';

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  label?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  recoveryKey?: string;
}

export class RecoverWalletDto {
  @ApiProperty()
  @IsString()
  recoveryKey: string;
}
