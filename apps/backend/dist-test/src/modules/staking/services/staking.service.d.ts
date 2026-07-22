import { PrismaService } from '../../common/modules/prisma.service';
import { StakingPositionEntity, StakeDto, UnstakeDto, ClaimRewardsDto } from '../entities/staking.entity';
export declare class StakingService {
    private readonly prisma;
    private readonly logger;
    private readonly defaultApy;
    private readonly defaultLockPeriodDays;
    constructor(prisma: PrismaService);
    getUserStakingPositions(userId: string): Promise<({
        wallet: {
            address: string;
            chain: import(".prisma/client").$Enums.Chain;
            label: string;
        };
    } & {
        status: import(".prisma/client").$Enums.StakingStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        walletId: string;
        userId: string;
        startDate: Date;
        endDate: Date;
        amount: import("@prisma/client/runtime/library").Decimal;
        apy: import("@prisma/client/runtime/library").Decimal;
        rewardClaimed: import("@prisma/client/runtime/library").Decimal;
        rewardClaimedAt: Date | null;
        unstakeRequestedAt: Date | null;
        transactionHash: string | null;
    })[]>;
    getStakingPosition(userId: string, positionId: string): Promise<StakingPositionEntity>;
    createStake(userId: string, dto: StakeDto): Promise<StakingPositionEntity>;
    requestUnstake(userId: string, dto: UnstakeDto): Promise<StakingPositionEntity>;
    claimRewards(userId: string, dto: ClaimRewardsDto): Promise<{
        claimed: string;
        transactionHash?: string;
    }>;
    getStakingStats(userId: string): Promise<{
        totalStaked: string;
        totalRewards: string;
        activePositions: number;
        completedPositions: number;
        totalPositions: number;
        avgApy: string;
    }>;
    private calculateRewards;
}
