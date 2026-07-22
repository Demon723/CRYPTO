export enum SubscriptionPlan {
  FREE = 'FREE',
  BASIC = 'BASIC',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE',
}

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  CANCELED = 'CANCELED',
  EXPIRED = 'EXPIRED',
  PAST_DUE = 'PAST_DUE',
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

export const PLAN_FEATURES: Record<SubscriptionPlan, PlanFeatures> = {
  [SubscriptionPlan.FREE]: {
    aiQueriesPerDay: 10,
    maxWallets: 3,
    maxAlerts: 5,
    advancedAnalytics: false,
    apiAccess: false,
    prioritySupport: false,
    whiteLabel: false,
  },
  [SubscriptionPlan.BASIC]: {
    aiQueriesPerDay: 100,
    maxWallets: 10,
    maxAlerts: 20,
    advancedAnalytics: true,
    apiAccess: false,
    prioritySupport: false,
    whiteLabel: false,
  },
  [SubscriptionPlan.PRO]: {
    aiQueriesPerDay: 500,
    maxWallets: 50,
    maxAlerts: 100,
    advancedAnalytics: true,
    apiAccess: true,
    prioritySupport: true,
    whiteLabel: false,
  },
  [SubscriptionPlan.ENTERPRISE]: {
    aiQueriesPerDay: 9999,
    maxWallets: 999,
    maxAlerts: 999,
    advancedAnalytics: true,
    apiAccess: true,
    prioritySupport: true,
    whiteLabel: true,
  },
};
