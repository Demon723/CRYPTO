import { PortfolioService } from '../services/portfolio.service';
export declare class PortfolioController {
    private readonly portfolioService;
    constructor(portfolioService: PortfolioService);
    getSummary(userId: string): Promise<import("../entities/portfolio.entity").PortfolioSummary>;
    getAssetAllocation(userId: string): Promise<import("../entities/portfolio.entity").AssetAllocation>;
    getPerformance(userId: string, period?: string): Promise<import("../entities/portfolio.entity").HistoricalPerformance[]>;
    getProfitLoss(userId: string): Promise<import("../entities/portfolio.entity").ProfitLoss>;
    getFullReport(userId: string): Promise<import("../entities/portfolio.entity").PortfolioReport>;
}
