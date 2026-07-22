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
var SubscriptionsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/modules/prisma.service");
const subscription_entity_1 = require("../entities/subscription.entity");
const logger_service_1 = require("../../common/modules/logger.service");
let SubscriptionsService = SubscriptionsService_1 = class SubscriptionsService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new logger_service_1.LoggerService(SubscriptionsService_1.name);
    }
    async getUserSubscription(userId) {
        return this.prisma.subscription.findFirst({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async createSubscription(userId, plan, startDate, endDate) {
        const features = subscription_entity_1.PLAN_FEATURES[plan];
        const existing = await this.getUserSubscription(userId);
        if (existing && existing.status === subscription_entity_1.SubscriptionStatus.ACTIVE) {
            throw new common_1.BadRequestException('User already has an active subscription');
        }
        const now = startDate || new Date();
        const subscriptionEnd = endDate || new Date(now);
        subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1);
        const subscription = await this.prisma.subscription.create({
            data: {
                userId,
                plan,
                status: subscription_entity_1.SubscriptionStatus.ACTIVE,
                startDate: now,
                endDate: subscriptionEnd,
                aiQueryLimit: features.aiQueriesPerDay,
                features,
            },
        });
        this.logger.log(`Subscription created: ${subscription.id} for user ${userId}`, 'SubscriptionsService');
        return subscription;
    }
    async updateSubscription(userId, newPlan) {
        const current = await this.getActiveSubscription(userId);
        const newFeatures = subscription_entity_1.PLAN_FEATURES[newPlan];
        const updated = await this.prisma.subscription.update({
            where: { id: current.id },
            data: {
                plan: newPlan,
                features: newFeatures,
                aiQueryLimit: newFeatures.aiQueriesPerDay,
            },
        });
        this.logger.log(`Subscription updated to ${newPlan} for user ${userId}`, 'SubscriptionsService');
        return updated;
    }
    async cancelSubscription(userId, cancelAtPeriodEnd = true) {
        const current = await this.getActiveSubscription(userId);
        const updated = await this.prisma.subscription.update({
            where: { id: current.id },
            data: {
                cancelAtPeriodEnd,
                ...(cancelAtPeriodEnd ? {} : { status: subscription_entity_1.SubscriptionStatus.CANCELED }),
            },
        });
        this.logger.log(`Subscription canceled for user ${userId}`, 'SubscriptionsService');
        return updated;
    }
    async trackAiQuery(userId) {
        const subscription = await this.getActiveSubscription(userId);
        const features = subscription_entity_1.PLAN_FEATURES[subscription.plan];
        if (subscription.aiQueriesUsed >= subscription.aiQueryLimit) {
            return { allowed: false, remaining: 0 };
        }
        await this.prisma.subscription.update({
            where: { id: subscription.id },
            data: { aiQueriesUsed: { increment: 1 } },
        });
        const remaining = subscription.aiQueryLimit - subscription.aiQueriesUsed - 1;
        return { allowed: true, remaining };
    }
    async canAccessFeature(userId, feature) {
        const subscription = await this.getActiveSubscription(userId);
        const features = subscription_entity_1.PLAN_FEATURES[subscription.plan];
        return !!features[feature];
    }
    async getActiveSubscription(userId) {
        const subscription = await this.prisma.subscription.findFirst({
            where: {
                userId,
                status: subscription_entity_1.SubscriptionStatus.ACTIVE,
                endDate: { gte: new Date() },
            },
        });
        if (!subscription) {
            const freeSubscription = await this.prisma.subscription.findFirst({
                where: { userId, plan: subscription_entity_1.SubscriptionPlan.FREE },
                orderBy: { createdAt: 'desc' },
            });
            if (freeSubscription) {
                return freeSubscription;
            }
            return this.createSubscription(userId, subscription_entity_1.SubscriptionPlan.FREE);
        }
        return subscription;
    }
    async getSubscriptionHistory(userId, page = 1, limit = 20) {
        const offset = (page - 1) * limit;
        const [subscriptions, total] = await Promise.all([
            this.prisma.subscription.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                skip: offset,
                take: limit,
                include: {
                    invoices: true,
                },
            }),
            this.prisma.subscription.count({ where: { userId } }),
        ]);
        return {
            data: subscriptions,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async checkExpiredSubscriptions() {
        const result = await this.prisma.subscription.updateMany({
            where: {
                status: subscription_entity_1.SubscriptionStatus.ACTIVE,
                endDate: { lt: new Date() },
            },
            data: { status: subscription_entity_1.SubscriptionStatus.EXPIRED },
        });
        if (result.count > 0) {
            this.logger.log(`${result.count} subscriptions marked as expired`, 'SubscriptionsService');
        }
        return result.count;
    }
};
exports.SubscriptionsService = SubscriptionsService;
exports.SubscriptionsService = SubscriptionsService = SubscriptionsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SubscriptionsService);
//# sourceMappingURL=subscriptions.service.js.map