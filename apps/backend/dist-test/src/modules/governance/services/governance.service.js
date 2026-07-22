"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var GovernanceService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GovernanceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/modules/prisma.service");
const governance_entity_1 = require("../entities/governance.entity");
const staking_service_1 = require("../../staking/services/staking.service");
const logger_service_1 = require("../../common/modules/logger.service");
let GovernanceService = GovernanceService_1 = class GovernanceService {
    constructor(prisma, stakingService) {
        this.prisma = prisma;
        this.stakingService = stakingService;
        this.logger = new logger_service_1.LoggerService(GovernanceService_1.name);
    }
    async getProposals(status) {
        const where = status ? { status } : {};
        const proposals = await this.prisma.governanceVote.findMany({
            where,
            include: {
                user: { select: { id: true, name: true, email: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        return proposals.map((v) => ({
            id: v.id,
            title: `Proposal ${v.proposalId}`,
            description: `Vote by ${v.user?.name || v.user?.email || 'user'}`,
            proposer: v.user?.email || 'unknown',
            startBlock: 0,
            endBlock: 0,
            forVotes: '0',
            againstVotes: '0',
            abstainVotes: '0',
            status: governance_entity_1.ProposalStatus.ACTIVE,
            createdAt: v.createdAt,
        }));
    }
    async getProposalById(proposalId) {
        const vote = await this.prisma.governanceVote.findFirst({
            where: { proposalId },
            include: { user: true },
        });
        if (!vote) {
            throw new common_1.NotFoundException('Proposal not found');
        }
        return {
            id: vote.id,
            title: `Proposal ${proposalId}`,
            description: `Vote by ${vote.user?.name || vote.user?.email || 'user'}`,
            proposer: vote.user?.email || 'unknown',
            startBlock: 0,
            endBlock: 0,
            forVotes: '0',
            againstVotes: '0',
            abstainVotes: '0',
            status: governance_entity_1.ProposalStatus.ACTIVE,
            createdAt: vote.createdAt,
        };
    }
    async castVote(userId, dto) {
        const existing = await this.prisma.governanceVote.findFirst({
            where: { userId, proposalId: dto.proposalId },
        });
        if (existing) {
            throw new common_1.BadRequestException('You have already voted on this proposal');
        }
        const votingPower = dto.votingPower
            ? parseFloat(dto.votingPower)
            : await this.calculateVotingPower(userId);
        const vote = await this.prisma.governanceVote.create({
            data: {
                userId,
                proposalId: dto.proposalId,
                choice: dto.choice,
                votingPower: votingPower.toFixed(2),
            },
        });
        this.logger.log(`Vote cast: ${vote.id} for proposal ${dto.proposalId}`, 'GovernanceService');
        return {
            id: vote.id,
            userId: vote.userId,
            proposalId: vote.proposalId,
            choice: vote.choice,
            votingPower: vote.votingPower,
            transactionHash: vote.transactionHash || undefined,
            createdAt: vote.createdAt,
        };
    }
    async getUserVotes(userId) {
        const votes = await this.prisma.governanceVote.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
        return votes.map((v) => ({
            id: v.id,
            proposalId: v.proposalId,
            choice: v.choice,
            votingPower: v.votingPower,
            transactionHash: v.transactionHash || undefined,
            createdAt: v.createdAt,
        }));
    }
    async getProposalResults(proposalId) {
        const votes = await this.prisma.governanceVote.findMany({
            where: { proposalId },
            include: { user: { select: { name: true, email: true } } },
        });
        const results = {
            for: 0,
            against: 0,
            abstain: 0,
            total: 0,
            votes: votes.map((v) => ({
                id: v.id,
                voter: v.user?.name || v.user?.email || 'unknown',
                choice: v.choice,
                votingPower: v.votingPower,
                createdAt: v.createdAt,
            })),
        };
        for (const vote of votes) {
            if (vote.choice === governance_entity_1.VoteChoice.FOR)
                results.for += parseFloat(vote.votingPower);
            else if (vote.choice === governance_entity_1.VoteChoice.AGAINST)
                results.against += parseFloat(vote.votingPower);
            else if (vote.choice === governance_entity_1.VoteChoice.ABSTAIN)
                results.abstain += parseFloat(vote.votingPower);
            results.total += parseFloat(vote.votingPower);
        }
        return results;
    }
    async calculateVotingPower(userId) {
        const stakingPositions = await this.prisma.stakingPosition.findMany({
            where: { userId, status: 'ACTIVE' },
        });
        let totalStaked = 0;
        for (const position of stakingPositions) {
            totalStaked += parseFloat(position.amount.toString());
        }
        return totalStaked;
    }
};
exports.GovernanceService = GovernanceService;
exports.GovernanceService = GovernanceService = GovernanceService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        staking_service_1.StakingService])
], GovernanceService);
//# sourceMappingURL=governance.service.js.map