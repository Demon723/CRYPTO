import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../common/modules/prisma.service';
import { WalletsService } from '../../wallets/services/wallets.service';
import {
  PortfolioSummary,
  AssetAllocation,
  HistoricalPerformance,
  ProfitLoss,
  PortfolioReport,
} from '../entities/portfolio.entity';
import { LoggerService } from '../../common/modules/logger.service';
import { formatUsd, formatPercentage } from '../../common/utils/app.utils';

@Injectable()
export class PortfolioService {
  private readonly logger = new LoggerService();

  constructor(
    private readonly prisma: PrismaService,
    private readonly walletsService: WalletsService,
  ) {}

  async getPortfolioSummary(userId: string): Promise<PortfolioSummary> {
    const wallets = await this.prisma.wallet.findMany({
      where: { userId, isActive: true },
      include: { balances: true },
    });

    let totalValueUsd = 0;
    const tokenValues: Map<string, { valueUsd: number; change24h: number; symbol: string; name: string }> = new Map();

    for (const wallet of wallets) {
      for (const balance of wallet.balances) {
        const value = parseFloat(balance.balanceUsd?.toString() || '0');
        const change = parseFloat(balance.change24h?.toString() || '0');
        totalValueUsd += value;

        const existing = tokenValues.get(balance.symbol);
        if (existing) {
          existing.valueUsd += value;
          existing.change24h += change;
        } else {
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
        valueUsd: formatUsd(t.valueUsd),
        change24h: formatUsd(t.change24h),
        percentage: formatPercentage((t.change24h / t.valueUsd) * 100 || 0),
      }));

    const topLosers = sortedTokens
      .filter((t) => t.change24h < 0)
      .sort((a, b) => a.change24h - b.change24h)
      .slice(0, 5)
      .map((t) => ({
        symbol: t.symbol,
        name: t.name,
        valueUsd: formatUsd(t.valueUsd),
        change24h: formatUsd(t.change24h),
        percentage: formatPercentage((t.change24h / t.valueUsd) * 100 || 0),
      }));

    const totalChange24h = sortedTokens.reduce((sum, t) => sum + t.change24h, 0);
    const totalChangePercentage24h = totalValueUsd > 0 ? (totalChange24h / (totalValueUsd - totalChange24h)) * 100 : 0;

    return {
      totalValueUsd: formatUsd(totalValueUsd),
      totalChange24h: formatUsd(totalChange24h),
      totalChangePercentage24h: formatPercentage(totalChangePercentage24h),
      totalRealizedPnl: '0.00',
      totalUnrealizedPnl: formatUsd(totalChange24h),
      totalPnl: formatUsd(totalChange24h),
      walletCount: wallets.length,
      topGainers,
      topLosers,
    };
  }

  async getAssetAllocation(userId: string): Promise<AssetAllocation> {
    const wallets = await this.prisma.wallet.findMany({
      where: { userId, isActive: true },
      include: { balances: true },
    });

    const chainValues: Map<string, { valueUsd: number; walletCount: number }> = new Map();
    const tokenValues: Map<string, { valueUsd: number; symbol: string; name: string; change24h: number }> = new Map();

    for (const wallet of wallets) {
      const chainKey = wallet.chain;
      const existingChain = chainValues.get(chainKey);
      if (existingChain) {
        existingChain.walletCount += 1;
      } else {
        chainValues.set(chainKey, { valueUsd: 0, walletCount: 1 });
      }

      for (const balance of wallet.balances) {
        const value = parseFloat(balance.balanceUsd?.toString() || '0');
        const change = parseFloat(balance.change24h?.toString() || '0');

        const chainEntry = chainValues.get(chainKey)!;
        chainEntry.valueUsd += value;

        const existingToken = tokenValues.get(balance.symbol);
        if (existingToken) {
          existingToken.valueUsd += value;
          existingToken.change24h += change;
        } else {
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
        valueUsd: formatUsd(t.valueUsd),
        percentage: formatPercentage((t.valueUsd / totalValue) * 100 || 0),
        change24h: formatPercentage((t.change24h / t.valueUsd) * 100 || 0),
      }));

    const chains = Array.from(chainValues.entries())
      .map(([chain, data]) => ({
        chain,
        valueUsd: formatUsd(data.valueUsd),
        percentage: formatPercentage((data.valueUsd / totalValue) * 100 || 0),
        walletCount: data.walletCount,
      }))
      .sort((a, b) => parseFloat(b.valueUsd) - parseFloat(a.valueUsd));

    return { tokens, chains };
  }

  async getHistoricalPerformance(userId: string, period = '30d'): Promise<HistoricalPerformance[]> {
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
      value: formatUsd(Math.max(0, currentValue - (dataPoints.length - i) * 10)),
    }));

    return [
      {
        period,
        startValue: finalDataPoints[0]?.value || '0.00',
        endValue: finalDataPoints[finalDataPoints.length - 1]?.value || '0.00',
        change: formatUsd(parseFloat(finalDataPoints[finalDataPoints.length - 1]?.value || '0') - parseFloat(finalDataPoints[0]?.value || '0')),
        changePercentage: formatPercentage(
          ((parseFloat(finalDataPoints[finalDataPoints.length - 1]?.value || '0') -
            parseFloat(finalDataPoints[0]?.value || '0')) /
            parseFloat(finalDataPoints[0]?.value || '1')) *
            100,
        ),
        dataPoints: finalDataPoints,
      },
    ];
  }

  async getProfitLoss(userId: string): Promise<ProfitLoss> {
    const transactions = await this.prisma.transaction.findMany({
      where: { userId },
      select: {
        type: true,
        valueUsd: true,
        feeUsd: true,
        timestamp: true,
      },
    });

    const byToken: Map<string, { realized: number; unrealized: number; total: number }> = new Map();
    let totalRealized = 0;
    let totalUnrealized = 0;

    for (const tx of transactions) {
      const value = parseFloat(tx.valueUsd?.toString() || '0');
      const fee = parseFloat(tx.feeUsd?.toString() || '0');

      if (tx.type === 'SWAP' || tx.type === 'TRANSFER') {
        totalRealized += value - fee;
      } else {
        totalUnrealized += value - fee;
      }
    }

    const totalPnl = totalRealized + totalUnrealized;
    const tokenEntries = Array.from(byToken.entries()).map(([symbol, data]) => ({
      symbol,
      realizedPnl: formatUsd(data.realized),
      unrealizedPnl: formatUsd(data.unrealized),
      totalPnl: formatUsd(data.total),
      totalPnlPercentage: formatPercentage((data.total / (data.total || 1)) * 100),
    }));

    return {
      realizedPnl: formatUsd(totalRealized),
      unrealizedPnl: formatUsd(totalUnrealized),
      totalPnl: formatUsd(totalPnl),
      realizedPnlPercentage: formatPercentage(totalPnl > 0 ? (totalRealized / totalPnl) * 100 : 0),
      unrealizedPnlPercentage: formatPercentage(totalPnl > 0 ? (totalUnrealized / totalPnl) * 100 : 0),
      totalPnlPercentage: '0.00',
      byToken: tokenEntries,
    };
  }

  async getFullReport(userId: string): Promise<PortfolioReport> {
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

  private generateDataPoints(startDate: Date, endDate: Date, days: number) {
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
}
