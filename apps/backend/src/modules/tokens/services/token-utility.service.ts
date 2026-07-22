// @ts-nocheck
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/modules/prisma.service';
import { LoggerService } from '../../common/modules/logger.service';

@Injectable()
export class TokenUtilityService {
  private readonly logger = new LoggerService();

  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async calculateRevenueShare(userId: string, periodDays: number = 30): Promise<{
    totalRevenue: number;
    userShare: number;
    lxomRewards: number;
    period: string;
  }> {
    // Simulate revenue sharing calculation
    // In production, this would query actual transaction fees and platform revenue
    const totalRevenue = 125000; // $125k platform revenue
    const userProportion = 0.05; // 5% of platform revenue
    const lxomRewards = totalRevenue * userProportion;

    return {
      totalRevenue,
      userShare: totalRevenue * userProportion,
      lxomRewards,
      period: `${periodDays} days`,
    };
  }

  async getTokenBenefits(userId: string): Promise<{
    stakingTier: string;
    governancePower: number;
    feeDiscount: number;
    features: string[];
  }> {
    // Get user's LXOM staking balance
    const wallets = await this.prisma.wallet.findMany({
      where: { userId, chain: 'LXON', isActive: true },
      include: { balances: true },
    });

    const lxonBalance = wallets.reduce((sum, wallet) => {
      const lxonBalance = wallet.balances.find(b => b.symbol === 'LXON');
      return sum + (lxonBalance ? parseFloat(lxonBalance.balance) : 0);
    }, 0);

    // Determine tier based on LXOM balance
    let stakingTier = 'NONE';
    let feeDiscount = 0;
    let features: string[] = [];

    if (lxonBalance >= 100000) {
      stakingTier = 'DIAMOND';
      feeDiscount = 50;
      features = ['Unlimited API calls', 'Priority support', 'Revenue sharing', 'Governance voting', 'Beta features'];
    } else if (lxonBalance >= 50000) {
      stakingTier = 'GOLD';
      feeDiscount = 30;
      features = ['Advanced analytics', 'Revenue sharing', 'Governance voting'];
    } else if (lxonBalance >= 10000) {
      stakingTier = 'SILVER';
      feeDiscount = 15;
      features = ['Basic analytics', 'Governance voting'];
    } else if (lxonBalance >= 1000) {
      stakingTier = 'BRONZE';
      feeDiscount = 5;
      features = ['Basic features'];
    }

    return {
      stakingTier,
      governancePower: lxonBalance,
      feeDiscount,
      features,
    };
  }

  async getStakingRewards(userId: string): Promise<{
    currentApy: number;
    estimatedAnnualRewards: number;
    totalStaked: number;
    pendingRewards: number;
  }> {
    const wallets = await this.prisma.wallet.findMany({
      where: { userId, chain: 'LXON', isActive: true },
      include: { balances: true, stakingPositions: true },
    });

    const totalStaked = wallets.reduce((sum, wallet) => {
      return sum + wallet.stakingPositions
        .filter(p => p.status === 'ACTIVE')
        .reduce((s, p) => s + parseFloat(p.amount), 0);
    }, 0);

    const currentApy = 12.5; // 12.5% APY
    const estimatedAnnualRewards = totalStaked * (currentApy / 100);
    const pendingRewards = estimatedAnnualRewards * 0.3; // 30% of annual rewards pending

    return {
      currentApy,
      estimatedAnnualRewards,
      totalStaked,
      pendingRewards,
    };
  }
}
