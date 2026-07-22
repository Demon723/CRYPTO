import { PrismaService } from '../../../common/modules/prisma.service';
import { HttpService } from '../../common/modules/http.service';
import { WalletEntity, WalletWithBalance, WalletCreateDto } from '../entities/wallet.entity';
export declare class WalletsService {
    private readonly prisma;
    private readonly httpService;
    private readonly logger;
    private readonly rpcUrls;
    constructor(prisma: PrismaService, httpService: HttpService);
    getUserWallets(userId: string): Promise<WalletEntity[]>;
    getWalletById(userId: string, walletId: string): Promise<WalletEntity>;
    createWallet(userId: string, dto: WalletCreateDto): Promise<WalletEntity>;
    deleteWallet(userId: string, walletId: string): Promise<void>;
    syncWalletBalances(walletId: string): Promise<void>;
    getWalletWithBalances(userId: string, walletId: string): Promise<WalletWithBalance>;
    private fetchTokenBalances;
    private getNativeBalance;
    private getNativeSymbol;
    private getNativeName;
}
