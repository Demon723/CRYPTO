import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class Enable2FADto {
  @ApiProperty({ description: 'Two-factor authentication secret', example: 'JBSWY3DPEHPK3PXP' })
  @IsString()
  secret: string;
}
