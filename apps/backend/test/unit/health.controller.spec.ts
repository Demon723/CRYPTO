import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from '../../src/modules/health/health.controller';
import { Ip } from '@nestjs/common';
import { PrismaService } from '../../src/modules/common/modules/prisma.service';
import { RedisService } from '../../src/modules/common/modules/redis.service';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: PrismaService,
          useValue: {
            $queryRaw: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: RedisService,
          useValue: {
            healthCheck: jest.fn().mockResolvedValue({ status: 'healthy', timestamp: new Date().toISOString() }),
          },
        },
      ],
    })
      .overrideProvider(Ip)
      .useValue('127.0.0.1')
      .compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should return health status', async () => {
    const result = await controller.health('127.0.0.1');
    expect(result.status).toBe('ok');
    expect(result.service).toBe('synex-backend');
    expect(result.version).toBe('1.0.0');
    expect(result.checks.timestamp).toBeDefined();
  });

});
