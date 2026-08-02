import { IsString, MinLength, MaxLength, IsOptional, IsBoolean, IsNotEmpty } from 'class-validator';
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
    description: 'Biometric public key in base64-encoded SPKI format (P-256)',
    example: 'MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE...',
  })
  @IsString()
  @IsNotEmpty()
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
    description: 'Biometric signature payload in format "base64(challenge):base64(signature)"',
    example: 'c2hhMjU2X2NoYWxsZW5nZQ==:c2lnbmF0dXJl',
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

export class BiometricChallengeResponse {
  @ApiProperty({
    description: 'Base64-encoded challenge to sign with biometric private key',
    example: 'c2hhMjU2X2NoYWxsZW5nZQ==',
  })
  challenge: string;

  @ApiProperty({
    description: 'Challenge expiration timestamp',
    example: '2026-08-03T04:00:00.000Z',
  })
  expiresAt: Date;
}
