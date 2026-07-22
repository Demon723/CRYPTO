// @ts-nocheck
// @ts-ignore
export { StakingStatus } from '../../../common/enums';

export interface StakingPositionEntity {
  id: string;
  userId: string;
  walletId: string;
  amount: string;
  apy: string;
  startDate: Date;
  endDate: Date;
  status: StakingStatus;
  rewardClaimed: string;
  rewardClaimedAt?: Date;
  unstakeRequestedAt?: Date;
  transactionHash?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StakeDto {
  walletId: string;
  amount: string;
  lockPeriodDays?: number;
}

export interface UnstakeDto {
  positionId: string;
}

export interface ClaimRewardsDto {
  positionId: string;
}
