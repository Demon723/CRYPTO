import { PrismaService } from '../../common/modules/prisma.service';
import { GovernanceProposal, GovernanceVote, ProposalStatus, CastVoteDto } from '../entities/governance.entity';
import { StakingService } from '../../staking/services/staking.service';
export declare class GovernanceService {
    private readonly prisma;
    private readonly stakingService;
    private readonly logger;
    constructor(prisma: PrismaService, stakingService: StakingService);
    getProposals(status?: ProposalStatus): Promise<GovernanceProposal[]>;
    getProposalById(proposalId: string): Promise<GovernanceProposal>;
    castVote(userId: string, dto: CastVoteDto): Promise<GovernanceVote>;
    getUserVotes(userId: string): Promise<{
        id: string;
        proposalId: string;
        choice: import(".prisma/client").$Enums.VoteChoice;
        votingPower: import("@prisma/client/runtime/library").Decimal;
        transactionHash: string;
        createdAt: Date;
    }[]>;
    getProposalResults(proposalId: string): Promise<{
        for: number;
        against: number;
        abstain: number;
        total: number;
        votes: {
            id: string;
            voter: string;
            choice: import(".prisma/client").$Enums.VoteChoice;
            votingPower: import("@prisma/client/runtime/library").Decimal;
            createdAt: Date;
        }[];
    }>;
    private calculateVotingPower;
}
