import { IsString, IsIn, IsOptional } from 'class-validator';

export class UpgradeSubscriptionDto {
  @IsString()
  @IsIn(['BASIC', 'PRO', 'ENTERPRISE'], {
    message: 'Plan must be BASIC, PRO, or ENTERPRISE',
  })
  plan: string;

  @IsOptional()
  @IsString()
  paymentMethodId?: string;
}

export class CancelSubscriptionDto {
  @IsOptional()
  @IsString()
  reason?: string;
}
