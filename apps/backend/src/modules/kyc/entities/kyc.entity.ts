export enum KycStatus {
  NOT_SUBMITTED = 'NOT_SUBMITTED',
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
}

export enum GovernmentIdType {
  PASSPORT = 'PASSPORT',
  DRIVING_LICENSE = 'DRIVING_LICENSE',
  NATIONAL_ID = 'NATIONAL_ID',
}

export enum PaymentMethodType {
  BANK_ACCOUNT = 'BANK_ACCOUNT',
  DEBIT_CARD = 'DEBIT_CARD',
  CREDIT_CARD = 'CREDIT_CARD',
  UPI = 'UPI',
}

export interface KycSubmission {
  legalName: string;
  dateOfBirth: string; // ISO date string
  homeAddress: string;
  governmentIdType: GovernmentIdType;
  governmentIdNumber: string;
  governmentIdFrontUrl: string;
  governmentIdBackUrl?: string;
  selfieUrl: string;
  proofOfAddressUrl?: string;
  paymentMethodType: PaymentMethodType;
  paymentMethodLast4: string;
}

export interface KycVerificationResult {
  status: KycStatus;
  verifiedAt?: Date;
  rejectionReason?: string;
}
