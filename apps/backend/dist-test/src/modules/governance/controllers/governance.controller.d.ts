import { GovernanceService } from '../services/governance.service';
import { CastVoteDto } from '../entities/governance.entity';
export declare class GovernanceController {
    private readonly governanceService;
    constructor(governanceService: GovernanceService);
    getProposals(): Promise<import("../entities/governance.entity").GovernanceProposal[]>;
    getProposal(proposalId: string): Promise<import("../entities/governance.entity").GovernanceProposal>;
    castVote(userId: string, dto: CastVoteDto): Promise<import("../entities/governance.entity").GovernanceVote>;
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
}
