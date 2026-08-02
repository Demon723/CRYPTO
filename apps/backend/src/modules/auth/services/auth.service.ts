import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  ForbiddenException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../common/modules/prisma.service';
import { CryptoService } from '../../common/modules/crypto/crypto.service';
import { AuthResponse, UserEntity, JwtPayload, SensitiveUserData } from '../entities/user.entity';
import { UserRole } from '../../../common/enums';
import { LoggerService } from '../../common/modules/logger.service';

@Injectable()
export class AuthService {
  private readonly logger = new LoggerService();
  private readonly bcryptRounds: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly cryptoService: CryptoService,
  ) {
    this.bcryptRounds = this.configService.get<number>('BCRYPT_ROUNDS', 12);
  }

  async validateUserByEmail(email: string, password: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return null;
    }

    if (!user.isActive) {
      throw new ForbiddenException('Account is deactivated');
    }

    return this.mapToEntity(user);
  }

  async validateOAuthUser(data: {
    email: string;
    name?: string;
    image?: string;
  }): Promise<AuthResponse> {
    let user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: data.email,
          name: data.name,
          image: data.image,
          emailVerified: true,
          emailVerifiedAt: new Date(),
          password: null,
        },
      });
    } else if (!user.emailVerified) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: true,
          emailVerifiedAt: new Date(),
          name: data.name || user.name,
          image: data.image || user.image,
        },
      });
    }

    const tokens = await this.generateTokens(this.mapToEntity(user));
    await this.updateLastLogin(user.id);

    return {
      ...tokens,
      user: this.sanitizeUser(user),
    };
  }

  async register(data: {
    email: string;
    password: string;
    name?: string;
  }): Promise<AuthResponse> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(data.password, this.bcryptRounds);

    const sensitiveData: SensitiveUserData = {
      email: data.email,
      name: data.name,
      password: hashedPassword,
      wallets: [],
      portfolio: {},
      transactions: [],
      preferences: {},
    };

    const encrypted = this.cryptoService.encryptObject(sensitiveData);

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        encryptedData: encrypted.ciphertext,
        dataIv: encrypted.iv,
        dataAuthTag: encrypted.authTag,
      },
    });

    const tokens = await this.generateTokens(this.mapToEntity(user));

    this.logger.log(`New user registered: ${user.email}`, 'AuthService');

    return {
      ...tokens,
      user: this.sanitizeUser(user),
    };
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const user = await this.validateUserByEmail(email, password);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = await this.generateTokens(user);
    await this.updateLastLogin(user.id);

    this.logger.log(`User logged in: ${user.email}`, 'AuthService');

    return {
      ...tokens,
      user: this.sanitizeUser(user),
    };
  }

  async refreshTokens(refreshToken: string): Promise<AuthResponse> {
    try {
      const payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return {
        accessToken: this.jwtService.sign(
          { sub: user.id, email: user.email, role: user.role },
          { expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '7d'), secret: this.configService.get<string>('JWT_SECRET') },
        ),
        refreshToken: await this.generateRefreshToken(user.id),
        user: this.sanitizeUser(user),
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async findUserById(id: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return null;
    }

    return this.mapToEntity(user);
  }

  async findUserByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return null;
    }

    return this.mapToEntity(user);
  }

  // Owner-only: decrypt and return full user data
  async getDecryptedUserData(userId: string): Promise<{ user: UserEntity; sensitiveData: SensitiveUserData }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new InternalServerErrorException('User not found');
    }

    if (!user.encryptedData || !user.dataIv || !user.dataAuthTag) {
      throw new InternalServerErrorException('User data is not encrypted');
    }

    const sensitiveData = this.cryptoService.decryptObject({
      ciphertext: user.encryptedData,
      iv: user.dataIv,
      authTag: user.dataAuthTag,
    });

    return {
      user: this.mapToEntity(user),
      sensitiveData: sensitiveData as any,
    };
  }

  private async generateTokens(user: UserEntity): Promise<{ accessToken: string; refreshToken: string }> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '7d'),
        secret: this.configService.get<string>('JWT_SECRET'),
      }),
      this.generateRefreshToken(user.id),
    ]);

    return { accessToken, refreshToken };
  }

  private async generateRefreshToken(userId: string): Promise<string> {
    return this.jwtService.signAsync(
      { sub: userId, type: 'refresh' },
      {
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '30d'),
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      },
    );
  }

  private async updateLastLogin(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
  }

  private mapToEntity(user: {
    id: string;
    email: string;
    emailVerified: boolean;
    emailVerifiedAt?: Date;
    name?: string;
    image?: string;
    password?: string;
    role: string;
    isActive: boolean;
    isTwoFactorEnabled: boolean;
    twoFactorSecret?: string;
    lastLoginAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    encryptedData?: string;
    dataIv?: string;
    dataAuthTag?: string;
  }): UserEntity {
    return {
      id: user.id,
      email: user.email,
      emailVerified: user.emailVerified,
      emailVerifiedAt: user.emailVerifiedAt,
      name: user.name,
      image: user.image,
      password: user.password,
      role: user.role as UserRole,
      isActive: user.isActive,
      isTwoFactorEnabled: user.isTwoFactorEnabled,
      twoFactorSecret: user.twoFactorSecret,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      encryptedData: user.encryptedData,
      dataIv: user.dataIv,
      dataAuthTag: user.dataAuthTag,
    };
  }

  private sanitizeUser(user: {
    id: string;
    email: string;
    emailVerified: boolean;
    emailVerifiedAt?: Date;
    name?: string;
    image?: string;
    role: string;
    isActive: boolean;
    isTwoFactorEnabled: boolean;
    lastLoginAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    encryptedData?: string;
    dataIv?: string;
    dataAuthTag?: string;
  }): Omit<UserEntity, 'password' | 'twoFactorSecret' | 'encryptedData' | 'dataIv' | 'dataAuthTag'> {
    const { password, twoFactorSecret, encryptedData, dataIv, dataAuthTag, ...sanitized } = this.mapToEntity(user);
    return sanitized;
  }
}
