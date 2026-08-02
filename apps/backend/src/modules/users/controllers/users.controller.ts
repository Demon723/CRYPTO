import {
  Controller,
  Get,
  Param,
  UseGuards,
  Query,
  UsePipes,
  ValidationPipe,
  Body,
  HttpCode,
  HttpStatus,
  Put,
} from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../../../common/enums';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { OwnerGuardService } from '../../common/modules/crypto/owner-guard.service';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getProfile(@CurrentUser() user: { sub: string; email: string; role: string }) {
    return this.usersService.findById(user.sub);
  }

  @Get('owner/:userId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @UseGuards(OwnerGuardService)
  @ApiOperation({ summary: 'Get decrypted user data (owner only)' })
  @ApiResponse({ status: 200, description: 'Decrypted user data retrieved' })
  @ApiResponse({ status: 403, description: 'Forbidden - owner only' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getDecryptedUserData(@Param('userId') userId: string) {
    return this.usersService.getDecryptedUserData(userId);
  }

  @Put('owner/:userId/encrypt')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @UseGuards(OwnerGuardService)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Re-encrypt user data with current owner key' })
  @ApiResponse({ status: 200, description: 'User data re-encrypted' })
  @ApiResponse({ status: 403, description: 'Forbidden - owner only' })
  async reEncryptUserData(@Param('userId') userId: string) {
    return this.usersService.reEncryptUserData(userId);
  }
}
