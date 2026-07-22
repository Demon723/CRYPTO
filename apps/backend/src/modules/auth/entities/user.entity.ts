import { UserRole } from '../../../common/enums';

export type UserRoleType = UserRole;

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
  user: Omit<UserEntity, 'password' | 'twoFactorSecret'>;
}
