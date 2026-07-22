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
var StakingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StakingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/modules/prisma.service");
const staking_entity_1 = require("../entities/staking.entity");
const logger_service_1 = require("../../common/modules/logger.service");
let StakingService = StakingService_1 = class StakingService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new logger_service_1.LoggerService(StakingService_1.name);
        this.defaultApy = 12;
        this.defaultLockPeriodDays = 30;
    }
    async getUserStakingPositions(userId) {
        return this.prisma.stakingPosition.findMany({
            where: { userId },
            include: { wallet: { select: { address: true, chain: true, label: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getStakingPosition(userId, positionId) {
        const position = await this.prisma.stakingPosition.findFirst({
            where: { id: positionId, userId },
            include: { wallet: true },
        });
        if (!position) {
            throw new common_1.NotFoundException('Staking position not found');
        }
        return position;
    }
    async createStake(userId, dto) {
        const wallet = await this.prisma.wallet.findFirst({
            where: { id: dto.walletId, userId, isActive: true },
        });
        if (!wallet) {
            throw new common_1.NotFoundException('Wallet not found');
        }
        const amount = parseFloat(dto.amount);
        if (isNaN(amount) || amount <= 0) {
            throw new common_1.BadRequestException('Invalid staking amount');
        }
        const lockPeriodDays = dto.lockPeriodDays || this.defaultLockPeriodDays;
        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + lockPeriodDays);
        const position = await this.prisma.stakingPosition.create({
            data: {
                userId,
                walletId: dto.walletId,
                amount: amount.toFixed(18),
                apy: this.defaultApy.toFixed(4),
                startDate,
                endDate,
                status: staking_entity_1.StakingStatus.ACTIVE,
            },
            include: { wallet: true },
        });
        this.logger.log(`Stake created: ${position.id} for user ${userId}`, 'StakingService');
        return position;
    }
    async requestUnstake(userId, dto) {
        const position = await this.getStakingPosition(userId, dto.positionId);
        if (position.status !== staking_entity_1.StakingStatus.ACTIVE) {
            throw new common_1.BadRequestException('Position is not active');
        }
        if (position.unstakeRequestedAt) {
            throw new common_1.BadRequestException('Unstake already requested');
        }
        const updated = await this.prisma.stakingPosition.update({
            where: { id: dto.positionId },
            data: {
                status: staking_entity_1.StakingStatus.UNSTAKING,
                unstakeRequestedAt: new Date(),
            },
        });
        this.logger.log(`Unstake requested: ${dto.positionId}`, 'StakingService');
        return updated;
    }
    async claimRewards(userId, dto) {
        const position = await this.getStakingPosition(userId, dto.positionId);
        if (position.status !== staking_entity_1.StakingStatus.ACTIVE && position.status !== staking_entity_1.StakingStatus.COMPLETED) {
            throw new common_1.BadRequestException('Cannot claim rewards from this position');
        }
        const rewards = this.calculateRewards(position);
        if (rewards <= 0) {
            throw new common_1.BadRequestException('No rewards to claim');
        }
        await this.prisma.stakingPosition.update({
            where: { id: dto.positionId },
            data: {
                rewardClaimed: { increment: rewards },
                rewardClaimedAt: new Date(),
            },
        });
        this.logger.log(`Rewards claimed: ${rewards} for position ${dto.positionId}`, 'StakingService');
        return { claimed: rewards.toFixed(18) };
    }
    async getStakingStats(userId) {
        const positions = await this.prisma.stakingPosition.findMany({
            where: { userId },
            include: { wallet: true },
        });
        const totalStaked = positions
            .filter((p) => p.status === staking_entity_1.StakingStatus.ACTIVE)
            .reduce((sum, p) => sum + parseFloat(p.amount), 0);
        const totalRewards = positions.reduce((sum, p) => sum + parseFloat(p.rewardClaimed), 0);
        const activePositions = positions.filter((p) => p.status === staking_entity_1.StakingStatus.ACTIVE).length;
        const completedPositions = positions.filter((p) => p.status === staking_entity_1.StakingStatus.COMPLETED).length;
        return {
            totalStaked: totalStaked.toFixed(18),
            totalRewards: totalRewards.toFixed(18),
            activePositions,
            completedPositions,
            totalPositions: positions.length,
            avgApy: positions.length > 0
                ? (positions.reduce((sum, p) => sum + parseFloat(p.apy), 0) / positions.length).toFixed(2)
                : '0',
        };
    }
    calculateRewards(position) {
        const now = new Date();
        const startDate = new Date(position.startDate);
        const stakingDays = (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
        if (stakingDays <= 0)
            return 0;
        const principal = parseFloat(position.amount);
        const apy = parseFloat(position.apy) / 100;
        const rewards = principal * apy * (stakingDays / 365);
        return rewards;
    }
};
exports.StakingService = StakingService;
exports.StakingService = StakingService = StakingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StakingService);
//# sourceMappingURL=staking.service.js.map