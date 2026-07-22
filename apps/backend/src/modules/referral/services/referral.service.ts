// @ts-nocheck
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../common/modules/prisma.service';
import { ReferralCodeEntity, ReferralRewardEntity, CreateReferralCodeDto, ReferralStats } from '../entities/referral.entity';
import { RewardType, RewardStatus } from '../../../common/enums';
import { LoggerService } from '../../common/modules/logger.service';
import { generateSecureRandomString } from '../../common/utils/app.utils';

@Injectable()
export class ReferralService {
  private readonly logger = new LoggerService();

  constructor(private readonly prisma: PrismaService) {}

  async getOrCreateReferralCode(userId: string): Promise<ReferralCodeEntity> {
    const existing = await this.prisma.referralCode.findFirst({
      where: { userId, isActive: true },
    });

    if (existing) {
      return existing;
    }

    let code: string;
    let isUnique = false;

    while (!isUnique) {
      code = generateSecureRandomString(8).toUpperCase();
      const existingCode = await this.prisma.referralCode.findUnique({
        where: { code },
      });
      if (!existingCode) {
        isUnique = true;
      }
    }

    const referralCode = await this.prisma.referralCode.create({
      data: {
        userId,
        code,
        uses: 0,
        maxUses: 100,
        isActive: true,
      },
    });

    this.logger.log(`Referral code created: ${referralCode.code} for user ${userId}`, 'ReferralService');

    return referralCode;
  }

  async getUserReferralCodes(userId: string): Promise<ReferralCodeEntity[]> {
    return this.prisma.referralCode.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async validateReferralCode(code: string): Promise<{ valid: boolean; referrerId?: string; message?: string }> {
    const referralCode = await this.prisma.referralCode.findUnique({
      where: { code },
    });

    if (!referralCode) {
      return { valid: false, message: 'Invalid referral code' };
    }

    if (!referralCode.isActive) {
      return { valid: false, message: 'Referral code is inactive' };
    }

    if (referralCode.expiresAt && referralCode.expiresAt < new Date()) {
      return { valid: false, message: 'Referral code has expired' };
    }

    if (referralCode.uses >= referralCode.maxUses) {
      return { valid: false, message: 'Referral code has reached maximum uses' };
    }

    return { valid: true, referrerId: referralCode.userId };
  }

  async applyReferralCode(userId: string, code: string): Promise<ReferralRewardEntity> {
    const validation = await this.validateReferralCode(code);

    if (!validation.valid || !validation.referrerId) {
      throw new BadRequestException(validation.message || 'Invalid referral code');
    }

    if (validation.referrerId === userId) {
      throw new BadRequestException('Cannot refer yourself');
    }

    const existingReferral = await this.prisma.referralReward.findFirst({
      where: { refereeId: userId, referralCodeId: { code } },
    });

    if (existingReferral) {
      throw new ConflictException('You have already used this referral code');
    }

    const referralCode = await this.prisma.referralCode.findUnique({
      where: { code },
    });

    if (!referralCode) {
      throw new BadRequestException('Referral code not found');
    }

    await this.prisma.referralCode.update({
      where: { id: referralCode.id },
      data: { uses: { increment: 1 } },
    });

// @ts-ignore
    const reward = await this.prisma.referralReward.create({
      data: {
        referrerId: validation.referrerId,
        refereeId: userId,
        referralCodeId: referralCode.id,
        rewardType: RewardType.REFERRAL_FIRST,
        amount: '10.00',
        currency: 'LXON',
        status: RewardStatus.CLAIMABLE,
      },
    });

// @ts-ignore
    const refereeReward = await this.prisma.referralReward.create({
      data: {
        referrerId: validation.referrerId,
        refereeId: userId,
        referralCodeId: referralCode.id,
        rewardType: RewardType.REFERRAL_FIRST,
        amount: '5.00',
        currency: 'LXON',
        status: RewardStatus.CLAIMABLE,
      },
    });

    this.logger.log(`Referral applied: ${code} by user ${userId}`, 'ReferralService');

    return refereeReward;
  }

  async getUserReferrals(userId: string) {
    const [referrerRewards, refereeRewards] = await Promise.all([
      this.prisma.referralReward.findMany({
        where: { referrerId: userId },
        include: { referralCode: true, user: { select: { name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.referralReward.findMany({
        where: { refereeId: userId },
        include: { referralCode: true, user: { select: { name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      referrerRewards,
      refereeRewards,
      totalReferrals: referrerRewards.length,
    };
  }

  async claimReward(userId: string, rewardId: string): Promise<ReferralRewardEntity> {
    const reward = await this.prisma.referralReward.findFirst({
      where: { id: rewardId, referrerId: userId },
    });

    if (!reward) {
      throw new NotFoundException('Reward not found');
    }

    if (reward.status !== RewardStatus.CLAIMABLE) {
      throw new BadRequestException('Reward is not claimable');
    }

    const updated = await this.prisma.referralReward.update({
      where: { id: rewardId },
      data: {
        status: RewardStatus.CLAIMED,
        claimedAt: new Date(),
      },
    });

    this.logger.log(`Reward claimed: ${rewardId} by user ${userId}`, 'ReferralService');

    return updated;
  }

  async getReferralStats(userId: string): Promise<ReferralStats> {
    const [referralCodes, rewards] = await Promise.all([
      this.prisma.referralCode.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.referralReward.findMany({
        where: { referrerId: userId },
      }),
    ]);

    const totalReferrals = rewards.filter((r) => r.referrerId === userId).length;
    const totalRewards = rewards.reduce((sum, r) => sum + parseFloat(r.amount), 0).toFixed(2);
    const pendingRewards = rewards
      .filter((r) => r.status === RewardStatus.CLAIMABLE)
      .reduce((sum, r) => sum + parseFloat(r.amount), 0)
      .toFixed(2);
    const claimedRewards = rewards
      .filter((r) => r.status === RewardStatus.CLAIMED)
      .reduce((sum, r) => sum + parseFloat(r.amount), 0)
      .toFixed(2);

    return {
      totalReferrals,
      totalRewards,
      pendingRewards,
      claimedRewards,
      referralCodes,
    };
  }
}
