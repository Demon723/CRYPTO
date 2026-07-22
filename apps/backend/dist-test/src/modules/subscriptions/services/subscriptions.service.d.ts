import { PrismaService } from '../../common/modules/prisma.service';
import { SubscriptionEntity, SubscriptionPlan, PlanFeatures } from '../entities/subscription.entity';
export declare class SubscriptionsService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getUserSubscription(userId: string): Promise<SubscriptionEntity | null>;
    createSubscription(userId: string, plan: SubscriptionPlan, startDate?: Date, endDate?: Date): Promise<SubscriptionEntity>;
    updateSubscription(userId: string, newPlan: SubscriptionPlan): Promise<SubscriptionEntity>;
    cancelSubscription(userId: string, cancelAtPeriodEnd?: boolean): Promise<SubscriptionEntity>;
    trackAiQuery(userId: string): Promise<{
        allowed: boolean;
        remaining: number;
    }>;
    canAccessFeature(userId: string, feature: keyof PlanFeatures): Promise<boolean>;
    getActiveSubscription(userId: string): Promise<SubscriptionEntity>;
    getSubscriptionHistory(userId: string, page?: number, limit?: number): Promise<{
        data: ({
            invoices: {
                status: import(".prisma/client").$Enums.InvoiceStatus;
                id: string;
                createdAt: Date;
                currency: string;
                userId: string;
                subscriptionId: string;
                amount: import("@prisma/client/runtime/library").Decimal;
                paymentMethod: string | null;
                transactionId: string | null;
                billingPeriodStart: Date;
                billingPeriodEnd: Date;
                paidAt: Date | null;
            }[];
        } & {
            status: import(".prisma/client").$Enums.SubscriptionStatus;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            startDate: Date;
            endDate: Date;
            plan: import(".prisma/client").$Enums.SubscriptionPlan;
            cancelAtPeriodEnd: boolean;
            aiQueryLimit: number;
            aiQueriesUsed: number;
            features: import("@prisma/client/runtime/library").JsonValue;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    checkExpiredSubscriptions(): Promise<number>;
}
