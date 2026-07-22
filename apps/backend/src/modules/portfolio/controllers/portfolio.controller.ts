import {
  Controller,
  Get,
  UseGuards,
  Query,
} from '@nestjs/common';
import { PortfolioService } from '../services/portfolio.service';
import { RiskService } from '../../analytics/services/risk.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUserId } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../../../common/enums';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('Portfolio')
@Controller('portfolio')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PortfolioController {
  constructor(
    private readonly portfolioService: PortfolioService,
    private readonly riskService: RiskService,
  ) {}

  @Get('summary')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get portfolio summary with totals and top performers' })
  @ApiResponse({ status: 200, description: 'Portfolio summary retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getSummary(@CurrentUserId() userId: string) {
    return this.portfolioService.getPortfolioSummary(userId);
  }

  @Get('allocation')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get asset allocation by token and chain' })
  @ApiResponse({ status: 200, description: 'Asset allocation retrieved' })
  getAssetAllocation(@CurrentUserId() userId: string) {
    return this.portfolioService.getAssetAllocation(userId);
  }

  @Get('performance')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get historical portfolio performance' })
  @ApiQuery({ name: 'period', required: false, type: String, description: 'Period in days (e.g., 7d, 30d, 90d, 1y)' })
  @ApiResponse({ status: 200, description: 'Performance data retrieved' })
  getPerformance(@CurrentUserId() userId: string, @Query('period') period?: string) {
    return this.portfolioService.getHistoricalPerformance(userId, period);
  }

  @Get('profit-loss')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get profit/loss breakdown' })
  @ApiResponse({ status: 200, description: 'Profit/loss data retrieved' })
  getProfitLoss(@CurrentUserId() userId: string) {
    return this.portfolioService.getProfitLoss(userId);
  }

  @Get('report')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get full portfolio report' })
  @ApiResponse({ status: 200, description: 'Full portfolio report generated' })
  getFullReport(@CurrentUserId() userId: string) {
    return this.portfolioService.getFullReport(userId);
  }

  @Get('risk-score')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get portfolio risk assessment' })
  @ApiResponse({ status: 200, description: 'Risk assessment retrieved' })
  getRiskScore(@CurrentUserId() userId: string) {
    return this.riskService.getPortfolioHealth(userId);
  }
}
