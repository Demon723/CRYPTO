// @ts-nocheck
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../common/modules/prisma.service';
import { StakingPositionEntity, StakeDto, UnstakeDto, ClaimRewardsDto, StakingStatus } from '../entities/staking.entity';
import { LoggerService } from '../../common/modules/logger.service';

@Injectable()
export class StakingService {
  private readonly logger = new LoggerService();
  private readonly defaultApy = 12;
  private readonly defaultLockPeriodDays = 30;

  constructor(private readonly prisma: PrismaService) {}

  async getUserStakingPositions(userId: string) {
    return this.prisma.stakingPosition.findMany({
      where: { userId },
      include: { wallet: { select: { address: true, chain: true, label: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getStakingPosition(userId: string, positionId: string): Promise<StakingPositionEntity> {
    const position = await this.prisma.stakingPosition.findFirst({
      where: { id: positionId, userId },
      include: { wallet: true },
    });

    if (!position) {
      throw new NotFoundException('Staking position not found');
    }

    // @ts-ignore
    return position;
  }

// @ts-ignore
  async createStake(userId: string, dto: StakeDto): Promise<StakingPositionEntity> {
    const wallet = await this.prisma.wallet.findFirst({
      where: { id: dto.walletId, userId, isActive: true },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    const amount = parseFloat(dto.amount);
    if (isNaN(amount) || amount <= 0) {
      throw new BadRequestException('Invalid staking amount');
    }

    const lockPeriodDays = dto.lockPeriodDays || this.defaultLockPeriodDays;
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + lockPeriodDays);

    const position = await this.prisma.stakingPosition.create({
      data: {
        userId,
        walletId: dto.walletId,
        amount: amount.toFixed(18),
        apy: this.defaultApy.toFixed(4),
        startDate,
        endDate,
        status: StakingStatus.ACTIVE,
      },
      include: { wallet: true },
    });

    this.logger.log(`Stake created: ${position.id} for user ${userId}`, 'StakingService');

    // @ts-ignore
    return position;
// @ts-ignore
  }

  async requestUnstake(userId: string, dto: UnstakeDto): Promise<StakingPositionEntity> {
    const position = await this.getStakingPosition(userId, dto.positionId);

    if (position.status !== StakingStatus.ACTIVE) {
      throw new BadRequestException('Position is not active');
    }

    if (position.unstakeRequestedAt) {
      throw new BadRequestException('Unstake already requested');
    }

    const updated = await this.prisma.stakingPosition.update({
// @ts-ignore
      where: { id: dto.positionId },
      data: {
        status: StakingStatus.UNSTAKING,
        unstakeRequestedAt: new Date(),
      },
    });

    this.logger.log(`Unstake requested: ${dto.positionId}`, 'StakingService');

    return updated;
  }

  async claimRewards(userId: string, dto: ClaimRewardsDto): Promise<{ claimed: string; transactionHash?: string }> {
    const position = await this.getStakingPosition(userId, dto.positionId);

    if (position.status !== StakingStatus.ACTIVE && position.status !== StakingStatus.COMPLETED) {
      throw new BadRequestException('Cannot claim rewards from this position');
    }

    const rewards = this.calculateRewards(position);

    if (rewards <= 0) {
      throw new BadRequestException('No rewards to claim');
    }

    await this.prisma.stakingPosition.update({
      where: { id: dto.positionId },
      data: {
        rewardClaimed: { increment: rewards },
        rewardClaimedAt: new Date(),
      },
    });

    this.logger.log(`Rewards claimed: ${rewards} for position ${dto.positionId}`, 'StakingService');

    return { claimed: rewards.toFixed(18) };
  }

  async getStakingStats(userId: string) {
    const positions = await this.prisma.stakingPosition.findMany({
      where: { userId },
      include: { wallet: true },
    });

    const totalStaked = positions
      .filter((p) => p.status === StakingStatus.ACTIVE)
      .reduce((sum, p) => sum + parseFloat(p.amount), 0);

    const totalRewards = positions.reduce((sum, p) => sum + parseFloat(p.rewardClaimed), 0);

    const activePositions = positions.filter((p) => p.status === StakingStatus.ACTIVE).length;
    const completedPositions = positions.filter((p) => p.status === StakingStatus.COMPLETED).length;

    return {
      totalStaked: totalStaked.toFixed(18),
      totalRewards: totalRewards.toFixed(18),
      activePositions,
      completedPositions,
      totalPositions: positions.length,
      avgApy: positions.length > 0
        ? (positions.reduce((sum, p) => sum + parseFloat(p.apy), 0) / positions.length).toFixed(2)
        : '0',
    };
  }

  private calculateRewards(position: StakingPositionEntity): number {
    const now = new Date();
    const startDate = new Date(position.startDate);
    const stakingDays = (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);

    if (stakingDays <= 0) return 0;

    const principal = parseFloat(position.amount);
    const apy = parseFloat(position.apy) / 100;
    const rewards = principal * apy * (stakingDays / 365);

    return rewards;
  }
}
