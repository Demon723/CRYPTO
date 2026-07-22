import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ReferralService } from '../services/referral.service';
import { CreateReferralCodeDto } from '../entities/referral.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUserId } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ApplyReferralDto } from '../dto/apply-referral.dto';
import { UsePipes, ValidationPipe } from '@nestjs/common';
import { UserRole } from '../../../common/enums';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Referral')
@Controller('referral')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ReferralController {
  constructor(private readonly referralService: ReferralService) {}

  @Get('code')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get or create referral code for current user' })
  @ApiResponse({ status: 200, description: 'Referral code retrieved or created' })
  getReferralCode(@CurrentUserId() userId: string) {
    return this.referralService.getOrCreateReferralCode(userId);
  }

  @Get('stats')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get referral statistics' })
  @ApiResponse({ status: 200, description: 'Referral stats retrieved' })
  getStats(@CurrentUserId() userId: string) {
    return this.referralService.getReferralStats(userId);
  }

  @Post('apply')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Apply a referral code' })
  @ApiResponse({ status: 200, description: 'Referral code applied' })
  @ApiResponse({ status: 400, description: 'Invalid referral code' })
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  applyReferralCode(@CurrentUserId() userId: string, @Body() dto: ApplyReferralDto) {
    return this.referralService.applyReferralCode(userId, dto.code);
  }

  @Get('history')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get referral history' })
  @ApiResponse({ status: 200, description: 'Referral history retrieved' })
  getHistory(@CurrentUserId() userId: string) {
    return this.referralService.getUserReferrals(userId);
  }
}
