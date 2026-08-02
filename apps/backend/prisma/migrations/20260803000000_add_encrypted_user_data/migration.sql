-- AlterTable
ALTER TABLE "users" ADD COLUMN "encryptedData" TEXT;
ALTER TABLE "users" ADD COLUMN "dataAuthTag" TEXT;
ALTER TABLE "users" ADD COLUMN "dataIv" TEXT;
