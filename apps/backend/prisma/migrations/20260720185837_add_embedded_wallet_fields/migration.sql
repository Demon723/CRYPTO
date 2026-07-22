-- AlterTable
ALTER TABLE "wallets" ADD COLUMN "recoveryEncryptedShard" TEXT;
ALTER TABLE "wallets" ADD COLUMN "recoveryMethod" TEXT;
ALTER TABLE "wallets" ADD COLUMN "socialRecoveryContacts" TEXT;
