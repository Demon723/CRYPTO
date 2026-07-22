import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AnalyticsService } from '../services/analytics.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUserId } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../../../common/enums';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TimeRange } from '../entities/analytics.entity';

@ApiTags('Analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('portfolio')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get portfolio analytics' })
  @ApiQuery({ name: 'timeRange', required: false, enum: TimeRange })
  @ApiResponse({ status: 200, description: 'Portfolio analytics retrieved' })
  getPortfolioAnalytics(
    @CurrentUserId() userId: string,
    @Query('timeRange') timeRange?: TimeRange,
  ) {
    return this.analyticsService.getPortfolioAnalytics(userId, timeRange);
  }

  @Get('transactions')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get transaction history' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Transaction history retrieved' })
  getTransactionHistory(
    @CurrentUserId() userId: string,
    @Query('limit') limit?: string,
  ) {
    return this.analyticsService.getTransactionHistory(userId, limit ? parseInt(limit) : 50);
  }

  @Get('performance')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get performance metrics' })
  @ApiResponse({ status: 200, description: 'Performance metrics retrieved' })
  getPerformanceMetrics(@CurrentUserId() userId: string) {
    return this.analyticsService.getPerformanceMetrics(userId);
  }
}
