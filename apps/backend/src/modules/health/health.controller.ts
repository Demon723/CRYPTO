import { Controller, Get, Ip } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaService } from '../common/modules/prisma.service';
import { RedisService } from '../common/modules/redis.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Health check' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  @ApiResponse({ status: 503, description: 'Service is degraded' })
  async health(@Ip() ip?: string) {
    const checks = {
      database: 'unknown',
      redis: 'unknown',
      memory: process.memoryUsage(),
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      checks.database = 'healthy';
    } catch {
      checks.database = 'unhealthy';
    }

    try {
      const redisHealth = await this.redis.healthCheck(); checks.redis = redisHealth.status === "healthy" ? "healthy" : "degraded";
      checks.redis = 'healthy';
    } catch {
      checks.redis = 'degraded';
    }

    const isHealthy = checks.database === 'healthy';

    return {
      status: isHealthy ? 'ok' : 'degraded',
      checks,
      service: 'synex-backend',
      version: '1.0.0',
      ip,
    };
  }
}
