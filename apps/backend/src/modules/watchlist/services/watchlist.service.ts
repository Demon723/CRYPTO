// @ts-nocheck
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../common/modules/prisma.service';
import { WatchlistEntity, CreateWatchlistDto } from '../entities/watchlist.entity';
import { LoggerService } from '../../common/modules/logger.service';

@Injectable()
export class WatchlistService {
  private readonly logger = new LoggerService();

  constructor(private readonly prisma: PrismaService) {}

  async getUserWatchlists(userId: string): Promise<WatchlistEntity[]> {
    const watchlists = await this.prisma.watchlist.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return watchlists.map((w) => ({
      ...w,
      symbols: typeof w.symbols === 'string' ? JSON.parse(w.symbols) : w.symbols,
    }));
  }

  async getWatchlistById(userId: string, watchlistId: string): Promise<WatchlistEntity> {
    const watchlist = await this.prisma.watchlist.findFirst({
      where: { id: watchlistId, userId },
    });

    if (!watchlist) {
      throw new NotFoundException('Watchlist not found');
    }

    return {
      ...watchlist,
      symbols: typeof watchlist.symbols === 'string' ? JSON.parse(watchlist.symbols) : watchlist.symbols,
    };
  }

  async createWatchlist(userId: string, dto: CreateWatchlistDto): Promise<WatchlistEntity> {
    const existing = await this.prisma.watchlist.findFirst({
      where: { userId, name: dto.name },
    });

    if (existing) {
      throw new ConflictException('Watchlist with this name already exists');
    }

    const watchlist = await this.prisma.watchlist.create({
      data: {
        userId,
        name: dto.name,
        symbols: JSON.stringify(dto.symbols),
        isPublic: dto.isPublic || false,
      },
    });

    this.logger.log(`Watchlist created: ${watchlist.id} for user ${userId}`, 'WatchlistService');

    return {
      ...watchlist,
      symbols: typeof watchlist.symbols === 'string' ? JSON.parse(watchlist.symbols) : watchlist.symbols,
    };
  }

  async updateWatchlist(userId: string, watchlistId: string, dto: Partial<CreateWatchlistDto>): Promise<WatchlistEntity> {
    await this.getWatchlistById(userId, watchlistId);

    const updateData: Record<string, unknown> = {
      name: dto.name,
      isPublic: dto.isPublic,
    };

    if (dto.symbols) {
      updateData.symbols = JSON.stringify(dto.symbols);
    }

    const updated = await this.prisma.watchlist.update({
      where: { id: watchlistId },
      data: updateData,
    });

    return {
      ...updated,
      symbols: typeof updated.symbols === 'string' ? JSON.parse(updated.symbols) : updated.symbols,
    };
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
    const symbols = Array.isArray(watchlist.symbols) ? watchlist.symbols : JSON.parse(watchlist.symbols);

    if (symbols.includes(symbol)) {
      throw new BadRequestException('Symbol already in watchlist');
    }

    const updated = await this.prisma.watchlist.update({
      where: { id: watchlistId },
      data: {
        symbols: JSON.stringify([...symbols, symbol]),
      },
    });

    return {
      ...updated,
      symbols: typeof updated.symbols === 'string' ? JSON.parse(updated.symbols) : updated.symbols,
    };
  }

  async removeFromWatchlist(userId: string, watchlistId: string, symbol: string): Promise<WatchlistEntity> {
    const watchlist = await this.getWatchlistById(userId, watchlistId);
    const symbols = Array.isArray(watchlist.symbols) ? watchlist.symbols : JSON.parse(watchlist.symbols);

    if (!symbols.includes(symbol)) {
      throw new BadRequestException('Symbol not in watchlist');
    }

    const updated = await this.prisma.watchlist.update({
      where: { id: watchlistId },
      data: {
        symbols: JSON.stringify(symbols.filter((s: string) => s !== symbol)),
      },
    });

    return {
      ...updated,
      symbols: typeof updated.symbols === 'string' ? JSON.parse(updated.symbols) : updated.symbols,
    };
  }
}
