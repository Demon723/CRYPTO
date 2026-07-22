import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../common/modules/prisma.service';
import { UpdateProfileDto, ChangePasswordDto, Enable2FADto } from '../dto';
import { JwtPayload } from '../../auth/entities/user.entity';
import { LoggerService } from '../../common/modules/logger.service';

@Injectable()
export class UsersService {
  private readonly logger = new LoggerService();
  private readonly bcryptRounds = 12;

  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        name: true,
        image: true,
        role: true,
        isActive: true,
        isTwoFactorEnabled: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        name: dto.name,
        image: dto.image,
      },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        name: true,
        image: true,
        role: true,
        isActive: true,
        isTwoFactorEnabled: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    this.logger.log(`User profile updated: ${user.email}`, 'UsersService');

    return user;
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    if (dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestException('New password and confirm password do not match');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { password: true, email: true },
    });

    if (!user || !user.password) {
      throw new NotFoundException('User not found');
    }

    const isCurrentPasswordValid = await bcrypt.compare(dto.currentPassword, user.password);

    if (!isCurrentPasswordValid) {
      throw new ForbiddenException('Current password is incorrect');
    }

    const hashedNewPassword = await bcrypt.hash(dto.newPassword, this.bcryptRounds);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    this.logger.log(`Password changed for user: ${user.email}`, 'UsersService');
  }

  async enable2FA(userId: string, dto: Enable2FADto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isTwoFactorEnabled) {
      throw new BadRequestException('2FA is already enabled');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorSecret: dto.secret,
        isTwoFactorEnabled: true,
      },
    });

    this.logger.log(`2FA enabled for user: ${user.email}`, 'UsersService');
  }

  async disable2FA(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.isTwoFactorEnabled) {
      throw new BadRequestException('2FA is not enabled');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorSecret: null,
        isTwoFactorEnabled: false,
      },
    });

    this.logger.log(`2FA disabled for user: ${user.email}`, 'UsersService');
  }

  async deleteAccount(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        wallets: true,
        subscriptions: true,
        stakingPositions: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        isActive: false,
        email: `deleted_${Date.now()}_${user.email}`,
        name: 'Deleted User',
        image: null,
        password: null,
      },
    });

    this.logger.log(`Account deactivated: ${user.email}`, 'UsersService');
  }

  async getUsers(page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip: offset,
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
          role: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
