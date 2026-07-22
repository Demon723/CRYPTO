export declare enum UserRole {
    USER = "USER",
    ADMIN = "ADMIN",
    SUPER_ADMIN = "SUPER_ADMIN"
}
export declare enum Chain {
    ETHEREUM = "ETHEREUM",
    POLYGON = "POLYGON",
    BSC = "BSC",
    ARBITRUM = "ARBITRUM",
    BASE = "BASE",
    AVALANCHE = "AVALANCHE",
    LXON = "LXON"
}
export declare enum WalletType {
    EOA = "EOA",
    SMART_CONTRACT = "SMART_CONTRACT",
    MULTISIG = "MULTISIG"
}
export declare enum TransactionType {
    TRANSFER = "TRANSFER",
    SWAP = "SWAP",
    STAKE = "STAKE",
    UNSTAKE = "UNSTAKE",
    MINT = "MINT",
    BURN = "BURN",
    APPROVE = "APPROVE",
    CONTRACT_CALL = "CONTRACT_CALL",
    BRIDGE = "BRIDGE",
    NFT_TRANSFER = "NFT_TRANSFER"
}
export declare enum TransactionStatus {
    PENDING = "PENDING",
    CONFIRMED = "CONFIRMED",
    FAILED = "FAILED",
    DROPPED = "DROPPED"
}
export declare enum MessageRole {
    USER = "USER",
    ASSISTANT = "ASSISTANT",
    SYSTEM = "SYSTEM"
}
export declare enum AlertType {
    PRICE = "PRICE",
    WHALE_ACTIVITY = "WHALE_ACTIVITY",
    LARGE_TRANSFER = "LARGE_TRANSFER",
    RISK = "RISK",
    SECURITY = "SECURITY",
    BRIDGE = "BRIDGE",
    GOVERNANCE = "GOVERNANCE",
    STAKING = "STAKING"
}
export declare enum AlertStatus {
    ACTIVE = "ACTIVE",
    PAUSED = "PAUSED",
    TRIGGERED = "TRIGGERED",
    DISABLED = "DISABLED"
}
export declare enum NotificationType {
    ALERT = "ALERT",
    SYSTEM = "SYSTEM",
    SOCIAL = "SOCIAL",
    MARKETING = "MARKETING"
}
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
export declare enum InvoiceStatus {
    DRAFT = "DRAFT",
    OPEN = "OPEN",
    PAID = "PAID",
    VOID = "VOID",
    UNCOLLECTIBLE = "UNCOLLECTIBLE"
}
export declare enum PaymentProvider {
    RAZORPAY = "RAZORPAY",
    STRIPE = "STRIPE",
    CRYPTO = "CRYPTO"
}
export declare enum PaymentStatus {
    PENDING = "PENDING",
    SUCCEEDED = "SUCCEEDED",
    FAILED = "FAILED",
    CANCELED = "CANCELED",
    REFUNDED = "REFUNDED"
}
export declare enum RewardType {
    REFERRAL_FIRST = "REFERRAL_FIRST",
    REFERRAL_SUBSCRIPTION = "REFERRAL_SUBSCRIPTION",
    STAKING_BONUS = "STAKING_BONUS",
    COMMUNITY = "COMMUNITY"
}
export declare enum RewardStatus {
    PENDING = "PENDING",
    CLAIMABLE = "CLAIMABLE",
    CLAIMED = "CLAIMED",
    EXPIRED = "EXPIRED"
}
export declare enum VoteChoice {
    FOR = "FOR",
    AGAINST = "AGAINST",
    ABSTAIN = "ABSTAIN"
}
export declare enum StakingStatus {
    ACTIVE = "ACTIVE",
    UNSTAKING = "UNSTAKING",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED"
}
export declare enum LogLevel {
    ERROR = "ERROR",
    WARN = "WARN",
    INFO = "INFO",
    DEBUG = "DEBUG"
}
