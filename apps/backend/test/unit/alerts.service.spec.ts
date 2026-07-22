import { Test, TestingModule } from '@nestjs/testing';
import { AlertsService } from '../../src/modules/alerts/services/alerts.service';
import { PrismaService } from '../../src/modules/common/modules/prisma.service';
import { RedisService } from '../../src/modules/common/modules/redis.service';
import { NotificationsService } from '../../src/modules/notifications/services/notifications.service';
import { AlertType } from '../../src/modules/alerts/entities/alert.entity';

describe('AlertsService', () => {
  let service: AlertsService;
  let prismaService: PrismaService;
  let redisService: RedisService;
  let notificationsService: NotificationsService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AlertsService,
        {
          provide: PrismaService,
          useValue: {
            alert: {
              findMany: jest.fn(),
              findFirst: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
        {
          provide: RedisService,
          useValue: {
            getClient: jest.fn().mockReturnValue({
              publish: jest.fn(),
            }),
          },
        },
        {
          provide: NotificationsService,
          useValue: {
            createNotification: jest.fn(),
          },
        },
      ],
    }).compile();

    service = moduleRef.get<AlertsService>(AlertsService);
    prismaService = moduleRef.get<PrismaService>(PrismaService);
    redisService = moduleRef.get<RedisService>(RedisService);
    notificationsService = moduleRef.get<NotificationsService>(NotificationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get user alerts', async () => {
    const mockAlerts = [
      {
        id: '1',
        userId: 'user-id',
        type: AlertType.PRICE,
        status: 'ACTIVE',
        condition: { field: 'price', operator: '>', value: 3000 },
      },
    ];

    jest.spyOn(prismaService.alert, 'findMany').mockResolvedValue(mockAlerts as any);

    const result = await service.getUserAlerts('user-id');
    expect(result).toEqual(mockAlerts);
  });

  it('should create an alert', async () => {
    const mockAlert = {
      id: '1',
      userId: 'user-id',
      type: AlertType.PRICE,
      status: 'ACTIVE',
      condition: { field: 'price', operator: '>', value: 3000 },
      createdAt: new Date(),
    };

    jest.spyOn(prismaService.alert, 'create').mockResolvedValue(mockAlert as any);

    const result = await service.createAlert('user-id', {
      type: AlertType.PRICE,
      condition: { field: 'price', operator: '>', value: 3000 },
    });

    expect(result).toBeDefined();
    expect(result.type).toBe('PRICE');
  });
});
