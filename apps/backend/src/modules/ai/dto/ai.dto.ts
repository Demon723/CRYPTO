import { IsString, IsOptional, IsObject } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class AiChatDto {
  @ApiPropertyOptional({ description: 'Chat message', example: 'Analyze my portfolio' })
  @IsString()
  message: string;

  @ApiPropertyOptional({ description: 'Chat ID for continuing conversation', example: 'uuid' })
  @IsOptional()
  @IsString()
  chatId?: string;

  @ApiPropertyOptional({ description: 'Additional context', example: { chain: 'ETHEREUM' } })
  @IsOptional()
  @IsObject()
  context?: Record<string, unknown>;
}

export class AiAnalyzePortfolioDto {
  @ApiPropertyOptional({ description: 'Analysis options', example: { includeRecommendations: true } })
  @IsOptional()
  @IsObject()
  options?: Record<string, unknown>;
}
