-- AlterTable
ALTER TABLE "users" ADD COLUMN "kycStatus" TEXT NOT NULL DEFAULT 'NOT_SUBMITTED';
ALTER TABLE "users" ADD COLUMN "kycLegalName" TEXT;
ALTER TABLE "users" ADD COLUMN "kycDateOfBirth" TIMESTAMP;
ALTER TABLE "users" ADD COLUMN "kycHomeAddress" TEXT;
ALTER TABLE "users" ADD COLUMN "kycGovernmentIdType" TEXT;
ALTER TABLE "users" ADD COLUMN "kycGovernmentIdNumber" TEXT;
ALTER TABLE "users" ADD COLUMN "kycGovernmentIdFrontUrl" TEXT;
ALTER TABLE "users" ADD COLUMN "kycGovernmentIdBackUrl" TEXT;
ALTER TABLE "users" ADD COLUMN "kycSelfieUrl" TEXT;
ALTER TABLE "users" ADD COLUMN "kycProofOfAddressUrl" TEXT;
ALTER TABLE "users" ADD COLUMN "kycPaymentMethodType" TEXT;
ALTER TABLE "users" ADD COLUMN "kycPaymentMethodLast4" TEXT;
ALTER TABLE "users" ADD COLUMN "kycVerifiedAt" TIMESTAMP;
ALTER TABLE "users" ADD COLUMN "kycRejectionReason" TEXT;
ALTER TABLE "users" ADD COLUMN "kycSubmissionCount" INTEGER NOT NULL DEFAULT 0;
