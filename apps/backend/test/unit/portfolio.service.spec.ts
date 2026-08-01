// @ts-nocheck
import { Test, TestingModule } from '@nestjs/testing';
import { PortfolioService } from '../../src/modules/portfolio/services/portfolio.service';
import { PrismaService } from '../../src/modules/common/modules/prisma.service';
import { WalletsService } from '../../src/modules/wallets/services/wallets.service';

describe('PortfolioService', () => {
  let service: PortfolioService;
  let prismaService: PrismaService;
  let walletsService: WalletsService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        PortfolioService,
        {
          provide: PrismaService,
          useValue: {
            wallet: {
              findMany: jest.fn(),
            },
          } as any,
        },
        {
          provide: WalletsService,
          useValue: {
            getUserWallets: jest.fn(),
          },
        },
      ],
    }).compile();

    service = moduleRef.get<PortfolioService>(PortfolioService);
    prismaService = moduleRef.get<PrismaService>(PrismaService);
    walletsService = moduleRef.get<WalletsService>(WalletsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should calculate portfolio summary', async () => {
    const mockWallets = [
      {
        id: '1',
        balances: [
          { symbol: 'ETH', balanceUsd: 1000 },
          { symbol: 'USDC', balanceUsd: 500 },
        ],
      },
    ];

    jest.spyOn(prismaService.wallet, 'findMany').mockResolvedValue(mockWallets as any);
    
    const result = await service.getPortfolioSummary('user-id');
    expect(result).toBeDefined();
    expect(result.totalValueUsd).toBeDefined();
  });
});
