import { WatchlistService } from '../services/watchlist.service';
import { CreateWatchlistDto } from '../entities/watchlist.entity';
export declare class WatchlistController {
    private readonly watchlistService;
    constructor(watchlistService: WatchlistService);
    getUserWatchlists(userId: string): Promise<import("../entities/watchlist.entity").WatchlistEntity[]>;
    getWatchlist(userId: string, watchlistId: string): Promise<import("../entities/watchlist.entity").WatchlistEntity>;
    createWatchlist(userId: string, dto: CreateWatchlistDto): Promise<import("../entities/watchlist.entity").WatchlistEntity>;
    updateWatchlist(userId: string, watchlistId: string, dto: Partial<CreateWatchlistDto>): Promise<import("../entities/watchlist.entity").WatchlistEntity>;
    addToWatchlist(userId: string, watchlistId: string, symbol: string): Promise<import("../entities/watchlist.entity").WatchlistEntity>;
    removeFromWatchlist(userId: string, watchlistId: string, symbol: string): Promise<import("../entities/watchlist.entity").WatchlistEntity>;
    deleteWatchlist(userId: string, watchlistId: string): Promise<void>;
}
