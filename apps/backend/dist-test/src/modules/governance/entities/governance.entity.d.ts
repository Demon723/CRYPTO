export { VoteChoice } from '../../../../common/enums';
export interface GovernanceProposal {
    id: string;
    title: string;
    description: string;
    proposer: string;
    startBlock: number;
    endBlock: number;
    forVotes: string;
    againstVotes: string;
    abstainVotes: string;
    status: ProposalStatus;
    createdAt: Date;
}
export interface GovernanceVote {
    id: string;
    userId: string;
    proposalId: string;
    choice: VoteChoice;
    votingPower: string;
    transactionHash?: string;
    createdAt: Date;
}
export declare enum ProposalStatus {
    ACTIVE = "ACTIVE",
    SUCCEEDED = "SUCCEEDED",
    DEFEATED = "DEFEATED",
    PENDING = "PENDING",
    CANCELED = "CANCELED",
    QUEUED = "QUEUED",
    EXECUTED = "EXECUTED",
    EXPIRED = "EXPIRED"
}
export interface CreateProposalDto {
    title: string;
    description: string;
    proposer: string;
    startBlock: number;
    endBlock: number;
}
export interface CastVoteDto {
    proposalId: string;
    choice: VoteChoice;
    votingPower?: string;
}
