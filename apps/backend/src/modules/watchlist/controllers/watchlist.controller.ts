import {
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Delete,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { WatchlistService } from '../services/watchlist.service';
import { CreateWatchlistDto } from '../entities/watchlist.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUserId } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../../../common/enums';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Watchlist')
@Controller('watchlist')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class WatchlistController {
  constructor(private readonly watchlistService: WatchlistService) {}

  @Get()
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get all watchlists for current user' })
  @ApiResponse({ status: 200, description: 'Watchlists retrieved' })
  getUserWatchlists(@CurrentUserId() userId: string) {
    return this.watchlistService.getUserWatchlists(userId);
  }

  @Get(':id')
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get watchlist by ID' })
  @ApiResponse({ status: 200, description: 'Watchlist retrieved' })
  @ApiResponse({ status: 404, description: 'Watchlist not found' })
  getWatchlist(@CurrentUserId() userId: string, @Param('id') watchlistId: string) {
    return this.watchlistService.getWatchlistById(userId, watchlistId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @ApiOperation({ summary: 'Create a new watchlist' })
  @ApiResponse({ status: 201, description: 'Watchlist created' })
  createWatchlist(@CurrentUserId() userId: string, @Body() dto: CreateWatchlistDto) {
    return this.watchlistService.createWatchlist(userId, dto);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @ApiOperation({ summary: 'Update watchlist' })
  @ApiResponse({ status: 200, description: 'Watchlist updated' })
  updateWatchlist(@CurrentUserId() userId: string, @Param('id') watchlistId: string, @Body() dto: Partial<CreateWatchlistDto>) {
    return this.watchlistService.updateWatchlist(userId, watchlistId, dto);
  }

  @Post(':id/add')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Add symbol to watchlist' })
  @ApiResponse({ status: 200, description: 'Symbol added' })
  addToWatchlist(@CurrentUserId() userId: string, @Param('id') watchlistId: string, @Body('symbol') symbol: string) {
    return this.watchlistService.addToWatchlist(userId, watchlistId, symbol);
  }

  @Post(':id/remove')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Remove symbol from watchlist' })
  @ApiResponse({ status: 200, description: 'Symbol removed' })
  removeFromWatchlist(@CurrentUserId() userId: string, @Param('id') watchlistId: string, @Body('symbol') symbol: string) {
    return this.watchlistService.removeFromWatchlist(userId, watchlistId, symbol);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete watchlist' })
  @ApiResponse({ status: 200, description: 'Watchlist deleted' })
  deleteWatchlist(@CurrentUserId() userId: string, @Param('id') watchlistId: string) {
    return this.watchlistService.deleteWatchlist(userId, watchlistId);
  }
}
