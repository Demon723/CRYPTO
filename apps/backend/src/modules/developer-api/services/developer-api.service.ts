import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../common/modules/prisma.service';
import { RedisService } from '../../common/modules/redis.service';
import * as crypto from 'crypto';
import { ApiKeyEntity, CreateApiKeyDto } from '../entities/api-key.entity';
import { LoggerService } from '../../common/modules/logger.service';

@Injectable()
export class DeveloperApiService {
  private readonly logger = new LoggerService();
  private readonly apiKeyPrefix = 'cmai_';
  private readonly apiKeyLength = 32;

  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  async getUserApiKeys(userId: string): Promise<ApiKeyEntity[]> {
    // @ts-ignore
    return this.prisma.apiKey.findMany({
      where: { userId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getApiKeyById(userId: string, keyId: string): Promise<ApiKeyEntity> {
    const apiKey = await this.prisma.apiKey.findFirst({
      where: { id: keyId, userId },
    });

    if (!apiKey) {
      throw new NotFoundException('API key not found');
    }

    return apiKey as any;
  }

  async createApiKey(userId: string, dto: CreateApiKeyDto) {
    const rawKey = this.generateApiKey();
    const keyHash = this.hashApiKey(rawKey);

    const apiKey = await this.prisma.apiKey.create({
      data: {
        userId,
        name: dto.name,
        keyHash,
        keyPrefix: rawKey.slice(0, 8),
        permissions: JSON.stringify(dto.permissions || { read: true }),
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
        isActive: true,
      },
    });

    this.logger.log(`API key created: ${apiKey.id} for user ${userId}`, 'DeveloperApiService');

    return {
      id: apiKey.id,
      name: apiKey.name,
      keyPrefix: apiKey.keyPrefix,
      key: `${this.apiKeyPrefix}${rawKey}`,
      permissions: typeof apiKey.permissions === 'string' ? JSON.parse(apiKey.permissions) : apiKey.permissions,
      lastUsedAt: apiKey.lastUsedAt,
      expiresAt: apiKey.expiresAt,
      isActive: apiKey.isActive,
      createdAt: apiKey.createdAt,
    };
  }

  async revokeApiKey(userId: string, keyId: string): Promise<void> {
    await this.getApiKeyById(userId, keyId);

    await this.prisma.apiKey.update({
      where: { id: keyId },
      data: { isActive: false },
    });

    this.logger.log(`API key revoked: ${keyId}`, 'DeveloperApiService');
  }

  async validateApiKey(rawKey: string): Promise<ApiKeyEntity | null> {
    const keyHash = this.hashApiKey(rawKey.replace(this.apiKeyPrefix, ''));

    const apiKey = await this.prisma.apiKey.findFirst({
      where: { keyHash, isActive: true },
      include: { user: { select: { id: true, email: true, role: true } } },
    });

    if (!apiKey) {
      return null;
    }

    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      return null;
    }

    await this.prisma.apiKey.update({
      where: { id: apiKey.id },
      data: { lastUsedAt: new Date() },
    });

    return apiKey as any;
  }

  async checkRateLimit(userId: string, apiKeyId: string): Promise<{ allowed: boolean; remaining: number }> {
    const key = `ratelimit:${apiKeyId}`;
    const limit = 1000;
    const windowSeconds = 3600;

    const current = await this.redisService.getClient().incr(key);
    if (current === 1) {
      await this.redisService.getClient().expire(key, windowSeconds);
    }

    const remaining = Math.max(0, limit - current);
    return { allowed: current <= limit, remaining };
  }

  private generateApiKey(): string {
    return crypto.randomBytes(this.apiKeyLength).toString('hex');
  }

  private hashApiKey(key: string): string {
    return crypto.createHash('sha256').update(key).digest('hex');
  }
}
