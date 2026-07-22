import { PrismaService } from '../../../common/modules/prisma.service';
import { WalletsService } from '../../wallets/services/wallets.service';
import { PortfolioSummary, AssetAllocation, HistoricalPerformance, ProfitLoss, PortfolioReport } from '../entities/portfolio.entity';
export declare class PortfolioService {
    private readonly prisma;
    private readonly walletsService;
    private readonly logger;
    constructor(prisma: PrismaService, walletsService: WalletsService);
    getPortfolioSummary(userId: string): Promise<PortfolioSummary>;
    getAssetAllocation(userId: string): Promise<AssetAllocation>;
    getHistoricalPerformance(userId: string, period?: string): Promise<HistoricalPerformance[]>;
    getProfitLoss(userId: string): Promise<ProfitLoss>;
    getFullReport(userId: string): Promise<PortfolioReport>;
    private generateDataPoints;
}
