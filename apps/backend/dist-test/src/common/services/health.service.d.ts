import { HealthCheckService } from '@nestjs/terminus';
import { PrismaService } from '../../modules/common/modules/prisma.service';
import { RedisService } from '../../modules/common/modules/redis.service';
export declare class HealthService {
    private readonly health;
    private readonly prismaService;
    private readonly redisService;
    private readonly logger;
    constructor(health: HealthCheckService, prismaService: PrismaService, redisService: RedisService);
    check(): Promise<import("@nestjs/terminus").HealthCheckResult<import("@nestjs/terminus").HealthIndicatorResult<string, import("@nestjs/terminus").HealthIndicatorStatus, Record<string, any>>, Partial<import("@nestjs/terminus").HealthIndicatorResult<string, import("@nestjs/terminus").HealthIndicatorStatus, Record<string, any>>>, Partial<import("@nestjs/terminus").HealthIndicatorResult<string, import("@nestjs/terminus").HealthIndicatorStatus, Record<string, any>>>>>;
}
