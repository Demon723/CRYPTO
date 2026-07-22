import { IsString, IsOptional, MaxLength, IsUrl, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional({
    description: 'User display name',
    example: 'John Doe',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  name?: string;

  @ApiPropertyOptional({
    description: 'Avatar image URL',
    example: 'https://example.com/avatar.jpg',
  })
  @IsOptional()
  @IsUrl({}, { message: 'Image must be a valid URL' })
  image?: string;
}

export class ChangePasswordDto {
  @ApiPropertyOptional({
    description: 'Current password',
    example: 'OldPass123!',
  })
  @IsString()
  currentPassword: string;

  @ApiPropertyOptional({
    description: 'New password',
    example: 'NewPass456!',
  })
  @IsString()
  newPassword: string;

  @ApiPropertyOptional({
    description: 'Confirm new password',
    example: 'NewPass456!',
  })
  @IsString()
  confirmPassword: string;
}

export class Enable2FADto {
  @ApiPropertyOptional({
    description: 'Two-factor authentication secret from authenticator app',
    example: 'JBSWY3DPEHPK3PXP',
  })
  @IsString()
  secret: string;

  @ApiPropertyOptional({
    description: 'One-time password from authenticator app',
    example: '123456',
  })
  @IsString()
  token: string;
}
