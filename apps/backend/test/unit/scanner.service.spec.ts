// @ts-nocheck
import { Test, TestingModule } from '@nestjs/testing';
import { ScannerService } from '../../src/modules/scanner/services/scanner.service';
import { PrismaService } from '../../src/modules/common/modules/prisma.service';
import { HttpService } from '../../src/modules/common/modules/http.service';
import { AiService } from '../../src/modules/ai/services/ai.service';

describe('ScannerService', () => {
  let service: ScannerService;
  let prismaService: PrismaService;
  let httpService: HttpService;
  let aiService: AiService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        ScannerService,
        {
          provide: PrismaService,
          useValue: {
            token: {
              findFirst: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
          } as any,
        },
        {
          provide: HttpService,
          useValue: {
            getAxiosInstance: jest.fn().mockReturnValue({
              get: jest.fn(),
            }),
          },
        },
        {
          provide: AiService,
          useValue: {
            detectScam: jest.fn(),
          },
        },
      ],
    }).compile();

    service = moduleRef.get<ScannerService>(ScannerService);
    prismaService = moduleRef.get<PrismaService>(PrismaService);
    httpService = moduleRef.get<HttpService>(HttpService);
    aiService = moduleRef.get<AiService>(AiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should analyze a contract', async () => {
    const mockToken = {
      id: '1',
      address: '0x1234567890123456789012345678901234567890',
      chain: 'ETHEREUM',
      name: 'Test Token',
      riskScore: 0,
      riskFactors: null,
      lastUpdated: new Date(),
      createdAt: new Date(),
    };

    jest.spyOn(prismaService.token, 'findFirst').mockResolvedValue(null);
    jest.spyOn(prismaService.token, 'create').mockResolvedValue(mockToken as any);
    jest.spyOn(prismaService.token, 'update').mockResolvedValue(mockToken as any);

    const result = await service.analyzeContract({
      address: '0x1234567890123456789012345678901234567890',
      chain: 'ETHEREUM',
    });

    expect(result).toBeDefined();
    expect(result.address).toBe('0x1234567890123456789012345678901234567890');
    expect(result.riskScore).toBeGreaterThanOrEqual(0);
  });
});
