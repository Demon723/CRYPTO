import { Injectable, Logger } from '@nestjs/common';
import { HealthCheckService, HealthCheck } from '@nestjs/terminus';
import { PrismaService } from '../../modules/common/modules/prisma.service';
import { RedisService } from '../../modules/common/modules/redis.service';
import { LoggerService } from '../../modules/common/modules/logger.service';

type HealthCheckFn = () => Promise<unknown>;

@Injectable()
export class HealthService {
  private readonly logger = new LoggerService();

  constructor(
    private readonly health: HealthCheckService,
    private readonly prismaService: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  check() {
    const checks: HealthCheckFn[] = [
      () => this.prismaService.healthCheck(),
      () => this.redisService.healthCheck(),
    ];

    return this.health.check(checks as unknown as import('@nestjs/terminus').HealthIndicatorFunction[]);
  }
}
