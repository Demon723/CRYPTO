import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../../src/modules/auth/services/auth.service';
import { PrismaService } from '../../src/modules/common/modules/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;
  let configService: ConfigService;

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
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test-secret'),
          },
        },
      ],
    }).compile();

    service = moduleRef.get<AuthService>(AuthService);
    prismaService = moduleRef.get<PrismaService>(PrismaService);
    jwtService = moduleRef.get<JwtService>(JwtService);
    configService = moduleRef.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should validate user with correct credentials', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      password: await bcrypt.hash('password', 12),
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
});
