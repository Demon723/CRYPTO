import { StakingService } from '../services/staking.service';
import { StakeDto, UnstakeDto, ClaimRewardsDto } from '../entities/staking.entity';
export declare class StakingController {
    private readonly stakingService;
    constructor(stakingService: StakingService);
    getUserPositions(userId: string): Promise<({
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
    getStats(userId: string): Promise<{
        totalStaked: string;
        totalRewards: string;
        activePositions: number;
        completedPositions: number;
        totalPositions: number;
        avgApy: string;
    }>;
    createStake(userId: string, dto: StakeDto): Promise<import("../entities/staking.entity").StakingPositionEntity>;
    requestUnstake(userId: string, dto: UnstakeDto): Promise<import("../entities/staking.entity").StakingPositionEntity>;
    claimRewards(userId: string, dto: ClaimRewardsDto): Promise<{
        claimed: string;
        transactionHash?: string;
    }>;
}
