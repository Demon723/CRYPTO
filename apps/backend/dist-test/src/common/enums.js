"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogLevel = exports.StakingStatus = exports.VoteChoice = exports.RewardStatus = exports.RewardType = exports.PaymentStatus = exports.PaymentProvider = exports.InvoiceStatus = exports.SubscriptionStatus = exports.SubscriptionPlan = exports.NotificationType = exports.AlertStatus = exports.AlertType = exports.MessageRole = exports.TransactionStatus = exports.TransactionType = exports.WalletType = exports.Chain = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["USER"] = "USER";
    UserRole["ADMIN"] = "ADMIN";
    UserRole["SUPER_ADMIN"] = "SUPER_ADMIN";
})(UserRole || (exports.UserRole = UserRole = {}));
var Chain;
(function (Chain) {
    Chain["ETHEREUM"] = "ETHEREUM";
    Chain["POLYGON"] = "POLYGON";
    Chain["BSC"] = "BSC";
    Chain["ARBITRUM"] = "ARBITRUM";
    Chain["BASE"] = "BASE";
    Chain["AVALANCHE"] = "AVALANCHE";
    Chain["LXON"] = "LXON";
})(Chain || (exports.Chain = Chain = {}));
var WalletType;
(function (WalletType) {
    WalletType["EOA"] = "EOA";
    WalletType["SMART_CONTRACT"] = "SMART_CONTRACT";
    WalletType["MULTISIG"] = "MULTISIG";
})(WalletType || (exports.WalletType = WalletType = {}));
var TransactionType;
(function (TransactionType) {
    TransactionType["TRANSFER"] = "TRANSFER";
    TransactionType["SWAP"] = "SWAP";
    TransactionType["STAKE"] = "STAKE";
    TransactionType["UNSTAKE"] = "UNSTAKE";
    TransactionType["MINT"] = "MINT";
    TransactionType["BURN"] = "BURN";
    TransactionType["APPROVE"] = "APPROVE";
    TransactionType["CONTRACT_CALL"] = "CONTRACT_CALL";
    TransactionType["BRIDGE"] = "BRIDGE";
    TransactionType["NFT_TRANSFER"] = "NFT_TRANSFER";
})(TransactionType || (exports.TransactionType = TransactionType = {}));
var TransactionStatus;
(function (TransactionStatus) {
    TransactionStatus["PENDING"] = "PENDING";
    TransactionStatus["CONFIRMED"] = "CONFIRMED";
    TransactionStatus["FAILED"] = "FAILED";
    TransactionStatus["DROPPED"] = "DROPPED";
})(TransactionStatus || (exports.TransactionStatus = TransactionStatus = {}));
var MessageRole;
(function (MessageRole) {
    MessageRole["USER"] = "USER";
    MessageRole["ASSISTANT"] = "ASSISTANT";
    MessageRole["SYSTEM"] = "SYSTEM";
})(MessageRole || (exports.MessageRole = MessageRole = {}));
var AlertType;
(function (AlertType) {
    AlertType["PRICE"] = "PRICE";
    AlertType["WHALE_ACTIVITY"] = "WHALE_ACTIVITY";
    AlertType["LARGE_TRANSFER"] = "LARGE_TRANSFER";
    AlertType["RISK"] = "RISK";
    AlertType["SECURITY"] = "SECURITY";
    AlertType["BRIDGE"] = "BRIDGE";
    AlertType["GOVERNANCE"] = "GOVERNANCE";
    AlertType["STAKING"] = "STAKING";
})(AlertType || (exports.AlertType = AlertType = {}));
var AlertStatus;
(function (AlertStatus) {
    AlertStatus["ACTIVE"] = "ACTIVE";
    AlertStatus["PAUSED"] = "PAUSED";
    AlertStatus["TRIGGERED"] = "TRIGGERED";
    AlertStatus["DISABLED"] = "DISABLED";
})(AlertStatus || (exports.AlertStatus = AlertStatus = {}));
var NotificationType;
(function (NotificationType) {
    NotificationType["ALERT"] = "ALERT";
    NotificationType["SYSTEM"] = "SYSTEM";
    NotificationType["SOCIAL"] = "SOCIAL";
    NotificationType["MARKETING"] = "MARKETING";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
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
var InvoiceStatus;
(function (InvoiceStatus) {
    InvoiceStatus["DRAFT"] = "DRAFT";
    InvoiceStatus["OPEN"] = "OPEN";
    InvoiceStatus["PAID"] = "PAID";
    InvoiceStatus["VOID"] = "VOID";
    InvoiceStatus["UNCOLLECTIBLE"] = "UNCOLLECTIBLE";
})(InvoiceStatus || (exports.InvoiceStatus = InvoiceStatus = {}));
var PaymentProvider;
(function (PaymentProvider) {
    PaymentProvider["RAZORPAY"] = "RAZORPAY";
    PaymentProvider["STRIPE"] = "STRIPE";
    PaymentProvider["CRYPTO"] = "CRYPTO";
})(PaymentProvider || (exports.PaymentProvider = PaymentProvider = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "PENDING";
    PaymentStatus["SUCCEEDED"] = "SUCCEEDED";
    PaymentStatus["FAILED"] = "FAILED";
    PaymentStatus["CANCELED"] = "CANCELED";
    PaymentStatus["REFUNDED"] = "REFUNDED";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
var RewardType;
(function (RewardType) {
    RewardType["REFERRAL_FIRST"] = "REFERRAL_FIRST";
    RewardType["REFERRAL_SUBSCRIPTION"] = "REFERRAL_SUBSCRIPTION";
    RewardType["STAKING_BONUS"] = "STAKING_BONUS";
    RewardType["COMMUNITY"] = "COMMUNITY";
})(RewardType || (exports.RewardType = RewardType = {}));
var RewardStatus;
(function (RewardStatus) {
    RewardStatus["PENDING"] = "PENDING";
    RewardStatus["CLAIMABLE"] = "CLAIMABLE";
    RewardStatus["CLAIMED"] = "CLAIMED";
    RewardStatus["EXPIRED"] = "EXPIRED";
})(RewardStatus || (exports.RewardStatus = RewardStatus = {}));
var VoteChoice;
(function (VoteChoice) {
    VoteChoice["FOR"] = "FOR";
    VoteChoice["AGAINST"] = "AGAINST";
    VoteChoice["ABSTAIN"] = "ABSTAIN";
})(VoteChoice || (exports.VoteChoice = VoteChoice = {}));
var StakingStatus;
(function (StakingStatus) {
    StakingStatus["ACTIVE"] = "ACTIVE";
    StakingStatus["UNSTAKING"] = "UNSTAKING";
    StakingStatus["COMPLETED"] = "COMPLETED";
    StakingStatus["CANCELLED"] = "CANCELLED";
})(StakingStatus || (exports.StakingStatus = StakingStatus = {}));
var LogLevel;
(function (LogLevel) {
    LogLevel["ERROR"] = "ERROR";
    LogLevel["WARN"] = "WARN";
    LogLevel["INFO"] = "INFO";
    LogLevel["DEBUG"] = "DEBUG";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
//# sourceMappingURL=enums.js.map