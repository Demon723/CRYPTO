import { AnalyticsService } from '../services/analytics.service';
export declare class AnalyticsController {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsService);
    trackEvent(body: {
        userId?: string;
        event: string;
        properties: Record<string, unknown>;
        sessionId?: string;
    }): Promise<void>;
    getDashboardStats(period?: string): Promise<import("../entities/analytics.entity").DashboardStats>;
    getSummary(period?: string): Promise<import("../entities/analytics.entity").AnalyticsSummary>;
    getAiUsage(userId?: string, period?: string): Promise<{
        totalQueries: number;
        period: string;
        byDay: {
            date: string;
            count: number;
        }[];
    }>;
}
