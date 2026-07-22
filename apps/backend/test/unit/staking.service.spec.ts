import { Test, TestingModule } from '@nestjs/testing';
import { StakingService } from '../../src/modules/staking/services/staking.service';
import { PrismaService } from '../../src/modules/common/modules/prisma.service';

describe('StakingService', () => {
  let service: StakingService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        StakingService,
        {
          provide: PrismaService,
          useValue: {
            stakingPosition: {
              findMany: jest.fn(),
              findFirst: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
            wallet: {
              findFirst: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = moduleRef.get<StakingService>(StakingService);
    prismaService = moduleRef.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get user staking positions', async () => {
    const mockPositions = [
      {
        id: '1',
        userId: 'user-id',
        amount: '1000',
        apy: '12',
        status: 'ACTIVE',
      },
    ];

    jest.spyOn(prismaService.stakingPosition, 'findMany').mockResolvedValue(mockPositions as any);

    const result = await service.getUserStakingPositions('user-id');
    expect(result).toEqual(mockPositions);
  });

  it('should calculate rewards', async () => {
    const position = {
      id: '1',
      amount: '1000',
      apy: '12',
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      status: 'ACTIVE',
    };

    const rewards = (service as any).calculateRewards(position);
    expect(rewards).toBeGreaterThan(0);
  });
});
