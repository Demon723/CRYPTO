// @ts-nocheck
import { Test, TestingModule } from '@nestjs/testing';
import { WalletsService } from '../../src/modules/wallets/services/wallets.service';
import { Chain } from '../../src/modules/wallets/entities/wallet.entity';
import { PrismaService } from '../../src/modules/common/modules/prisma.service';
import { HttpModule } from '../../src/modules/common/modules/http.module';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from '../../src/modules/common/modules/logger.module';

describe('WalletsService', () => {
  let service: WalletsService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [HttpModule, ConfigModule.forRoot({ isGlobal: true }), LoggerModule],
      providers: [
        WalletsService,
        {
          provide: PrismaService,
          useValue: {
            wallet: {
              findMany: jest.fn(),
              findFirst: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
            tokenBalance: {
              findMany: jest.fn(),
              deleteMany: jest.fn(),
              createMany: jest.fn(),
            },
          } as any,
        },
      ],
    }).compile();

    service = moduleRef.get<WalletsService>(WalletsService);
    prismaService = moduleRef.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get user wallets', async () => {
    const mockWallets = [
      { id: '1', address: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD38', chain: Chain.ETHEREUM, isActive: true },
    ];

    jest.spyOn(prismaService.wallet, 'findMany').mockResolvedValue(mockWallets as any);

    const result = await service.getUserWallets('user-id');
    expect(result).toEqual(mockWallets);
  });

  it('should create a wallet', async () => {
    const mockWallet = {
      id: '1',
      userId: 'user-id',
      address: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD38',
      chain: Chain.ETHEREUM,
      isActive: true,
    };

    jest.spyOn(prismaService.wallet, 'findFirst').mockResolvedValue(null);
    jest.spyOn(prismaService.wallet, 'create').mockResolvedValue(mockWallet as any);

    const result = await service.createWallet('user-id', {
      address: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD38',
      chain: Chain.ETHEREUM,
    });

    expect(result).toEqual(mockWallet);
  });
});
