import { PrismaService } from '../../common/modules/prisma.service';
import { ReferralCodeEntity, ReferralRewardEntity, ReferralStats } from '../entities/referral.entity';
export declare class ReferralService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getOrCreateReferralCode(userId: string): Promise<ReferralCodeEntity>;
    getUserReferralCodes(userId: string): Promise<ReferralCodeEntity[]>;
    validateReferralCode(code: string): Promise<{
        valid: boolean;
        referrerId?: string;
        message?: string;
    }>;
    applyReferralCode(userId: string, code: string): Promise<ReferralRewardEntity>;
    getUserReferrals(userId: string): Promise<{
        referrerRewards: {
            status: import(".prisma/client").$Enums.RewardStatus;
            id: string;
            createdAt: Date;
            currency: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            referrerId: string;
            refereeId: string | null;
            referralCodeId: string;
            rewardType: import(".prisma/client").$Enums.RewardType;
            claimedAt: Date | null;
        }[];
        refereeRewards: {
            status: import(".prisma/client").$Enums.RewardStatus;
            id: string;
            createdAt: Date;
            currency: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            referrerId: string;
            refereeId: string | null;
            referralCodeId: string;
            rewardType: import(".prisma/client").$Enums.RewardType;
            claimedAt: Date | null;
        }[];
        totalReferrals: number;
    }>;
    claimReward(userId: string, rewardId: string): Promise<ReferralRewardEntity>;
    getReferralStats(userId: string): Promise<ReferralStats>;
}
