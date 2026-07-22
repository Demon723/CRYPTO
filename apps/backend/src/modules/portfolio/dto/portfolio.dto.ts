import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PortfolioFilterDto {
  @ApiPropertyOptional({ description: 'Time period', example: '30d' })
  @IsOptional()
  @IsString()
  period?: string;

  @ApiPropertyOptional({ description: 'Chain filter', enum: ['ETHEREUM', 'POLYGON', 'BSC', 'ARBITRUM', 'BASE', 'AVALANCHE'] })
  @IsOptional()
  @IsEnum(['ETHEREUM', 'POLYGON', 'BSC', 'ARBITRUM', 'BASE', 'AVALANCHE'])
  chain?: string;
}
