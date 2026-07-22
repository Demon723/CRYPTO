import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  Param,
  Query,
} from '@nestjs/common';
import { DeveloperApiService } from '../services/developer-api.service';
import { CreateApiKeyDto } from '../entities/api-key.entity';
import { ApiKeyAuthGuard } from '../guards/api-key-auth.guard';
import { CurrentUserId } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UserRole } from '../../../common/enums';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('Developer API')
@Controller('developer')
export class DeveloperApiController {
  constructor(private readonly developerApiService: DeveloperApiService) {}

  @Get('keys')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get user API keys' })
  @ApiResponse({ status: 200, description: 'API keys retrieved' })
  getUserApiKeys(@CurrentUserId() userId: string) {
    return this.developerApiService.getUserApiKeys(userId);
  }

  @Post('keys')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @ApiOperation({ summary: 'Create a new API key' })
  @ApiResponse({ status: 201, description: 'API key created' })
  createApiKey(@CurrentUserId() userId: string, @Body() dto: CreateApiKeyDto) {
    return this.developerApiService.createApiKey(userId, dto);
  }

  @Delete('keys/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Revoke API key' })
  @ApiResponse({ status: 200, description: 'API key revoked' })
  revokeApiKey(@CurrentUserId() userId: string, @Param('id') keyId: string) {
    return this.developerApiService.revokeApiKey(userId, keyId);
  }

  @Get('v1/portfolio')
  @UseGuards(ApiKeyAuthGuard)
  @ApiOperation({ summary: 'Developer API: Get portfolio data (API key required)' })
  @ApiResponse({ status: 200, description: 'Portfolio data retrieved' })
  async getPortfolio(@CurrentUserId() userId: string) {
    return { message: 'Portfolio data would be returned here', userId };
  }

  @Get('v1/tokens/search')
  @UseGuards(ApiKeyAuthGuard)
  @ApiOperation({ summary: 'Developer API: Search tokens (API key required)' })
  @ApiQuery({ name: 'q', required: true, type: String })
  @ApiResponse({ status: 200, description: 'Token search results' })
  async searchTokens(@Query('q') query: string) {
    return { message: 'Token search results would be returned here', query };
  }
}
