import { Test, TestingModule } from '@nestjs/testing';
import { TokensService } from '../../src/modules/tokens/services/tokens.service';
import { PrismaService } from '../../src/modules/common/modules/prisma.service';
import { HttpService } from '../../src/modules/common/modules/http.service';

describe('TokensService', () => {
  let service: TokensService;
  let prismaService: PrismaService;
  let httpService: HttpService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        TokensService,
        {
          provide: PrismaService,
          useValue: {
            token: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              upsert: jest.fn(),
              createMany: jest.fn(),
            },
          },
        },
        {
          provide: HttpService,
          useValue: {
            getAxiosInstance: jest.fn().mockReturnValue({
              get: jest.fn(),
            }),
          },
        },
      ],
    }).compile();

    service = moduleRef.get<TokensService>(TokensService);
    prismaService = moduleRef.get<PrismaService>(PrismaService);
    httpService = moduleRef.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should search tokens', async () => {
    const mockTokens = [
      {
        address: '0x123',
        chain: 'ETHEREUM',
        symbol: 'ETH',
        name: 'Ethereum',
        priceUsd: 2500,
        change24h: 2.5,
        marketCapUsd: 300000000000,
        volumeUsd24h: 10000000000,
        isVerified: true,
        isScam: false,
      },
    ];

    jest.spyOn(prismaService.token, 'findMany').mockResolvedValue(mockTokens as any);

    const result = await service.searchTokens('ETH', 'ETHEREUM');
    expect(result).toEqual(mockTokens);
  });

  it('should get trending tokens', async () => {
    const mockTokens = [
      {
        address: '0x123',
        chain: 'ETHEREUM',
        symbol: 'ETH',
        name: 'Ethereum',
        isVerified: true,
        isScam: false,
      },
    ];

    jest.spyOn(prismaService.token, 'findMany').mockResolvedValue(mockTokens as any);

    const result = await service.getTrendingTokens('ETHEREUM');
    expect(result).toEqual(mockTokens);
  });
});
