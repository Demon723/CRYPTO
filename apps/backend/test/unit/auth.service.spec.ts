// @ts-nocheck
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../../src/modules/auth/services/auth.service';
import { PrismaService } from '../../src/modules/common/modules/prisma.service';
import { ConfigService } from '@nestjs/config';
import { CryptoService } from '../../src/modules/common/modules/crypto/crypto.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('$2b$12$mockedHashValueForTesting'),
  compare: jest.fn().mockResolvedValue(true),
}));

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;
  let configService: ConfigService;
  let cryptoService: CryptoService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
          } as any,
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test-secret'),
          },
        },
        {
          provide: CryptoService,
          useValue: {
            encryptObject: jest.fn().mockReturnValue({
              ciphertext: 'mock-encrypted',
              iv: 'mock-iv',
              authTag: 'mock-tag',
            }),
            decryptObject: jest.fn().mockReturnValue({
              email: 'test@example.com',
              wallets: [],
              portfolio: {},
            }),
          } as any,
        },
      ],
    }).compile();

    service = moduleRef.get<AuthService>(AuthService);
    prismaService = moduleRef.get<PrismaService>(PrismaService);
    jwtService = moduleRef.get<JwtService>(JwtService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    cryptoService = moduleRef.get<CryptoService>(CryptoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should validate user with correct credentials', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      password: '$2b$12$mockedHashValueForTesting',
      isActive: true,
    };

    jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser as any);

    const result = await service.validateUserByEmail('test@example.com', 'password');
    expect(result).toBeDefined();
    expect(result?.email).toBe('test@example.com');
  });

  it('should return null for invalid credentials', async () => {
    jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

    const result = await service.validateUserByEmail('test@example.com', 'wrongpassword');
    expect(result).toBeNull();
  });

  it('should register a new user with encrypted data', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      password: '$2b$12$mockedHashValueForTesting',
      isActive: true,
      role: 'USER',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);
    jest.spyOn(prismaService.user, 'create').mockResolvedValue(mockUser as any);
    jest.spyOn(jwtService, 'signAsync').mockResolvedValue('mock-access-token');
    jest.spyOn(jwtService, 'sign').mockResolvedValue('mock-refresh-token');

    const result = await service.register({
      email: 'test@example.com',
      password: 'SecurePass123!',
      name: 'Test User',
    });

    expect(result).toBeDefined();
    expect(result.user.email).toBe('test@example.com');
    expect(cryptoService.encryptObject).toHaveBeenCalled();
  });
});
