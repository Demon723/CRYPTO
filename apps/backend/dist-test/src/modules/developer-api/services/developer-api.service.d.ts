import { PrismaService } from '../../common/modules/prisma.service';
import { RedisService } from '../../common/modules/redis.service';
import { ApiKeyEntity, CreateApiKeyDto } from '../entities/api-key.entity';
export declare class DeveloperApiService {
    private readonly prisma;
    private readonly redisService;
    private readonly logger;
    private readonly apiKeyPrefix;
    private readonly apiKeyLength;
    constructor(prisma: PrismaService, redisService: RedisService);
    getUserApiKeys(userId: string): Promise<ApiKeyEntity[]>;
    getApiKeyById(userId: string, keyId: string): Promise<ApiKeyEntity>;
    createApiKey(userId: string, dto: CreateApiKeyDto): Promise<ApiKeyResponse>;
    revokeApiKey(userId: string, keyId: string): Promise<void>;
    validateApiKey(rawKey: string): Promise<ApiKeyEntity | null>;
    checkRateLimit(userId: string, apiKeyId: string): Promise<{
        allowed: boolean;
        remaining: number;
    }>;
    private generateApiKey;
    private hashApiKey;
}
