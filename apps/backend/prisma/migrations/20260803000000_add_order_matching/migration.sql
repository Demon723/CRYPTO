-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "walletId" TEXT,
    "chain" TEXT NOT NULL,
    "side" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "amount" REAL NOT NULL,
    "filledAmount" REAL NOT NULL DEFAULT 0,
    "remainingAmount" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "commitHash" TEXT,
    "revealed" BOOLEAN NOT NULL DEFAULT false,
    "mevProtected" BOOLEAN NOT NULL DEFAULT true,
    "batchId" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "orders_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "wallets" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "order_matches" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "buyOrderId" TEXT NOT NULL,
    "sellOrderId" TEXT NOT NULL,
    "chain" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "amount" REAL NOT NULL,
    "fee" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "executedAt" DATETIME,
    "batchId" TEXT NOT NULL,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "order_matches_buyOrderId_fkey" FOREIGN KEY ("buyOrderId") REFERENCES "orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "order_matches_sellOrderId_fkey" FOREIGN KEY ("sellOrderId") REFERENCES "orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "orders_userId_idx" ON "orders"("userId");

-- CreateIndex
CREATE INDEX "orders_walletId_idx" ON "orders"("walletId");

-- CreateIndex
CREATE INDEX "orders_chain_idx" ON "orders"("chain");

-- CreateIndex
CREATE INDEX "orders_status_idx" ON "orders"("status");

-- CreateIndex
CREATE INDEX "orders_side_idx" ON "orders"("side");

-- CreateIndex
CREATE INDEX "orders_createdAt_idx" ON "orders"("createdAt");

-- CreateIndex
CREATE INDEX "orders_batchId_idx" ON "orders"("batchId");

-- CreateIndex
CREATE INDEX "order_matches_buyOrderId_idx" ON "order_matches"("buyOrderId");

-- CreateIndex
CREATE INDEX "order_matches_sellOrderId_idx" ON "order_matches"("sellOrderId");

-- CreateIndex
CREATE INDEX "order_matches_chain_idx" ON "order_matches"("chain");

-- CreateIndex
CREATE INDEX "order_matches_batchId_idx" ON "order_matches"("batchId");

-- CreateIndex
CREATE INDEX "order_matches_createdAt_idx" ON "order_matches"("createdAt");
