import { SubscriptionsService } from '../services/subscriptions.service';
import { SubscriptionPlan } from '../entities/subscription.entity';
export declare class SubscriptionsController {
    private readonly subscriptionsService;
    constructor(subscriptionsService: SubscriptionsService);
    getCurrentSubscription(userId: string): Promise<import("../entities/subscription.entity").SubscriptionEntity>;
    upgradeSubscription(userId: string, plan: SubscriptionPlan): Promise<import("../entities/subscription.entity").SubscriptionEntity>;
    cancelSubscription(userId: string, cancelAtPeriodEnd?: boolean): Promise<import("../entities/subscription.entity").SubscriptionEntity>;
    getHistory(userId: string, pagination: {
        page: number;
        limit: number;
    }): Promise<{
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
    checkExpired(): Promise<number>;
}
