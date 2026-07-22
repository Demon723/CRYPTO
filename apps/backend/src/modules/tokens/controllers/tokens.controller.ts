import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { TokensService } from '../services/tokens.service';
import { TokenUtilityService } from '../services/token-utility.service';
import { Chain } from '../../wallets/entities/wallet.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUserId } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../../../common/enums';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('Tokens')
@Controller('tokens')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class TokensController {
  constructor(
    private readonly tokensService: TokensService,
    private readonly tokenUtilityService: TokenUtilityService,
  ) {}

  @Get('search')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Search tokens by symbol, name, or address' })
  @ApiQuery({ name: 'q', required: true, type: String, description: 'Search query (symbol, name, or address)' })
  @ApiQuery({ name: 'chain', required: false, enum: ['ETHEREUM', 'POLYGON', 'BSC', 'ARBITRUM', 'BASE', 'AVALANCHE'] })
  @ApiResponse({ status: 200, description: 'Search results retrieved' })
  searchTokens(@Query('q') query: string, @Query('chain') chain?: Chain) {
    return this.tokensService.searchTokens(query, chain);
  }

  @Get(':address')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get token details by address' })
  @ApiQuery({ name: 'chain', required: true, enum: ['ETHEREUM', 'POLYGON', 'BSC', 'ARBITRUM', 'BASE', 'AVALANCHE'] })
  @ApiResponse({ status: 200, description: 'Token details retrieved' })
  @ApiResponse({ status: 404, description: 'Token not found' })
  getTokenByAddress(@Param('address') address: string, @Query('chain') chain: Chain) {
    return this.tokensService.getTokenByAddress(address, chain);
  }

  @Get('price/:address')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get token price' })
  @ApiQuery({ name: 'chain', required: true, enum: ['ETHEREUM', 'POLYGON', 'BSC', 'ARBITRUM', 'BASE', 'AVALANCHE'] })
  @ApiResponse({ status: 200, description: 'Token price retrieved' })
  getTokenPrice(@Param('address') address: string, @Query('chain') chain: Chain) {
    return this.tokensService.getTokenPrice(address, chain);
  }

  @Get('trending')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get trending tokens' })
  @ApiQuery({ name: 'chain', required: false, enum: ['ETHEREUM', 'POLYGON', 'BSC', 'ARBITRUM', 'BASE', 'AVALANCHE'] })
  @ApiResponse({ status: 200, description: 'Trending tokens retrieved' })
  getTrendingTokens(@Query('chain') chain?: Chain) {
    return this.tokensService.getTrendingTokens(chain);
  }

  @Get('gainers')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get top gainers' })
  @ApiQuery({ name: 'chain', required: false, enum: ['ETHEREUM', 'POLYGON', 'BSC', 'ARBITRUM', 'BASE', 'AVALANCHE'] })
  @ApiResponse({ status: 200, description: 'Top gainers retrieved' })
  getTopGainers(@Query('chain') chain?: Chain) {
    return this.tokensService.getTopGainers(chain);
  }

  @Get('losers')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get top losers' })
  @ApiQuery({ name: 'chain', required: false, enum: ['ETHEREUM', 'POLYGON', 'BSC', 'ARBITRUM', 'BASE', 'AVALANCHE'] })
  @ApiResponse({ status: 200, description: 'Top losers retrieved' })
  getTopLosers(@Query('chain') chain?: Chain) {
    return this.tokensService.getTopLosers(chain);
  }

  @Get('utility/revenue-share')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get LXOM revenue share calculation' })
  @ApiQuery({ name: 'periodDays', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Revenue share calculated' })
  getRevenueShare(@CurrentUserId() userId: string, @Query('periodDays') periodDays?: string) {
    return this.tokenUtilityService.calculateRevenueShare(userId, periodDays ? parseInt(periodDays) : 30);
  }

  @Get('utility/benefits')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get token utility benefits based on LXOM holdings' })
  @ApiResponse({ status: 200, description: 'Token benefits retrieved' })
  getTokenBenefits(@CurrentUserId() userId: string) {
    return this.tokenUtilityService.getTokenBenefits(userId);
  }

  @Get('utility/staking-rewards')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get LXOM staking rewards' })
  @ApiResponse({ status: 200, description: 'Staking rewards calculated' })
  getStakingRewards(@CurrentUserId() userId: string) {
    return this.tokenUtilityService.getStakingRewards(userId);
  }
}
