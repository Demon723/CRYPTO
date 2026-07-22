"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AnalyticsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/modules/prisma.service");
const redis_service_1 = require("../../common/modules/redis.service");
const logger_service_1 = require("../../common/modules/logger.service");
let AnalyticsService = AnalyticsService_1 = class AnalyticsService {
    constructor(prisma, redisService) {
        this.prisma = prisma;
        this.redisService = redisService;
        this.logger = new logger_service_1.LoggerService(AnalyticsService_1.name);
        this.cacheTtl = 300;
    }
    async trackEvent(userId, event, properties, sessionId) {
        await this.prisma.auditLog.create({
            data: {
                userId,
                action: event,
                resource: 'analytics',
                metadata: properties,
            },
        });
        if (userId) {
            const key = `analytics:user:${userId}:events`;
            await this.redisService.getClient().lpush(key, JSON.stringify({ event, properties, timestamp: new Date().toISOString() }));
            await this.redisService.getClient().ltrim(key, 0, 999);
        }
    }
    async getDashboardStats(period = '30d') {
        const cacheKey = `analytics:dashboard:${period}`;
        const cached = await this.redisService.get(cacheKey);
        if (cached)
            return cached;
        const now = new Date();
        const periodDays = parseInt(period.replace('d', ''), 10) || 30;
        const startDate = new Date(now);
        startDate.setDate(startDate.getDate() - periodDays);
        const [totalUsers, activeUsers, newUsers, totalWallets, totalTransactions, totalRevenue,] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.user.count({ where: { lastLoginAt: { gte: startDate } } }),
            this.prisma.user.count({ where: { createdAt: { gte: startDate } } }),
            this.prisma.wallet.count({ where: { isActive: true } }),
            this.prisma.transaction.count({ where: { createdAt: { gte: startDate } } }),
            this.prisma.payment.aggregate({
                where: { status: 'SUCCEEDED', paidAt: { gte: startDate } },
                _sum: { amount: true },
            }),
        ]);
        const stats = {
            users: {
                total: totalUsers,
                active: activeUsers,
                new: newUsers,
                growth: '0',
            },
            revenue: {
                total: totalRevenue._sum.amount?.toString() || '0',
                monthly: totalRevenue._sum.amount?.toString() || '0',
                growth: '0',
            },
            ai: {
                totalQueries: 0,
                avgPerUser: 0,
                popularModels: [],
            },
            wallets: {
                total: totalWallets,
                totalValueUsd: '0',
                byChain: {},
            },
            topTokens: [],
            recentActivity: [],
        };
        await this.redisService.set(cacheKey, stats, this.cacheTtl);
        return stats;
    }
    async getAnalyticsSummary(period = '30d') {
        const cacheKey = `analytics:summary:${period}`;
        const cached = await this.redisService.get(cacheKey);
        if (cached)
            return cached;
        const now = new Date();
        const periodDays = parseInt(period.replace('d', ''), 10) || 30;
        const startDate = new Date(now);
        startDate.setDate(startDate.getDate() - periodDays);
        const prevStartDate = new Date(startDate);
        prevStartDate.setDate(prevStartDate.getDate() - periodDays);
        const [totalUsers, activeUsers, newUsers, totalWallets, totalTransactions, totalAiQueries, totalRevenue, prevTotalUsers, prevRevenue,] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.user.count({ where: { lastLoginAt: { gte: startDate } } }),
            this.prisma.user.count({ where: { createdAt: { gte: startDate } } }),
            this.prisma.wallet.count(),
            this.prisma.transaction.count({ where: { createdAt: { gte: startDate } } }),
            this.prisma.message.count({ where: { createdAt: { gte: startDate } } }),
            this.prisma.payment.aggregate({ where: { status: 'SUCCEEDED', paidAt: { gte: startDate } }, _sum: { amount: true } }),
            this.prisma.user.count({ where: { createdAt: { gte: prevStartDate, lt: startDate } } }),
            this.prisma.payment.aggregate({ where: { status: 'SUCCEEDED', paidAt: { gte: prevStartDate, lt: startDate } }, _sum: { amount: true } }),
        ]);
        const summary = {
            totalUsers,
            activeUsers,
            newUsers,
            totalWallets,
            totalTransactions,
            totalAiQueries,
            totalRevenue: totalRevenue._sum.amount?.toString() || '0',
            period,
            previousPeriod: {
                totalUsers: prevTotalUsers,
                revenue: prevRevenue._sum.amount?.toString() || '0',
            },
        };
        await this.redisService.set(cacheKey, summary, this.cacheTtl);
        return summary;
    }
    async getAiUsageStats(userId, period = '30d') {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(period.replace('d', ''), 10) || 30);
        const where = userId ? { userId, createdAt: { gte: startDate } } : { createdAt: { gte: startDate } };
        const messages = await this.prisma.message.findMany({
            where,
            select: { role: true, createdAt: true },
            orderBy: { createdAt: 'desc' },
        });
        const totalQueries = messages.filter((m) => m.role === 'user').length;
        const byDay = {};
        for (const msg of messages) {
            if (msg.role === 'user') {
                const day = new Date(msg.createdAt).toISOString().split('T')[0];
                byDay[day] = (byDay[day] || 0) + 1;
            }
        }
        return {
            totalQueries,
            period,
            byDay: Object.entries(byDay).map(([date, count]) => ({ date, count })),
        };
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = AnalyticsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map