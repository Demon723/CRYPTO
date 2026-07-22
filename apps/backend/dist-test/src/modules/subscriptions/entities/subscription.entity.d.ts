export declare enum SubscriptionPlan {
    FREE = "FREE",
    BASIC = "BASIC",
    PRO = "PRO",
    ENTERPRISE = "ENTERPRISE"
}
export declare enum SubscriptionStatus {
    ACTIVE = "ACTIVE",
    CANCELED = "CANCELED",
    EXPIRED = "EXPIRED",
    PAST_DUE = "PAST_DUE"
}
export interface SubscriptionEntity {
    id: string;
    userId: string;
    plan: SubscriptionPlan;
    status: SubscriptionStatus;
    startDate: Date;
    endDate: Date;
    cancelAtPeriodEnd: boolean;
    aiQueryLimit: number;
    aiQueriesUsed: number;
    features: Record<string, boolean>;
    createdAt: Date;
    updatedAt: Date;
}
export interface PlanFeatures {
    aiQueriesPerDay: number;
    maxWallets: number;
    maxAlerts: number;
    advancedAnalytics: boolean;
    apiAccess: boolean;
    prioritySupport: boolean;
    whiteLabel: boolean;
}
export declare const PLAN_FEATURES: Record<SubscriptionPlan, PlanFeatures>;
