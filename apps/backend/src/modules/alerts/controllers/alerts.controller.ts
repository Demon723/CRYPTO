import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AlertsService } from '../services/alerts.service';
import { CreateAlertDto } from '../entities/alert.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUserId } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../../../common/enums';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Alerts')
@Controller('alerts')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get()
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get all alerts for current user' })
  @ApiResponse({ status: 200, description: 'Alerts retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getUserAlerts(@CurrentUserId() userId: string) {
    return this.alertsService.getUserAlerts(userId);
  }

  @Get(':id')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get specific alert by ID' })
  @ApiResponse({ status: 200, description: 'Alert retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Alert not found' })
  getAlert(@CurrentUserId() userId: string, @Param('id') alertId: string) {
    return this.alertsService.getAlertById(userId, alertId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @ApiOperation({ summary: 'Create a new alert' })
  @ApiResponse({ status: 201, description: 'Alert created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid alert configuration' })
  createAlert(@CurrentUserId() userId: string, @Body() dto: CreateAlertDto) {
    return this.alertsService.createAlert(userId, dto);
  }

  @Patch(':id/pause')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Pause an alert' })
  @ApiResponse({ status: 200, description: 'Alert paused successfully' })
  pauseAlert(@CurrentUserId() userId: string, @Param('id') alertId: string) {
    return this.alertsService.pauseAlert(userId, alertId);
  }

  @Patch(':id/resume')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Resume a paused alert' })
  @ApiResponse({ status: 200, description: 'Alert resumed successfully' })
  resumeAlert(@CurrentUserId() userId: string, @Param('id') alertId: string) {
    return this.alertsService.resumeAlert(userId, alertId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete an alert' })
  @ApiResponse({ status: 200, description: 'Alert deleted successfully' })
  deleteAlert(@CurrentUserId() userId: string, @Param('id') alertId: string) {
    return this.alertsService.deleteAlert(userId, alertId);
  }
}
