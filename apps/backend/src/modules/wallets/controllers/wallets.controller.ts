import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { WalletsService } from '../services/wallets.service';
import { EmbeddedWalletService } from '../services/embedded-wallet.service';
import { CreateEmbeddedWalletDto, RecoverWalletDto } from '../dto/embedded-wallet.dto';
import { WalletCreateDto } from '../entities/wallet.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUserId } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../../../common/enums';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Wallets')
@Controller('wallets')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class WalletsController {
  constructor(
    private readonly walletsService: WalletsService,
    private readonly embeddedWalletService: EmbeddedWalletService,
  ) {}

  @Get()
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get all wallets for current user' })
  @ApiResponse({ status: 200, description: 'Wallets retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getUserWallets(@CurrentUserId() userId: string) {
    return this.walletsService.getUserWallets(userId);
  }

  @Get(':id')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get wallet by ID with balances' })
  @ApiResponse({ status: 200, description: 'Wallet retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Wallet not found' })
  getWallet(@CurrentUserId() userId: string, @Param('id') walletId: string) {
    return this.walletsService.getWalletWithBalances(userId, walletId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @ApiOperation({ summary: 'Add a new wallet' })
  @ApiResponse({ status: 201, description: 'Wallet added successfully' })
  @ApiResponse({ status: 409, description: 'Wallet already exists' })
  @ApiResponse({ status: 400, description: 'Invalid wallet address' })
  createWallet(@CurrentUserId() userId: string, @Body() dto: WalletCreateDto) {
    return this.walletsService.createWallet(userId, dto);
  }

  @Post(':id/sync')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Sync wallet balances from blockchain' })
  @ApiResponse({ status: 200, description: 'Wallet synced successfully' })
  @ApiResponse({ status: 404, description: 'Wallet not found' })
  syncWallet(@CurrentUserId() userId: string, @Param('id') walletId: string) {
    return this.walletsService.syncWalletBalances(walletId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Remove wallet (soft delete)' })
  @ApiResponse({ status: 200, description: 'Wallet removed successfully' })
  @ApiResponse({ status: 404, description: 'Wallet not found' })
  deleteWallet(@CurrentUserId() userId: string, @Param('id') walletId: string) {
    return this.walletsService.deleteWallet(userId, walletId);
  }

  @Post('embedded')
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @ApiOperation({ summary: 'Create embedded wallet (MPC/AA)' })
  @ApiResponse({ status: 201, description: 'Embedded wallet created successfully' })
  @ApiResponse({ status: 409, description: 'Embedded wallet already exists' })
  createEmbeddedWallet(@CurrentUserId() userId: string, @Body() dto: CreateEmbeddedWalletDto) {
    return this.embeddedWalletService.createEmbeddedWallet(userId, dto);
  }

  @Post('embedded/recover')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Recover embedded wallet with recovery key' })
  @ApiResponse({ status: 200, description: 'Wallet recovered successfully' })
  @ApiResponse({ status: 400, description: 'Invalid recovery key' })
  recoverEmbeddedWallet(@CurrentUserId() userId: string, @Body() dto: RecoverWalletDto) {
    return this.embeddedWalletService.recoverEmbeddedWallet(userId, dto.recoveryKey);
  }
}
