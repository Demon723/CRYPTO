// @ts-nocheck
import { Test, TestingModule } from '@nestjs/testing';
import { TokensService } from '../../src/modules/tokens/services/tokens.service';
import { Chain } from '../../src/modules/wallets/entities/wallet.entity';
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
          } as any,
        },
        {
          provide: HttpService,
          useValue: {
            getAxiosInstance: jest.fn().mockReturnValue({
              get: jest.fn().mockResolvedValue({
                data: {
                  pairs: [{
                    baseToken: {
                      address: '0x123',
                      symbol: 'ETH',
                      name: 'Ethereum',
                    },
                    chainId: 1,
                    priceUsd: '2500',
                    priceChange: { h24: 2.5 },
                    marketCap: { toString: () => '300000000000' },
                    volume: { h24: { toString: () => '10000000000' } },
                  }],
                },
              }),
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
        chain: Chain.ETHEREUM,
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

    const result = await service.searchTokens('ETH', Chain.ETHEREUM);
    expect(result).toEqual(mockTokens);
  });

  it('should get trending tokens', async () => {
    const mockTokens = [
      {
        address: '0x123',
        chain: Chain.ETHEREUM,
        symbol: 'ETH',
        name: 'Ethereum',
        isVerified: true,
        isScam: false,
      },
    ];

    jest.spyOn(prismaService.token, 'findMany').mockResolvedValue(mockTokens as any);

    const result = await service.getTrendingTokens(Chain.ETHEREUM);
    expect(result).toEqual(mockTokens);
  });
});
