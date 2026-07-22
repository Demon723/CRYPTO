-- CreateEnum:UserRole
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN', 'SUPER_ADMIN');

-- CreateEnum:Chain
CREATE TYPE "Chain" AS ENUM ('ETHEREUM', 'POLYGON', 'BSC', 'ARBITRUM', 'BASE', 'AVALANCHE');

-- CreateEnum:WalletType
CREATE TYPE "WalletType" AS ENUM ('EOA', 'SMART_CONTRACT', 'MULTISIG');

-- CreateEnum:TransactionType
CREATE TYPE "TransactionType" AS ENUM ('TRANSFER', 'SWAP', 'STAKE', 'UNSTAKE', 'MINT', 'BURN', 'APPROVE', 'CONTRACT_CALL', 'BRIDGE', 'NFT_TRANSFER');

-- CreateEnum:TransactionStatus
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'CONFIRMED', 'FAILED', 'DROPPED');

-- CreateEnum:MessageRole
CREATE TYPE "MessageRole" AS ENUM ('USER', 'ASSISTANT', 'SYSTEM');

-- CreateEnum:AlertType
CREATE TYPE "AlertType" AS ENUM ('PRICE', 'WHALE_ACTIVITY', 'LARGE_TRANSFER', 'RISK', 'SECURITY', 'BRIDGE', 'GOVERNANCE', 'STAKING');

-- CreateEnum:AlertStatus
CREATE TYPE "AlertStatus" AS ENUM ('ACTIVE', 'PAUSED', 'TRIGGERED', 'DISABLED');

-- CreateEnum:NotificationType
CREATE TYPE "NotificationType" AS ENUM ('ALERT', 'SYSTEM', 'SOCIAL', 'MARKETING');

-- CreateEnum:SubscriptionPlan
CREATE TYPE "SubscriptionPlan" AS ENUM ('FREE', 'BASIC', 'PRO', 'ENTERPRISE');

-- CreateEnum:SubscriptionStatus
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'CANCELED', 'EXPIRED', 'PAST_DUE');

-- CreateEnum:InvoiceStatus
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'OPEN', 'PAID', 'VOID', 'UNCOLLECTIBLE');

-- CreateEnum:PaymentProvider
CREATE TYPE "PaymentProvider" AS ENUM ('RAZORPAY', 'STRIPE', 'CRYPTO');

-- CreateEnum:PaymentStatus
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED', 'CANCELED', 'REFUNDED');

-- CreateEnum:RewardType
CREATE TYPE "RewardType" AS ENUM ('REFERRAL_FIRST', 'REFERRAL_SUBSCRIPTION', 'STAKING_BONUS', 'COMMUNITY');

-- CreateEnum:RewardStatus
CREATE TYPE "RewardStatus" AS ENUM ('PENDING', 'CLAIMABLE', 'CLAIMED', 'EXPIRED');

-- CreateEnum:VoteChoice
CREATE TYPE "VoteChoice" AS ENUM ('FOR', 'AGAINST', 'ABSTAIN');

-- CreateEnum:StakingStatus
CREATE TYPE "StakingStatus" AS ENUM ('ACTIVE', 'UNSTAKING', 'COMPLETED', 'CANCELLED');

-- CreateEnum:LogLevel
CREATE TYPE "LogLevel" AS ENUM ('ERROR', 'WARN', 'INFO', 'DEBUG');

-- CreateTable:users
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerifiedAt" TIMESTAMP,
    "name" TEXT,
    "image" TEXT,
    "password" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isTwoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "twoFactorSecret" TEXT,
    "lastLoginAt" TIMESTAMP,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex:users.email
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex:users.createdAt
CREATE INDEX "users_createdAt_idx" ON "users"("createdAt");

-- CreateIndex:users.role
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateTable:wallets
CREATE TABLE "wallets" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "chain" "Chain" NOT NULL,
    "label" TEXT,
    "type" "WalletType" NOT NULL DEFAULT 'EOA',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isWatchOnly" BOOLEAN NOT NULL DEFAULT false,
    "ensName" TEXT,
    "lastSyncAt" TIMESTAMP,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wallets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex:wallets.userId_address_chain
CREATE UNIQUE INDEX "wallets_userId_address_chain_key" ON "wallets"("userId", "address", "chain");

-- CreateIndex:wallets.userId
CREATE INDEX "wallets_userId_idx" ON "wallets"("userId");

-- CreateIndex:wallets.address
CREATE INDEX "wallets_address_idx" ON "wallets"("address");

-- CreateIndex:wallets.chain
CREATE INDEX "wallets_chain_idx" ON "wallets"("chain");

-- CreateTable:token_balances
CREATE TABLE "token_balances" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "tokenAddress" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "decimals" INTEGER NOT NULL,
    "balance" TEXT NOT NULL,
    "balanceUsd" DECIMAL(20,2),
    "priceUsd" DECIMAL(20,8),
    "change24h" DECIMAL(10,4),
    "lastUpdated" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "token_balances_pkey" PRIMARY KEY ("id")
);

-- CreateIndex:token_balances.walletId_tokenAddress
CREATE UNIQUE INDEX "token_balances_walletId_tokenAddress_key" ON "token_balances"("walletId", "tokenAddress");

-- CreateIndex:token_balances.walletId
CREATE INDEX "token_balances_walletId_idx" ON "token_balances"("walletId");

-- CreateTable:nfts
CREATE TABLE "nfts" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "contractAddress" TEXT NOT NULL,
    "tokenId" TEXT NOT NULL,
    "name" TEXT,
    "description" TEXT,
    "imageUrl" TEXT,
    "collectionName" TEXT,
    "floorPriceUsd" DECIMAL(20,2),
    "lastSalePriceUsd" DECIMAL(20,2),
    "rarityRank" INTEGER,
    "traits" JSONB,
    "lastUpdated" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nfts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex:nfts.walletId_contractAddress_tokenId
CREATE UNIQUE INDEX "nfts_walletId_contractAddress_tokenId_key" ON "nfts"("walletId", "contractAddress", "tokenId");

-- CreateIndex:nfts.walletId
CREATE INDEX "nfts_walletId_idx" ON "nfts"("walletId");

-- CreateTable:transactions
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "walletId" TEXT,
    "hash" TEXT NOT NULL,
    "chain" "Chain" NOT NULL,
    "type" "TransactionType" NOT NULL,
    "fromAddress" TEXT NOT NULL,
    "toAddress" TEXT,
    "value" TEXT NOT NULL,
    "valueUsd" DECIMAL(20,2),
    "gasUsed" TEXT,
    "gasPrice" TEXT,
    "feeUsd" DECIMAL(20,6),
    "blockNumber" INTEGER,
    "status" "TransactionStatus" NOT NULL,
    "timestamp" TIMESTAMP NOT NULL,
    "decodedFunction" TEXT,
    "contractAddress" TEXT,
    "tokenSymbol" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex:transactions.userId
CREATE INDEX "transactions_userId_idx" ON "transactions"("userId");

-- CreateIndex:transactions.hash
CREATE INDEX "transactions_hash_idx" ON "transactions"("hash");

-- CreateIndex:transactions.chain
CREATE INDEX "transactions_chain_idx" ON "transactions"("chain");

-- CreateIndex:transactions.status
CREATE INDEX "transactions_status_idx" ON "transactions"("status");

-- CreateIndex:transactions.timestamp
CREATE INDEX "transactions_timestamp_idx" ON "transactions"("timestamp");

-- CreateTable:chats
CREATE TABLE "chats" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "context" JSONB,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex:chats.userId
CREATE INDEX "chats_userId_idx" ON "chats"("userId");

-- CreateTable:messages
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "MessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "tokensUsed" INTEGER,
    "model" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex:messages.chatId
CREATE INDEX "messages_chatId_idx" ON "messages"("chatId");

-- CreateIndex:messages.userId
CREATE INDEX "messages_userId_idx" ON "messages"("userId");

-- CreateTable:alerts
CREATE TABLE "alerts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "walletId" TEXT,
    "type" "AlertType" NOT NULL,
    "condition" JSONB NOT NULL,
    "status" "AlertStatus" NOT NULL DEFAULT 'ACTIVE',
    "lastTriggeredAt" TIMESTAMP,
    "triggerCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex:alerts.userId
CREATE INDEX "alerts_userId_idx" ON "alerts"("userId");

-- CreateIndex:alerts.walletId
CREATE INDEX "alerts_walletId_idx" ON "alerts"("walletId");

-- CreateIndex:alerts.type
CREATE INDEX "alerts_type_idx" ON "alerts"("type");

-- CreateIndex:alerts.status
CREATE INDEX "alerts_status_idx" ON "alerts"("status");

-- CreateTable:notifications
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "alertId" TEXT UNIQUE,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "data" JSONB,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex:notifications.userId
CREATE INDEX "notifications_userId_idx" ON "notifications"("userId");

-- CreateIndex:notifications.isRead
CREATE INDEX "notifications_isRead_idx" ON "notifications"("isRead");

-- CreateIndex:notifications.createdAt
CREATE INDEX "notifications_createdAt_idx" ON "notifications"("createdAt");

-- CreateTable:subscriptions
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "plan" "SubscriptionPlan" NOT NULL,
    "status" "SubscriptionStatus" NOT NULL,
    "startDate" TIMESTAMP NOT NULL,
    "endDate" TIMESTAMP NOT NULL,
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "aiQueryLimit" INTEGER NOT NULL,
    "aiQueriesUsed" INTEGER NOT NULL DEFAULT 0,
    "features" JSONB NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex:subscriptions.userId
CREATE INDEX "subscriptions_userId_idx" ON "subscriptions"("userId");

-- CreateIndex:subscriptions.status
CREATE INDEX "subscriptions_status_idx" ON "subscriptions"("status");

-- CreateIndex:subscriptions.endDate
CREATE INDEX "subscriptions_endDate_idx" ON "subscriptions"("endDate");

-- CreateTable:invoices
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "InvoiceStatus" NOT NULL,
    "paymentMethod" TEXT,
    "transactionId" TEXT,
    "billingPeriodStart" TIMESTAMP NOT NULL,
    "billingPeriodEnd" TIMESTAMP NOT NULL,
    "paidAt" TIMESTAMP,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex:invoices.subscriptionId
CREATE INDEX "invoices_subscriptionId_idx" ON "invoices"("subscriptionId");

-- CreateIndex:invoices.userId
CREATE INDEX "invoices_userId_idx" ON "invoices"("userId");

-- CreateIndex:invoices.status
CREATE INDEX "invoices_status_idx" ON "invoices"("status");

-- CreateTable:payments
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "invoiceId" TEXT,
    "provider" "PaymentProvider" NOT NULL,
    "providerPaymentId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "PaymentStatus" NOT NULL,
    "metadata" JSONB,
    "paidAt" TIMESTAMP,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex:payments.provider_providerPaymentId
CREATE UNIQUE INDEX "payments_provider_providerPaymentId_key" ON "payments"("provider", "providerPaymentId");

-- CreateIndex:payments.userId
CREATE INDEX "payments_userId_idx" ON "payments"("userId");

-- CreateIndex:payments.status
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateTable:referral_codes
CREATE TABLE "referral_codes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "uses" INTEGER NOT NULL DEFAULT 0,
    "maxUses" INTEGER NOT NULL DEFAULT 100,
    "expiresAt" TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "referral_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex:referral_codes.code
CREATE UNIQUE INDEX "referral_codes_code_key" ON "referral_codes"("code");

-- CreateIndex:referral_codes.userId
CREATE INDEX "referral_codes_userId_idx" ON "referral_codes"("userId");

-- CreateTable:referral_rewards
CREATE TABLE "referral_rewards" (
    "id" TEXT NOT NULL,
    "referrerId" TEXT NOT NULL,
    "refereeId" TEXT,
    "referralCodeId" TEXT NOT NULL,
    "rewardType" "RewardType" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'CMAI',
    "status" "RewardStatus" NOT NULL DEFAULT 'PENDING',
    "claimedAt" TIMESTAMP,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "referral_rewards_pkey" PRIMARY KEY ("id")
);

-- CreateIndex:referral_rewards.referrerId
CREATE INDEX "referral_rewards_referrerId_idx" ON "referral_rewards"("referrerId");

-- CreateIndex:referral_rewards.referralCodeId
CREATE INDEX "referral_rewards_referralCodeId_idx" ON "referral_rewards"("referralCodeId");

-- CreateIndex:referral_rewards.status
CREATE INDEX "referral_rewards_status_idx" ON "referral_rewards"("status");

-- CreateTable:api_keys
CREATE TABLE "api_keys" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "keyPrefix" TEXT NOT NULL,
    "permissions" JSONB NOT NULL,
    "lastUsedAt" TIMESTAMP,
    "expiresAt" TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateIndex:api_keys.userId
CREATE INDEX "api_keys_userId_idx" ON "api_keys"("userId");

-- CreateIndex:api_keys.keyHash
CREATE UNIQUE INDEX "api_keys_keyHash_key" ON "api_keys"("keyHash");

-- CreateIndex:api_keys.isActive
CREATE INDEX "api_keys_isActive_idx" ON "api_keys"("isActive");

-- CreateTable:watchlists
CREATE TABLE "watchlists" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "symbols" JSONB NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "watchlists_pkey" PRIMARY KEY ("id")
);

-- CreateIndex:watchlists.userId_name
CREATE UNIQUE INDEX "watchlists_userId_name_key" ON "watchlists"("userId", "name");

-- CreateIndex:watchlists.userId
CREATE INDEX "watchlists_userId_idx" ON "watchlists"("userId");

-- CreateTable:settings
CREATE TABLE "settings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL UNIQUE,
    "theme" TEXT NOT NULL DEFAULT 'dark',
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "notificationEmail" BOOLEAN NOT NULL DEFAULT true,
    "notificationPush" BOOLEAN NOT NULL DEFAULT true,
    "notificationInApp" BOOLEAN NOT NULL DEFAULT true,
    "alertEmail" BOOLEAN NOT NULL DEFAULT true,
    "alertPush" BOOLEAN NOT NULL DEFAULT true,
    "alertInApp" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable:governance_votes
CREATE TABLE "governance_votes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "choice" "VoteChoice" NOT NULL,
    "votingPower" DECIMAL(20,2) NOT NULL,
    "transactionHash" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "governance_votes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex:governance_votes.userId_proposalId
CREATE UNIQUE INDEX "governance_votes_userId_proposalId_key" ON "governance_votes"("userId", "proposalId");

-- CreateIndex:governance_votes.proposalId
CREATE INDEX "governance_votes_proposalId_idx" ON "governance_votes"("proposalId");

-- CreateTable:staking_positions
CREATE TABLE "staking_positions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "amount" DECIMAL(20,2) NOT NULL,
    "apy" DECIMAL(10,4) NOT NULL,
    "startDate" TIMESTAMP NOT NULL,
    "endDate" TIMESTAMP NOT NULL,
    "status" "StakingStatus" NOT NULL,
    "rewardClaimed" DECIMAL(20,2) NOT NULL DEFAULT 0,
    "rewardClaimedAt" TIMESTAMP,
    "unstakeRequestedAt" TIMESTAMP,
    "transactionHash" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "staking_positions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex:staking_positions.userId
CREATE INDEX "staking_positions_userId_idx" ON "staking_positions"("userId");

-- CreateIndex:staking_positions.walletId
CREATE INDEX "staking_positions_walletId_idx" ON "staking_positions"("walletId");

-- CreateIndex:staking_positions.status
CREATE INDEX "staking_positions_status_idx" ON "staking_positions"("status");

-- CreateIndex:staking_positions.endDate
CREATE INDEX "staking_positions_endDate_idx" ON "staking_positions"("endDate");

-- CreateTable:tokens
CREATE TABLE "tokens" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL UNIQUE,
    "chain" "Chain" NOT NULL,
    "symbol" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "decimals" INTEGER NOT NULL,
    "logoUrl" TEXT,
    "description" TEXT,
    "website" TEXT,
    "twitter" TEXT,
    "telegram" TEXT,
    "discord" TEXT,
    "github" TEXT,
    "totalSupply" TEXT,
    "marketCapUsd" DECIMAL(20,2),
    "volumeUsd24h" DECIMAL(20,2),
    "priceUsd" DECIMAL(20,8),
    "change24h" DECIMAL(10,4),
    "liquidityUsd" DECIMAL(20,2),
    "riskScore" INTEGER DEFAULT 0,
    "riskFactors" JSONB,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isScam" BOOLEAN NOT NULL DEFAULT false,
    "lastUpdated" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex:tokens.symbol
CREATE INDEX "tokens_symbol_idx" ON "tokens"("symbol");

-- CreateIndex:tokens.chain
CREATE INDEX "tokens_chain_idx" ON "tokens"("chain");

-- CreateIndex:tokens.marketCapUsd
CREATE INDEX "tokens_marketCapUsd_idx" ON "tokens"("marketCapUsd");

-- CreateIndex:tokens.riskScore
CREATE INDEX "tokens_riskScore_idx" ON "tokens"("riskScore");

-- CreateIndex:tokens.isScam
CREATE INDEX "tokens_isScam_idx" ON "tokens"("isScam");

-- CreateTable:audit_logs
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "resourceId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex:audit_logs.userId
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex:audit_logs.action
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex:audit_logs.resource
CREATE INDEX "audit_logs_resource_idx" ON "audit_logs"("resource");

-- CreateIndex:audit_logs.createdAt
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateTable:system_logs
CREATE TABLE "system_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "level" "LogLevel" NOT NULL,
    "message" TEXT NOT NULL,
    "context" JSONB,
    "error" TEXT,
    "stack" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex:system_logs.level
CREATE INDEX "system_logs_level_idx" ON "system_logs"("level");

-- CreateIndex:system_logs.userId
CREATE INDEX "system_logs_userId_idx" ON "system_logs"("userId");

-- CreateIndex:system_logs.createdAt
CREATE INDEX "system_logs_createdAt_idx" ON "system_logs"("createdAt");

-- AddForeignKey:wallets
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey:token_balances
ALTER TABLE "token_balances" ADD CONSTRAINT "token_balances_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "wallets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey:nfts
ALTER TABLE "nfts" ADD CONSTRAINT "nfts_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "wallets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey:transactions
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "wallets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey:messages
ALTER TABLE "messages" ADD CONSTRAINT "messages_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "chats"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "messages" ADD CONSTRAINT "messages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey:alerts
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "wallets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey:notifications
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "alerts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey:subscriptions
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey:invoices
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey:payments
ALTER TABLE "payments" ADD CONSTRAINT "payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey:referral_codes
ALTER TABLE "referral_codes" ADD CONSTRAINT "referral_codes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey:referral_rewards
ALTER TABLE "referral_rewards" ADD CONSTRAINT "referral_rewards_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "referral_rewards" ADD CONSTRAINT "referral_rewards_referralCodeId_fkey" FOREIGN KEY ("referralCodeId") REFERENCES "referral_codes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey:api_keys
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey:watchlists
ALTER TABLE "watchlists" ADD CONSTRAINT "watchlists_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey:settings
ALTER TABLE "settings" ADD CONSTRAINT "settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey:governance_votes
ALTER TABLE "governance_votes" ADD CONSTRAINT "governance_votes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey:staking_positions
ALTER TABLE "staking_positions" ADD CONSTRAINT "staking_positions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "staking_positions" ADD CONSTRAINT "staking_positions_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "wallets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey:audit_logs
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey:system_logs
ALTER TABLE "system_logs" ADD CONSTRAINT "system_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
