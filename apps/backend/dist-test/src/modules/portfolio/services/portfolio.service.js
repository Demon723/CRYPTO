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
var PortfolioService_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PortfolioService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/modules/prisma.service");
const wallets_service_1 = require("../../wallets/services/wallets.service");
const logger_service_1 = require("../../common/modules/logger.service");
const app_utils_1 = require("../../common/utils/app.utils");
let PortfolioService = PortfolioService_1 = class PortfolioService {
    constructor(prisma, walletsService) {
        this.prisma = prisma;
        this.walletsService = walletsService;
        this.logger = new logger_service_1.LoggerService(PortfolioService_1.name);
    }
    async getPortfolioSummary(userId) {
        const wallets = await this.prisma.wallet.findMany({
            where: { userId, isActive: true },
            include: { balances: true },
        });
        let totalValueUsd = 0;
        const tokenValues = new Map();
        for (const wallet of wallets) {
            for (const balance of wallet.balances) {
                const value = parseFloat(balance.balanceUsd?.toString() || '0');
                const change = parseFloat(balance.change24h?.toString() || '0');
                totalValueUsd += value;
                const existing = tokenValues.get(balance.symbol);
                if (existing) {
                    existing.valueUsd += value;
                    existing.change24h += change;
                }
                else {
                    tokenValues.set(balance.symbol, {
                        valueUsd: value,
                        change24h: change,
                        symbol: balance.symbol,
                        name: balance.name,
                    });
                }
            }
        }
        const sortedTokens = Array.from(tokenValues.values())
            .sort((a, b) => b.valueUsd - a.valueUsd);
        const topGainers = sortedTokens
            .filter((t) => t.change24h > 0)
            .sort((a, b) => b.change24h - a.change24h)
            .slice(0, 5)
            .map((t) => ({
            symbol: t.symbol,
            name: t.name,
            valueUsd: (0, app_utils_1.formatUsd)(t.valueUsd),
            change24h: (0, app_utils_1.formatUsd)(t.change24h),
            percentage: (0, app_utils_1.formatPercentage)((t.change24h / t.valueUsd) * 100 || 0),
        }));
        const topLosers = sortedTokens
            .filter((t) => t.change24h < 0)
            .sort((a, b) => a.change24h - b.change24h)
            .slice(0, 5)
            .map((t) => ({
            symbol: t.symbol,
            name: t.name,
            valueUsd: (0, app_utils_1.formatUsd)(t.valueUsd),
            change24h: (0, app_utils_1.formatUsd)(t.change24h),
            percentage: (0, app_utils_1.formatPercentage)((t.change24h / t.valueUsd) * 100 || 0),
        }));
        const totalChange24h = sortedTokens.reduce((sum, t) => sum + t.change24h, 0);
        const totalChangePercentage24h = totalValueUsd > 0 ? (totalChange24h / (totalValueUsd - totalChange24h)) * 100 : 0;
        return {
            totalValueUsd: (0, app_utils_1.formatUsd)(totalValueUsd),
            totalChange24h: (0, app_utils_1.formatUsd)(totalChange24h),
            totalChangePercentage24h: (0, app_utils_1.formatPercentage)(totalChangePercentage24h),
            totalRealizedPnl: '0.00',
            totalUnrealizedPnl: (0, app_utils_1.formatUsd)(totalChange24h),
            totalPnl: (0, app_utils_1.formatUsd)(totalChange24h),
            walletCount: wallets.length,
            topGainers,
            topLosers,
        };
    }
    async getAssetAllocation(userId) {
        const wallets = await this.prisma.wallet.findMany({
            where: { userId, isActive: true },
            include: { balances: true },
        });
        const chainValues = new Map();
        const tokenValues = new Map();
        for (const wallet of wallets) {
            const chainKey = wallet.chain;
            const existingChain = chainValues.get(chainKey);
            if (existingChain) {
                existingChain.walletCount += 1;
            }
            else {
                chainValues.set(chainKey, { valueUsd: 0, walletCount: 1 });
            }
            for (const balance of wallet.balances) {
                const value = parseFloat(balance.balanceUsd?.toString() || '0');
                const change = parseFloat(balance.change24h?.toString() || '0');
                const chainEntry = chainValues.get(chainKey);
                chainEntry.valueUsd += value;
                const existingToken = tokenValues.get(balance.symbol);
                if (existingToken) {
                    existingToken.valueUsd += value;
                    existingToken.change24h += change;
                }
                else {
                    tokenValues.set(balance.symbol, {
                        valueUsd: value,
                        symbol: balance.symbol,
                        name: balance.name,
                        change24h: change,
                    });
                }
            }
        }
        const totalValue = Array.from(chainValues.values()).reduce((sum, c) => sum + c.valueUsd, 0);
        const tokens = Array.from(tokenValues.values())
            .sort((a, b) => b.valueUsd - a.valueUsd)
            .map((t) => ({
            symbol: t.symbol,
            name: t.name,
            valueUsd: (0, app_utils_1.formatUsd)(t.valueUsd),
            percentage: (0, app_utils_1.formatPercentage)((t.valueUsd / totalValue) * 100 || 0),
            change24h: (0, app_utils_1.formatPercentage)((t.change24h / t.valueUsd) * 100 || 0),
        }));
        const chains = Array.from(chainValues.entries())
            .map(([chain, data]) => ({
            chain,
            valueUsd: (0, app_utils_1.formatUsd)(data.valueUsd),
            percentage: (0, app_utils_1.formatPercentage)((data.valueUsd / totalValue) * 100 || 0),
            walletCount: data.walletCount,
        }))
            .sort((a, b) => parseFloat(b.valueUsd) - parseFloat(a.valueUsd));
        return { tokens, chains };
    }
    async getHistoricalPerformance(userId, period = '30d') {
        const endDate = new Date();
        const startDate = new Date();
        const days = parseInt(period.replace('d', ''), 10) || 30;
        startDate.setDate(endDate.getDate() - days);
        const transactions = await this.prisma.transaction.findMany({
            where: {
                userId,
                timestamp: { gte: startDate, lte: endDate },
            },
            select: {
                timestamp: true,
                valueUsd: true,
                feeUsd: true,
            },
        });
        const dataPoints = this.generateDataPoints(startDate, endDate, days);
        let currentValue = dataPoints[0]?.value || 0;
        for (const tx of transactions) {
            const dayIndex = Math.floor((new Date(tx.timestamp).getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
            if (dayIndex >= 0 && dayIndex < dataPoints.length) {
                currentValue += parseFloat(tx.valueUsd?.toString() || '0') - parseFloat(tx.feeUsd?.toString() || '0');
            }
        }
        const finalDataPoints = dataPoints.map((dp, i) => ({
            date: dp.date,
            value: (0, app_utils_1.formatUsd)(Math.max(0, currentValue - (dataPoints.length - i) * 10)),
        }));
        return [
            {
                period,
                startValue: finalDataPoints[0]?.value || '0.00',
                endValue: finalDataPoints[finalDataPoints.length - 1]?.value || '0.00',
                change: (0, app_utils_1.formatUsd)(parseFloat(finalDataPoints[finalDataPoints.length - 1]?.value || '0') - parseFloat(finalDataPoints[0]?.value || '0')),
                changePercentage: (0, app_utils_1.formatPercentage)(((parseFloat(finalDataPoints[finalDataPoints.length - 1]?.value || '0') -
                    parseFloat(finalDataPoints[0]?.value || '0')) /
                    parseFloat(finalDataPoints[0]?.value || '1')) *
                    100),
                dataPoints: finalDataPoints,
            },
        ];
    }
    async getProfitLoss(userId) {
        const transactions = await this.prisma.transaction.findMany({
            where: { userId },
            select: {
                type: true,
                valueUsd: true,
                feeUsd: true,
                timestamp: true,
            },
        });
        const byToken = new Map();
        let totalRealized = 0;
        let totalUnrealized = 0;
        for (const tx of transactions) {
            const value = parseFloat(tx.valueUsd?.toString() || '0');
            const fee = parseFloat(tx.feeUsd?.toString() || '0');
            if (tx.type === 'SWAP' || tx.type === 'TRANSFER') {
                totalRealized += value - fee;
            }
            else {
                totalUnrealized += value - fee;
            }
        }
        const totalPnl = totalRealized + totalUnrealized;
        const tokenEntries = Array.from(byToken.entries()).map(([symbol, data]) => ({
            symbol,
            realizedPnl: (0, app_utils_1.formatUsd)(data.realized),
            unrealizedPnl: (0, app_utils_1.formatUsd)(data.unrealized),
            totalPnl: (0, app_utils_1.formatUsd)(data.total),
            totalPnlPercentage: (0, app_utils_1.formatPercentage)((data.total / (data.total || 1)) * 100),
        }));
        return {
            realizedPnl: (0, app_utils_1.formatUsd)(totalRealized),
            unrealizedPnl: (0, app_utils_1.formatUsd)(totalUnrealized),
            totalPnl: (0, app_utils_1.formatUsd)(totalPnl),
            realizedPnlPercentage: (0, app_utils_1.formatPercentage)(totalPnl > 0 ? (totalRealized / totalPnl) * 100 : 0),
            unrealizedPnlPercentage: (0, app_utils_1.formatPercentage)(totalPnl > 0 ? (totalUnrealized / totalPnl) * 100 : 0),
            totalPnlPercentage: '0.00',
            byToken: tokenEntries,
        };
    }
    async getFullReport(userId) {
        const [summary, allocation, performance, profitLoss] = await Promise.all([
            this.getPortfolioSummary(userId),
            this.getAssetAllocation(userId),
            this.getHistoricalPerformance(userId),
            this.getProfitLoss(userId),
        ]);
        return {
            summary,
            allocation,
            performance,
            profitLoss,
            generatedAt: new Date().toISOString(),
        };
    }
    generateDataPoints(startDate, endDate, days) {
        const dataPoints = [];
        const interval = Math.ceil(days / 30);
        const current = new Date(startDate);
        while (current <= endDate) {
            dataPoints.push({
                date: current.toISOString().split('T')[0],
                value: Math.random() * 10000 + 5000,
            });
            current.setDate(current.getDate() + interval);
        }
        return dataPoints;
    }
};
exports.PortfolioService = PortfolioService;
exports.PortfolioService = PortfolioService = PortfolioService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object, wallets_service_1.WalletsService])
], PortfolioService);
//# sourceMappingURL=portfolio.service.js.map