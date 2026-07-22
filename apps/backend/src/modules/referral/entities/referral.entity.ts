// @ts-nocheck
// @ts-ignore
export { RewardType, RewardStatus } from '../../../common/enums';

export interface ReferralCodeEntity {
  id: string;
  userId: string;
  code: string;
  uses: number;
  maxUses: number;
  expiresAt?: Date;
  isActive: boolean;
  createdAt: Date;
}

export interface ReferralRewardEntity {
  id: string;
  referrerId: string;
  refereeId?: string;
  referralCodeId: string;
  rewardType: RewardType;
  amount: string;
  currency: string;
  status: RewardStatus;
  claimedAt?: Date;
  createdAt: Date;
}

export interface CreateReferralCodeDto {
  maxUses?: number;
  expiresAt?: string;
}

export interface ReferralStats {
  totalReferrals: number;
  totalRewards: string;
  pendingRewards: string;
  claimedRewards: string;
  referralCodes: ReferralCodeEntity[];
}
