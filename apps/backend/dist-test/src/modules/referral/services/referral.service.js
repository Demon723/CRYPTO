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
var ReferralService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReferralService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/modules/prisma.service");
const enums_1 = require("../../../common/enums");
const logger_service_1 = require("../../common/modules/logger.service");
const app_utils_1 = require("../../common/utils/app.utils");
let ReferralService = ReferralService_1 = class ReferralService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new logger_service_1.LoggerService(ReferralService_1.name);
    }
    async getOrCreateReferralCode(userId) {
        const existing = await this.prisma.referralCode.findFirst({
            where: { userId, isActive: true },
        });
        if (existing) {
            return existing;
        }
        let code;
        let isUnique = false;
        while (!isUnique) {
            code = (0, app_utils_1.generateSecureRandomString)(8).toUpperCase();
            const existingCode = await this.prisma.referralCode.findUnique({
                where: { code },
            });
            if (!existingCode) {
                isUnique = true;
            }
        }
        const referralCode = await this.prisma.referralCode.create({
            data: {
                userId,
                code,
                uses: 0,
                maxUses: 100,
                isActive: true,
            },
        });
        this.logger.log(`Referral code created: ${referralCode.code} for user ${userId}`, 'ReferralService');
        return referralCode;
    }
    async getUserReferralCodes(userId) {
        return this.prisma.referralCode.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async validateReferralCode(code) {
        const referralCode = await this.prisma.referralCode.findUnique({
            where: { code },
        });
        if (!referralCode) {
            return { valid: false, message: 'Invalid referral code' };
        }
        if (!referralCode.isActive) {
            return { valid: false, message: 'Referral code is inactive' };
        }
        if (referralCode.expiresAt && referralCode.expiresAt < new Date()) {
            return { valid: false, message: 'Referral code has expired' };
        }
        if (referralCode.uses >= referralCode.maxUses) {
            return { valid: false, message: 'Referral code has reached maximum uses' };
        }
        return { valid: true, referrerId: referralCode.userId };
    }
    async applyReferralCode(userId, code) {
        const validation = await this.validateReferralCode(code);
        if (!validation.valid || !validation.referrerId) {
            throw new common_1.BadRequestException(validation.message || 'Invalid referral code');
        }
        if (validation.referrerId === userId) {
            throw new common_1.BadRequestException('Cannot refer yourself');
        }
        const existingReferral = await this.prisma.referralReward.findFirst({
            where: { refereeId: userId, referralCodeId: { code } },
        });
        if (existingReferral) {
            throw new common_1.ConflictException('You have already used this referral code');
        }
        const referralCode = await this.prisma.referralCode.findUnique({
            where: { code },
        });
        if (!referralCode) {
            throw new common_1.BadRequestException('Referral code not found');
        }
        await this.prisma.referralCode.update({
            where: { id: referralCode.id },
            data: { uses: { increment: 1 } },
        });
        const reward = await this.prisma.referralReward.create({
            data: {
                referrerId: validation.referrerId,
                refereeId: userId,
                referralCodeId: referralCode.id,
                rewardType: enums_1.RewardType.REFERRAL_FIRST,
                amount: '10.00',
                currency: 'LXON',
                status: enums_1.RewardStatus.CLAIMABLE,
            },
        });
        const refereeReward = await this.prisma.referralReward.create({
            data: {
                referrerId: validation.referrerId,
                refereeId: userId,
                referralCodeId: referralCode.id,
                rewardType: enums_1.RewardType.REFERRAL_FIRST,
                amount: '5.00',
                currency: 'LXON',
                status: enums_1.RewardStatus.CLAIMABLE,
            },
        });
        this.logger.log(`Referral applied: ${code} by user ${userId}`, 'ReferralService');
        return refereeReward;
    }
    async getUserReferrals(userId) {
        const [referrerRewards, refereeRewards] = await Promise.all([
            this.prisma.referralReward.findMany({
                where: { referrerId: userId },
                include: { referralCode: true, user: { select: { name: true, email: true } } },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.referralReward.findMany({
                where: { refereeId: userId },
                include: { referralCode: true, user: { select: { name: true, email: true } } },
                orderBy: { createdAt: 'desc' },
            }),
        ]);
        return {
            referrerRewards,
            refereeRewards,
            totalReferrals: referrerRewards.length,
        };
    }
    async claimReward(userId, rewardId) {
        const reward = await this.prisma.referralReward.findFirst({
            where: { id: rewardId, referrerId: userId },
        });
        if (!reward) {
            throw new common_1.NotFoundException('Reward not found');
        }
        if (reward.status !== enums_1.RewardStatus.CLAIMABLE) {
            throw new common_1.BadRequestException('Reward is not claimable');
        }
        const updated = await this.prisma.referralReward.update({
            where: { id: rewardId },
            data: {
                status: enums_1.RewardStatus.CLAIMED,
                claimedAt: new Date(),
            },
        });
        this.logger.log(`Reward claimed: ${rewardId} by user ${userId}`, 'ReferralService');
        return updated;
    }
    async getReferralStats(userId) {
        const [referralCodes, rewards] = await Promise.all([
            this.prisma.referralCode.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.referralReward.findMany({
                where: { referrerId: userId },
            }),
        ]);
        const totalReferrals = rewards.filter((r) => r.referrerId === userId).length;
        const totalRewards = rewards.reduce((sum, r) => sum + parseFloat(r.amount), 0).toFixed(2);
        const pendingRewards = rewards
            .filter((r) => r.status === enums_1.RewardStatus.CLAIMABLE)
            .reduce((sum, r) => sum + parseFloat(r.amount), 0)
            .toFixed(2);
        const claimedRewards = rewards
            .filter((r) => r.status === enums_1.RewardStatus.CLAIMED)
            .reduce((sum, r) => sum + parseFloat(r.amount), 0)
            .toFixed(2);
        return {
            totalReferrals,
            totalRewards,
            pendingRewards,
            claimedRewards,
            referralCodes,
        };
    }
};
exports.ReferralService = ReferralService;
exports.ReferralService = ReferralService = ReferralService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReferralService);
//# sourceMappingURL=referral.service.js.map