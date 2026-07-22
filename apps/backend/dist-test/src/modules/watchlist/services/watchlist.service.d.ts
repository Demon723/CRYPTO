import { PrismaService } from '../../common/modules/prisma.service';
import { WatchlistEntity, CreateWatchlistDto } from '../entities/watchlist.entity';
export declare class WatchlistService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getUserWatchlists(userId: string): Promise<WatchlistEntity[]>;
    getWatchlistById(userId: string, watchlistId: string): Promise<WatchlistEntity>;
    createWatchlist(userId: string, dto: CreateWatchlistDto): Promise<WatchlistEntity>;
    updateWatchlist(userId: string, watchlistId: string, dto: Partial<CreateWatchlistDto>): Promise<WatchlistEntity>;
    deleteWatchlist(userId: string, watchlistId: string): Promise<void>;
    addToWatchlist(userId: string, watchlistId: string, symbol: string): Promise<WatchlistEntity>;
    removeFromWatchlist(userId: string, watchlistId: string, symbol: string): Promise<WatchlistEntity>;
}
