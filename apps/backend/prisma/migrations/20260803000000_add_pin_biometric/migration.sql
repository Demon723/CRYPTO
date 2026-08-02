-- AlterTable
ALTER TABLE "users" ADD COLUMN "pinHash" TEXT;
ALTER TABLE "users" ADD COLUMN "biometricEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN "biometricPublicKey" TEXT;
ALTER TABLE "users" ADD COLUMN "isPinBiometricRequired" BOOLEAN NOT NULL DEFAULT false;
