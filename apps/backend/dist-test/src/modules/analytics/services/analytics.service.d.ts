import { PrismaService } from '../../common/modules/prisma.service';
import { RedisService } from '../../common/modules/redis.service';
import { AnalyticsSummary, DashboardStats } from '../entities/analytics.entity';
export declare class AnalyticsService {
    private readonly prisma;
    private readonly redisService;
    private readonly logger;
    private readonly cacheTtl;
    constructor(prisma: PrismaService, redisService: RedisService);
    trackEvent(userId: string | undefined, event: string, properties: Record<string, unknown>, sessionId?: string): Promise<void>;
    getDashboardStats(period?: string): Promise<DashboardStats>;
    getAnalyticsSummary(period?: string): Promise<AnalyticsSummary>;
    getAiUsageStats(userId?: string, period?: string): Promise<{
        totalQueries: number;
        period: string;
        byDay: {
            date: string;
            count: number;
        }[];
    }>;
}
