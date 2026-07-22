import { IsString, IsNotEmpty, Length, Matches } from 'class-validator';

export class ApplyReferralDto {
  @IsString()
  @IsNotEmpty()
  @Length(6, 20, { message: 'Referral code must be between 6 and 20 characters' })
  @Matches(/^[A-Z0-9]+$/, { message: 'Referral code must be uppercase alphanumeric' })
  code: string;
}
