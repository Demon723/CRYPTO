import { IsOptional, IsString, Length } from 'class-validator';

export class MarkReadDto {
  @IsString()
  @Length(24, 24, { message: 'Notification ID must be 24 characters' })
  id: string;
}

export class MarkAllReadDto {
  @IsOptional()
  @IsString()
  @Length(24, 24, { message: 'Notification ID must be 24 characters' })
  beforeId?: string;
}
