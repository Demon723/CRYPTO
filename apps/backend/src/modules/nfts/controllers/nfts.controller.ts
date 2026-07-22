import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
} from '@nestjs/common';
import { NftsService } from '../services/nfts.service';
import { SyncNftWalletDto } from '../dto/nft.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUserId } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../../../common/enums';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('NFTs')
@Controller('nfts')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class NftsController {
  constructor(private readonly nftsService: NftsService) {}

  @Get()
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get all NFTs for current user' })
  @ApiResponse({ status: 200, description: 'NFTs retrieved' })
  getUserNfts(@CurrentUserId() userId: string) {
    return this.nftsService.getUserNfts(userId);
  }

  @Get('wallet/:walletId')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get NFTs for specific wallet' })
  @ApiResponse({ status: 200, description: 'Wallet NFTs retrieved' })
  @ApiResponse({ status: 404, description: 'Wallet not found' })
  getWalletNfts(@CurrentUserId() userId: string, @Param('walletId') walletId: string) {
    return this.nftsService.getWalletNfts(userId, walletId);
  }

  @Get(':id')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get NFT by ID' })
  @ApiResponse({ status: 200, description: 'NFT retrieved' })
  @ApiResponse({ status: 404, description: 'NFT not found' })
  getNft(@CurrentUserId() userId: string, @Param('id') nftId: string) {
    return this.nftsService.getNftById(userId, nftId);
  }

  @Get('collections')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get NFT collections for current user' })
  @ApiResponse({ status: 200, description: 'Collections retrieved' })
  getCollections(@CurrentUserId() userId: string) {
    return this.nftsService.getCollections(userId);
  }

  @Post('wallet/:walletId/sync')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Sync NFTs from blockchain for wallet' })
  @ApiResponse({ status: 200, description: 'NFTs synced' })
  syncNfts(@CurrentUserId() userId: string, @Param('walletId') walletId: string) {
    return this.nftsService.syncNftsForWallet(userId, walletId);
  }
}
