import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/modules/prisma.service';
import { LoggerService } from '../../common/modules/logger.service';

@Injectable()
export class RiskService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async getWalletRiskScore(userId: string, walletId: string): Promise<{
    score: number;
    level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    factors: Array<{ factor: string; impact: number; description: string }>;
  }> {
    const wallet = await this.prisma.wallet.findFirst({
      where: { id: walletId, userId },
      include: { balances: true, transactions: true },
    });

    if (!wallet) {
      throw new Error('Wallet not found');
    }

    const factors: Array<{ factor: string; impact: number; description: string }> = [];
    let score = 100;

    const contractTxs = wallet.transactions?.filter((t: any) => t.type === 'CONTRACT_CALL').length || 0;
    if (contractTxs > 50) {
      score -= 10;
      factors.push({ factor: 'HIGH_CONTRACT_ACTIVITY', impact: -10, description: 'Wallet interacts with many contracts' });
    }

    const unknownTokens = wallet.balances?.filter((b: any) => !b.isVerified).length || 0;
    if (unknownTokens > 0) {
      score -= 5 * unknownTokens;
      factors.push({ factor: 'UNVERIFIED_TOKENS', impact: -5 * unknownTokens, description: `${unknownTokens} unverified tokens in wallet` });
    }

    const walletAgeDays = (Date.now() - new Date(wallet.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    if (walletAgeDays < 7) {
      score -= 5;
      factors.push({ factor: 'NEW_WALLET', impact: -5, description: 'Wallet is less than 7 days old' });
    }

    score = Math.max(0, Math.min(100, score));
    const level = score >= 80 ? 'LOW' : score >= 60 ? 'MEDIUM' : score >= 40 ? 'HIGH' : 'CRITICAL';

    return { score, level, factors };
  }

  async getPortfolioHealth(userId: string): Promise<{
    overallScore: number;
    wallets: Array<{ walletId: string; address: string; score: number; level: string }>;
    recommendations: string[];
  }> {
    const wallets = await this.prisma.wallet.findMany({
      where: { userId, isActive: true },
    });

    const walletScores: Array<{ walletId: string; address: string; score: number; level: string }> = [];
    let totalScore = 0;

    for (const wallet of wallets) {
      const risk = await this.getWalletRiskScore(userId, wallet.id);
      walletScores.push({
        walletId: wallet.id,
        address: wallet.address,
        score: risk.score,
        level: risk.level,
      });
      totalScore += risk.score;
    }

    const overallScore = wallets.length > 0 ? Math.round(totalScore / wallets.length) : 0;
    const recommendations = this.generateRecommendations(walletScores);

    return {
      overallScore,
      wallets: walletScores,
      recommendations,
    };
  }

  private generateRecommendations(walletScores: Array<{ walletId: string; address: string; score: number; level: string }>): string[] {
    const recommendations: string[] = [];
    const lowScoreWallets = walletScores.filter(w => w.score < 60);
    if (lowScoreWallets.length > 0) {
      recommendations.push(`Consider moving funds from ${lowScoreWallets.length} high-risk wallets to a new address`);
    }
    const criticalWallets = walletScores.filter(w => w.level === 'CRITICAL');
    if (criticalWallets.length > 0) {
      recommendations.push('Immediate action required: one or more wallets show critical risk indicators');
    }
    if (recommendations.length === 0) {
      recommendations.push('Your portfolio health is good. Continue monitoring regularly.');
    }
    return recommendations;
  }
}
