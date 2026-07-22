import { IsString, IsOptional, IsObject, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { AlertType, AlertStatus } from '../entities/alert.entity';

export class CreateAlertDto {
  @ApiPropertyOptional({ description: 'Alert type', enum: AlertType })
  @IsEnum(AlertType)
  type: AlertType;

  @ApiPropertyOptional({ description: 'Alert condition', example: { field: 'price', operator: '>', value: 3000 } })
  @IsObject()
  condition: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Wallet ID (optional)', example: 'uuid' })
  @IsOptional()
  @IsString()
  walletId?: string;
}

export class UpdateAlertDto {
  @ApiPropertyOptional({ description: 'Alert status', enum: AlertStatus })
  @IsOptional()
  @IsEnum(AlertStatus)
  status?: AlertStatus;

  @ApiPropertyOptional({ description: 'Alert condition', example: { field: 'price', operator: '>', value: 3000 } })
  @IsOptional()
  @IsObject()
  condition?: Record<string, unknown>;
}
