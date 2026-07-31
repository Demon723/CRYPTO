// @ts-nocheck
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../common/modules/prisma.service';
import {
  SubscriptionEntity,
  SubscriptionPlan,
  SubscriptionStatus,
  PlanFeatures,
  PLAN_FEATURES,
} from '../entities/subscription.entity';
import { LoggerService } from '../../common/modules/logger.service';

@Injectable()
export class SubscriptionsService {
  private readonly logger = new LoggerService();

  constructor(private readonly prisma: PrismaService) {}

  async getUserSubscription(userId: string): Promise<SubscriptionEntity | null> {
    return this.prisma.subscription.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createSubscription(
    userId: string,
    plan: SubscriptionPlan,
    startDate?: Date,
    endDate?: Date,
  ): Promise<SubscriptionEntity> {
    const features = PLAN_FEATURES[plan];

    const existing = await this.getUserSubscription(userId);
    if (existing && existing.status === SubscriptionStatus.ACTIVE) {
      throw new BadRequestException('User already has an active subscription');
    }

    const now = startDate || new Date();
    const subscriptionEnd = endDate || new Date(now);
    subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1);

    const subscription = await this.prisma.subscription.create({
      data: {
        userId,
        plan,
        status: SubscriptionStatus.ACTIVE,
        startDate: now,
        endDate: subscriptionEnd,
        aiQueryLimit: features.aiQueriesPerDay,
        features: JSON.stringify(features),
      },
    });

    this.logger.log(`Subscription created: ${subscription.id} for user ${userId}`, 'SubscriptionsService');

    return {
      ...subscription,
      features: typeof subscription.features === 'string' ? JSON.parse(subscription.features) : subscription.features,
    };
  }

  async updateSubscription(
    userId: string,
    newPlan: SubscriptionPlan,
  ): Promise<SubscriptionEntity> {
    const current = await this.getActiveSubscription(userId);
    const newFeatures = PLAN_FEATURES[newPlan];

    const updated = await this.prisma.subscription.update({
      where: { id: current.id },
      data: {
        plan: newPlan,
        features: JSON.stringify(newFeatures),
        aiQueryLimit: newFeatures.aiQueriesPerDay,
      },
    });

    this.logger.log(`Subscription updated to ${newPlan} for user ${userId}`, 'SubscriptionsService');

    return {
      ...updated,
      features: typeof updated.features === 'string' ? JSON.parse(updated.features) : updated.features,
    };
  }
// @ts-ignore

  async cancelSubscription(userId: string, cancelAtPeriodEnd = true): Promise<SubscriptionEntity> {
    const current = await this.getActiveSubscription(userId);

    const updated = await this.prisma.subscription.update({
      where: { id: current.id },
      data: {
        cancelAtPeriodEnd,
        ...(cancelAtPeriodEnd ? {} : { status: SubscriptionStatus.CANCELED }),
      },
    });

    this.logger.log(`Subscription canceled for user ${userId}`, 'SubscriptionsService');

    return updated;
  }

  async trackAiQuery(userId: string): Promise<{ allowed: boolean; remaining: number }> {
    const subscription = await this.getActiveSubscription(userId);
    const features = PLAN_FEATURES[subscription.plan];

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

  async canAccessFeature(userId: string, feature: keyof PlanFeatures): Promise<boolean> {
    const subscription = await this.getActiveSubscription(userId);
    const features = PLAN_FEATURES[subscription.plan];
    return !!features[feature];
  }

  async getActiveSubscription(userId: string): Promise<SubscriptionEntity> {
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        userId,
        status: SubscriptionStatus.ACTIVE,
        endDate: { gte: new Date() },
      },
    });

    if (!subscription) {
      const freeSubscription = await this.prisma.subscription.findFirst({
        where: { userId, plan: SubscriptionPlan.FREE },
        orderBy: { createdAt: 'desc' },
      });

      if (freeSubscription) {
        return {
          ...freeSubscription,
          features: typeof freeSubscription.features === 'string' ? JSON.parse(freeSubscription.features) : freeSubscription.features,
        };
      }

      return this.createSubscription(userId, SubscriptionPlan.FREE);
    }

    return {
      ...subscription,
      features: typeof subscription.features === 'string' ? JSON.parse(subscription.features) : subscription.features,
    };
  }

  async getSubscriptionHistory(userId: string, page = 1, limit = 20) {
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

  async checkExpiredSubscriptions(): Promise<number> {
    const result = await this.prisma.subscription.updateMany({
      where: {
        status: SubscriptionStatus.ACTIVE,
        endDate: { lt: new Date() },
      },
      data: { status: SubscriptionStatus.EXPIRED },
    });

    if (result.count > 0) {
      this.logger.log(`${result.count} subscriptions marked as expired`, 'SubscriptionsService');
    }

    return result.count;
  }
}
