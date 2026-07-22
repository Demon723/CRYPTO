export interface AnalyticsEvent {
    id: string;
    userId?: string;
    event: string;
    properties: Record<string, unknown>;
    sessionId?: string;
    createdAt: Date;
}
export interface AnalyticsSummary {
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
    totalWallets: number;
    totalTransactions: number;
    totalAiQueries: number;
    totalRevenue: string;
    period: string;
    previousPeriod: Record<string, unknown>;
}
export interface DashboardStats {
    users: {
        total: number;
        active: number;
        new: number;
        growth: string;
    };
    revenue: {
        total: string;
        monthly: string;
        growth: string;
    };
    ai: {
        totalQueries: number;
        avgPerUser: number;
        popularModels: string[];
    };
    wallets: {
        total: number;
        totalValueUsd: string;
        byChain: Record<string, number>;
    };
    topTokens: Array<{
        symbol: string;
        name: string;
        searches: number;
    }>;
    recentActivity: Array<{
        id: string;
        event: string;
        userId: string;
        createdAt: Date;
    }>;
}
