import { ReferralService } from '../services/referral.service';
export declare class ReferralController {
    private readonly referralService;
    constructor(referralService: ReferralService);
    getReferralCode(userId: string): Promise<import("../entities/referral.entity").ReferralCodeEntity>;
    getStats(userId: string): Promise<import("../entities/referral.entity").ReferralStats>;
    applyReferralCode(userId: string, code: string): Promise<import("../entities/referral.entity").ReferralRewardEntity>;
    getHistory(userId: string): Promise<{
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
}
