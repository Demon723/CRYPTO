import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Param,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { KycService } from '../services/kyc.service';
import { SubmitKycDto } from '../dto/kyc.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../../../common/enums';

@ApiTags('KYC')
@Controller('kyc')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class KycController {
  constructor(private readonly kycService: KycService) {}

  @Post('submit')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @ApiOperation({ summary: 'Submit KYC verification documents' })
  @ApiResponse({ status: 200, description: 'KYC submitted successfully' })
  @ApiResponse({ status: 400, description: 'Invalid KYC data or age requirement not met' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async submitKyc(@CurrentUser() user: { sub: string }, @Body() dto: SubmitKycDto) {
    return this.kycService.submitKyc(user.sub, dto);
  }

  @Get('status')
  @ApiOperation({ summary: 'Get current user KYC status' })
  @ApiResponse({ status: 200, description: 'KYC status retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getKycStatus(@CurrentUser() user: { sub: string }) {
    return this.kycService.getKycStatus(user.sub);
  }

  @Get('pending')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get all pending KYC submissions (admin only)' })
  @ApiResponse({ status: 200, description: 'Pending KYC submissions retrieved' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin only' })
  async getPendingKyc(@CurrentUser() user: { sub: string }) {
    return this.kycService.getPendingKyc(user.sub);
  }

  @Post('approve/:userId')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve user KYC verification (admin only)' })
  @ApiResponse({ status: 200, description: 'KYC approved' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin only' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async approveKyc(@CurrentUser() user: { sub: string }, @Param('userId') userId: string) {
    return this.kycService.approveKyc(user.sub, userId);
  }

  @Post('reject/:userId')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @ApiOperation({ summary: 'Reject user KYC verification with reason (admin only)' })
  @ApiResponse({ status: 200, description: 'KYC rejected' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin only' })
  async rejectKyc(
    @CurrentUser() user: { sub: string },
    @Param('userId') userId: string,
    @Body('reason') reason: string,
  ) {
    if (!reason || reason.trim().length < 5) {
      throw new BadRequestException('Rejection reason must be at least 5 characters');
    }
    return this.kycService.rejectKyc(user.sub, userId, reason.trim());
  }
}
