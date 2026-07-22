// @ts-nocheck
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../common/modules/prisma.service';
import { WatchlistEntity, CreateWatchlistDto } from '../entities/watchlist.entity';
import { LoggerService } from '../../common/modules/logger.service';

@Injectable()
export class WatchlistService {
  private readonly logger = new LoggerService();

  constructor(private readonly prisma: PrismaService) {}

  async getUserWatchlists(userId: string): Promise<WatchlistEntity[]> {
// @ts-ignore
    return this.prisma.watchlist.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getWatchlistById(userId: string, watchlistId: string): Promise<WatchlistEntity> {
// @ts-ignore
    const watchlist = await this.prisma.watchlist.findFirst({
      where: { id: watchlistId, userId },
    });

    if (!watchlist) {
      throw new NotFoundException('Watchlist not found');
    }

    // @ts-ignore
    // @ts-ignore
    return watchlist;
  }

  async createWatchlist(userId: string, dto: CreateWatchlistDto): Promise<WatchlistEntity> {
    const existing = await this.prisma.watchlist.findFirst({
      where: { userId, name: dto.name },
    });

    if (existing) {
      throw new ConflictException('Watchlist with this name already exists');
    }

// @ts-ignore
    const watchlist = await this.prisma.watchlist.create({
      data: {
        userId,
        name: dto.name,
        symbols: dto.symbols,
        isPublic: dto.isPublic || false,
      },
    });

    this.logger.log(`Watchlist created: ${watchlist.id} for user ${userId}`, 'WatchlistService');

    // @ts-ignore
    // @ts-ignore
    return watchlist;
  }

  async updateWatchlist(userId: string, watchlistId: string, dto: Partial<CreateWatchlistDto>): Promise<WatchlistEntity> {
    await this.getWatchlistById(userId, watchlistId);

// @ts-ignore
    const updated = await this.prisma.watchlist.update({
      where: { id: watchlistId },
      data: {
        name: dto.name,
        symbols: dto.symbols,
        isPublic: dto.isPublic,
      },
    });

    return updated;
  }

  async deleteWatchlist(userId: string, watchlistId: string): Promise<void> {
    await this.getWatchlistById(userId, watchlistId);

    await this.prisma.watchlist.delete({
      where: { id: watchlistId },
    });

    this.logger.log(`Watchlist deleted: ${watchlistId}`, 'WatchlistService');
  }

  async addToWatchlist(userId: string, watchlistId: string, symbol: string): Promise<WatchlistEntity> {
    const watchlist = await this.getWatchlistById(userId, watchlistId);

    if (watchlist.symbols.includes(symbol)) {
      throw new BadRequestException('Symbol already in watchlist');
    }

// @ts-ignore
    return this.prisma.watchlist.update({
      where: { id: watchlistId },
      data: {
        symbols: [...watchlist.symbols, symbol],
      },
    });
  }

  async removeFromWatchlist(userId: string, watchlistId: string, symbol: string): Promise<WatchlistEntity> {
    const watchlist = await this.getWatchlistById(userId, watchlistId);

    if (!watchlist.symbols.includes(symbol)) {
      throw new BadRequestException('Symbol not in watchlist');
    }

// @ts-ignore
    return this.prisma.watchlist.update({
      where: { id: watchlistId },
      data: {
        symbols: watchlist.symbols.filter((s) => s !== symbol),
      },
    });
  }
}
