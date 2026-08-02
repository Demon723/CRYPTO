import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/modules/prisma.service';
import { CryptoService } from '../../common/modules/crypto/crypto.service';
import { UserEntity, SensitiveUserData } from '../../auth/entities/user.entity';
import { UserRole } from '../../../common/enums';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cryptoService: CryptoService,
  ) {}

  async findById(id: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return null;
    }

    return this.mapToEntity(user);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return null;
    }

    return this.mapToEntity(user);
  }

  async getAllUsers(filters: {
    role?: UserRole;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{ data: UserEntity[]; total: number }> {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters.role) where.role = filters.role;
    if (filters.isActive !== undefined) where.isActive = filters.isActive;

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: data.map(this.mapToEntity),
      total,
    };
  }

  async updateUser(id: string, data: Partial<UserEntity>): Promise<UserEntity> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        image: data.image,
        isActive: data.isActive,
        isTwoFactorEnabled: data.isTwoFactorEnabled,
        twoFactorSecret: data.twoFactorSecret,
        role: data.role,
      },
    });

    return this.mapToEntity(updated);
  }

  async deactivateUser(id: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    this.logger.log(`User deactivated: ${user.email}`, 'UsersService');
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.delete({
      where: { id },
    });

    this.logger.log(`User deleted: ${user.email}`, 'UsersService');
  }

  async getDecryptedUserData(userId: string): Promise<{ user: UserEntity; sensitiveData: SensitiveUserData }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    }) as any;

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.encryptedData || !user.dataIv || !user.dataAuthTag) {
      throw new ForbiddenException('User data is not encrypted or not available');
    }

    const sensitiveData = this.cryptoService.decryptObject({
      ciphertext: user.encryptedData,
      iv: user.dataIv,
      authTag: user.dataAuthTag,
    }) as SensitiveUserData;

    return {
      user: this.mapToEntity(user),
      sensitiveData,
    };
  }

  async reEncryptUserData(userId: string): Promise<{ success: boolean; message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    }) as any;

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.encryptedData || !user.dataIv || !user.dataAuthTag) {
      throw new ForbiddenException('User data is not encrypted or not available');
    }

    try {
      const sensitiveData = this.cryptoService.decryptObject({
        ciphertext: user.encryptedData,
        iv: user.dataIv,
        authTag: user.dataAuthTag,
      }) as SensitiveUserData;

      const reEncrypted = this.cryptoService.encryptObject(sensitiveData);

      await this.prisma.user.update({
        where: { id: userId },
        data: {
          encryptedData: reEncrypted.ciphertext,
          dataIv: reEncrypted.iv,
          dataAuthTag: reEncrypted.authTag,
        },
      });

      return {
        success: true,
        message: `User ${user.email} data re-encrypted successfully with current owner key`,
      };
    } catch (error) {
      this.logger.error(`Failed to re-encrypt user ${userId}: ${error.message}`, 'UsersService');
      throw new ForbiddenException('Failed to re-encrypt user data. Ensure you have the correct owner key.');
    }
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
}
