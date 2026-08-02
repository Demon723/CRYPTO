import { UserRole } from '../../../common/enums';

export type UserRoleType = UserRole;

export interface SensitiveUserData {
  email: string;
  name?: string;
  image?: string;
  password?: string;
  twoFactorSecret?: string;
  wallets?: Array<{
    address: string;
    chain: string;
    balance?: string;
  }>;
  portfolio?: Record<string, any>;
  transactions?: Array<Record<string, any>>;
  preferences?: Record<string, any>;
}

export interface UserEntity {
  id: string;
  email: string;
  emailVerified: boolean;
  emailVerifiedAt?: Date;
  name?: string;
  image?: string;
  password?: string;
  role: UserRoleType;
  isActive: boolean;
  isTwoFactorEnabled: boolean;
  twoFactorSecret?: string;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Encrypted storage
  encryptedData?: string;
  dataIv?: string;
  dataAuthTag?: string;
  
  // PIN and biometric
  pinHash?: string;
  biometricEnabled?: boolean;
  biometricPublicKey?: string;
  isPinBiometricRequired?: boolean;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRoleType;
  walletAddress?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: Omit<UserEntity, 'password' | 'twoFactorSecret' | 'encryptedData' | 'dataIv' | 'dataAuthTag' | 'pinHash' | 'biometricPublicKey'>;
}
