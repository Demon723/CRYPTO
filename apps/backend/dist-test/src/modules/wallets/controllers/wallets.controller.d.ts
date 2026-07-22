import { WalletsService } from '../services/wallets.service';
import { WalletCreateDto } from '../entities/wallet.entity';
export declare class WalletsController {
    private readonly walletsService;
    constructor(walletsService: WalletsService);
    getUserWallets(userId: string): Promise<import("../entities/wallet.entity").WalletEntity[]>;
    getWallet(userId: string, walletId: string): Promise<import("../entities/wallet.entity").WalletWithBalance>;
    createWallet(userId: string, dto: WalletCreateDto): Promise<import("../entities/wallet.entity").WalletEntity>;
    syncWallet(userId: string, walletId: string): Promise<void>;
    deleteWallet(userId: string, walletId: string): Promise<void>;
}
