export interface PortfolioSummary {
    totalValueUsd: string;
    totalChange24h: string;
    totalChangePercentage24h: string;
    totalRealizedPnl: string;
    totalUnrealizedPnl: string;
    totalPnl: string;
    walletCount: number;
    topGainers: Array<{
        symbol: string;
        name: string;
        valueUsd: string;
        change24h: string;
        percentage: string;
    }>;
    topLosers: Array<{
        symbol: string;
        name: string;
        valueUsd: string;
        change24h: string;
        percentage: string;
    }>;
}
export interface AssetAllocation {
    tokens: Array<{
        symbol: string;
        name: string;
        valueUsd: string;
        percentage: string;
        change24h: string;
    }>;
    chains: Array<{
        chain: string;
        valueUsd: string;
        percentage: string;
        walletCount: number;
    }>;
}
export interface HistoricalPerformance {
    period: string;
    startValue: string;
    endValue: string;
    change: string;
    changePercentage: string;
    dataPoints: Array<{
        date: string;
        value: string;
    }>;
}
export interface ProfitLoss {
    realizedPnl: string;
    unrealizedPnl: string;
    totalPnl: string;
    realizedPnlPercentage: string;
    unrealizedPnlPercentage: string;
    totalPnlPercentage: string;
    byToken: Array<{
        symbol: string;
        realizedPnl: string;
        unrealizedPnl: string;
        totalPnl: string;
        totalPnlPercentage: string;
    }>;
}
export interface PortfolioReport {
    summary: PortfolioSummary;
    allocation: AssetAllocation;
    performance: HistoricalPerformance[];
    profitLoss: ProfitLoss;
    generatedAt: string;
}
