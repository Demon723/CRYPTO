import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from '../../src/modules/health/health.controller';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should return health status', () => {
    const result = controller.health();
    expect(result.status).toBe('ok');
    expect(result.service).toBe('synex-backend');
    expect(result.version).toBe('1.0.0');
    expect(result.timestamp).toBeDefined();
  });
});
