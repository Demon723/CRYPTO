import { IsString, MinLength, MaxLength, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SetPinDto {
  @ApiProperty({
    description: '6-digit PIN',
    example: '123456',
    minLength: 6,
    maxLength: 6,
  })
  @IsString()
  @MinLength(6, { message: 'PIN must be exactly 6 digits' })
  @MaxLength(6, { message: 'PIN must be exactly 6 digits' })
  pin: string;
}

export class VerifyPinDto {
  @ApiProperty({
    description: '6-digit PIN',
    example: '123456',
  })
  @IsString()
  @MinLength(6, { message: 'PIN must be exactly 6 digits' })
  @MaxLength(6, { message: 'PIN must be exactly 6 digits' })
  pin: string;
}

export class EnableBiometricDto {
  @ApiProperty({
    description: 'Biometric public key for signature verification',
    example: '0xabcdef1234567890abcdef1234567890abcdef12',
  })
  @IsString()
  publicKey: string;
}

export class TransactionAuthDto {
  @ApiPropertyOptional({
    description: 'PIN for transaction authorization',
    example: '123456',
  })
  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'PIN must be exactly 6 digits' })
  @MaxLength(6, { message: 'PIN must be exactly 6 digits' })
  pin?: string;

  @ApiPropertyOptional({
    description: 'Biometric signature for transaction authorization',
    example: '0xsignature1234567890',
  })
  @IsOptional()
  @IsString()
  biometricSignature?: string;
}

export class UpdatePinBiometricSettingsDto {
  @ApiPropertyOptional({
    description: 'Whether PIN/biometric is required for transactions',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isPinBiometricRequired?: boolean;
}
