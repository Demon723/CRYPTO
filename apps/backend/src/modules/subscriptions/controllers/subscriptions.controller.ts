import {
  Controller,
  Get,
  Post,
  Delete,
  UseGuards,
  Body,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  Query,
} from '@nestjs/common';
import { SubscriptionsService } from '../services/subscriptions.service';
import { UpgradeSubscriptionDto, CancelSubscriptionDto } from '../dto/subscription.dto';
import { SubscriptionPlan, SubscriptionStatus } from '../entities/subscription.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUserId } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../../../common/enums';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ParsePaginationPipe } from '../../common/pipes/parse-pagination.pipe';

@ApiTags('Subscriptions')
@Controller('subscriptions')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('current')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get current user subscription' })
  @ApiResponse({ status: 200, description: 'Subscription retrieved' })
  getCurrentSubscription(@CurrentUserId() userId: string) {
    return this.subscriptionsService.getUserSubscription(userId);
  }

  @Post('upgrade')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @ApiOperation({ summary: 'Upgrade or downgrade subscription plan' })
  @ApiResponse({ status: 200, description: 'Subscription updated' })
  upgradeSubscription(@CurrentUserId() userId: string, @Body() dto: UpgradeSubscriptionDto) {
    return this.subscriptionsService.updateSubscription(userId, dto.plan as SubscriptionPlan);
  }

  @Post('cancel')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @ApiOperation({ summary: 'Cancel subscription' })
  @ApiResponse({ status: 200, description: 'Subscription canceled' })
  cancelSubscription(
    @CurrentUserId() userId: string,
    @Body() dto: CancelSubscriptionDto,
  ) {
    return this.subscriptionsService.cancelSubscription(userId, dto.reason === 'false' ? false : true);
  }

  @Get('history')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get subscription history' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'History retrieved' })
  getHistory(@CurrentUserId() userId: string, @Query('page', ParsePaginationPipe) pagination: { page: number; limit: number }) {
    return this.subscriptionsService.getSubscriptionHistory(userId, pagination.page, pagination.limit);
  }

  @Post('check-expired')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Check and expire old subscriptions (admin only)' })
  @ApiResponse({ status: 200, description: 'Expired subscriptions count' })
  checkExpired() {
    return this.subscriptionsService.checkExpiredSubscriptions();
  }
}
