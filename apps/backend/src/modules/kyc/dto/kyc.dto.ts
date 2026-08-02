import { IsString, IsDateString, IsEnum, IsOptional, IsNotEmpty, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GovernmentIdType, PaymentMethodType } from '../entities/kyc.entity';

export class SubmitKycDto {
  @ApiProperty({
    description: 'Full legal name matching official ID',
    example: 'John Doe',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'Legal name must be at least 2 characters' })
  @MaxLength(100, { message: 'Legal name must not exceed 100 characters' })
  legalName: string;

  @ApiProperty({
    description: 'Date of birth (must be 18+ years ago)',
    example: '1990-01-15',
  })
  @IsDateString()
  dateOfBirth: string;

  @ApiProperty({
    description: 'Current physical residential address',
    example: '123 Main St, City, State, ZIP',
    minLength: 5,
    maxLength: 500,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(5, { message: 'Home address must be at least 5 characters' })
  @MaxLength(500, { message: 'Home address must not exceed 500 characters' })
  homeAddress: string;

  @ApiProperty({
    description: 'Type of government ID',
    enum: GovernmentIdType,
    example: GovernmentIdType.PASSPORT,
  })
  @IsEnum(GovernmentIdType, { message: 'Invalid government ID type' })
  governmentIdType: GovernmentIdType;

  @ApiProperty({
    description: 'Government ID number',
    example: 'A12345678',
    minLength: 5,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(5, { message: 'Government ID number must be at least 5 characters' })
  @MaxLength(50, { message: 'Government ID number must not exceed 50 characters' })
  governmentIdNumber: string;

  @ApiProperty({
    description: 'URL to front image of government ID',
    example: 'https://storage.example.com/kyc/id-front.jpg',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^https?:\/\//, { message: 'Government ID front URL must be a valid HTTP(S) URL' })
  governmentIdFrontUrl: string;

  @ApiPropertyOptional({
    description: 'URL to back image of government ID (optional for some ID types)',
    example: 'https://storage.example.com/kyc/id-back.jpg',
  })
  @IsOptional()
  @IsString()
  @Matches(/^https?:\/\//, { message: 'Government ID back URL must be a valid HTTP(S) URL' })
  governmentIdBackUrl?: string;

  @ApiProperty({
    description: 'URL to selfie image for facial verification',
    example: 'https://storage.example.com/kyc/selfie.jpg',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^https?:\/\//, { message: 'Selfie URL must be a valid HTTP(S) URL' })
  selfieUrl: string;

  @ApiPropertyOptional({
    description: 'URL to proof of address document (utility bill/bank statement)',
    example: 'https://storage.example.com/kyc/proof-of-address.pdf',
  })
  @IsOptional()
  @IsString()
  @Matches(/^https?:\/\//, { message: 'Proof of address URL must be a valid HTTP(S) URL' })
  proofOfAddressUrl?: string;

  @ApiProperty({
    description: 'Payment method type',
    enum: PaymentMethodType,
    example: PaymentMethodType.UPI,
  })
  @IsEnum(PaymentMethodType, { message: 'Invalid payment method type' })
  paymentMethodType: PaymentMethodType;

  @ApiProperty({
    description: 'Last 4 digits of payment method',
    example: '1234',
    minLength: 4,
    maxLength: 4,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(4, { message: 'Payment method last 4 digits must be at least 4 characters' })
  @MaxLength(4, { message: 'Payment method last 4 digits must be exactly 4 characters' })
  paymentMethodLast4: string;
}
