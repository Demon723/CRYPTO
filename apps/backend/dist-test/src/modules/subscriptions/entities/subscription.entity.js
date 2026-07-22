"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PLAN_FEATURES = exports.SubscriptionStatus = exports.SubscriptionPlan = void 0;
var SubscriptionPlan;
(function (SubscriptionPlan) {
    SubscriptionPlan["FREE"] = "FREE";
    SubscriptionPlan["BASIC"] = "BASIC";
    SubscriptionPlan["PRO"] = "PRO";
    SubscriptionPlan["ENTERPRISE"] = "ENTERPRISE";
})(SubscriptionPlan || (exports.SubscriptionPlan = SubscriptionPlan = {}));
var SubscriptionStatus;
(function (SubscriptionStatus) {
    SubscriptionStatus["ACTIVE"] = "ACTIVE";
    SubscriptionStatus["CANCELED"] = "CANCELED";
    SubscriptionStatus["EXPIRED"] = "EXPIRED";
    SubscriptionStatus["PAST_DUE"] = "PAST_DUE";
})(SubscriptionStatus || (exports.SubscriptionStatus = SubscriptionStatus = {}));
exports.PLAN_FEATURES = {
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
//# sourceMappingURL=subscription.entity.js.map