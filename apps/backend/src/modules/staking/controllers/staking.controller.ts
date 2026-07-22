import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { StakingService } from '../services/staking.service';
import { StakeDto, UnstakeDto, ClaimRewardsDto } from '../entities/staking.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUserId } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../../../common/enums';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Staking')
@Controller('staking')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class StakingController {
  constructor(private readonly stakingService: StakingService) {}

  @Get('positions')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get user staking positions' })
  @ApiResponse({ status: 200, description: 'Staking positions retrieved' })
  getUserPositions(@CurrentUserId() userId: string) {
    return this.stakingService.getUserStakingPositions(userId);
  }

  @Get('stats')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get staking statistics' })
  @ApiResponse({ status: 200, description: 'Stats retrieved' })
  getStats(@CurrentUserId() userId: string) {
    return this.stakingService.getStakingStats(userId);
  }

  @Post('stake')
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @ApiOperation({ summary: 'Create a new staking position' })
  @ApiResponse({ status: 201, description: 'Stake created' })
  @ApiResponse({ status: 400, description: 'Invalid staking amount' })
  createStake(@CurrentUserId() userId: string, @Body() dto: StakeDto) {
    return this.stakingService.createStake(userId, dto);
  }

  @Post('unstake')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @ApiOperation({ summary: 'Request unstake' })
  @ApiResponse({ status: 200, description: 'Unstake requested' })
  requestUnstake(@CurrentUserId() userId: string, @Body() dto: UnstakeDto) {
    return this.stakingService.requestUnstake(userId, dto);
  }

  @Post('claim-rewards')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @ApiOperation({ summary: 'Claim staking rewards' })
  @ApiResponse({ status: 200, description: 'Rewards claimed' })
  claimRewards(@CurrentUserId() userId: string, @Body() dto: ClaimRewardsDto) {
    return this.stakingService.claimRewards(userId, dto);
  }
}
