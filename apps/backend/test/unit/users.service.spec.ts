import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../../src/modules/users/services/users.service';
import { PrismaService } from '../../src/modules/common/modules/prisma.service';
import { CryptoService } from '../../src/modules/common/modules/crypto/crypto.service';
import { SensitiveUserData } from '../../src/modules/auth/entities/user.entity';

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: PrismaService;
  let cryptoService: CryptoService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              count: jest.fn(),
            },
          } as any,
        },
        {
          provide: CryptoService,
          useValue: {
            decryptObject: jest.fn(),
            encryptObject: jest.fn(),
          } as any,
        },
      ],
    }).compile();

    service = moduleRef.get<UsersService>(UsersService);
    prismaService = moduleRef.get<PrismaService>(PrismaService);
    cryptoService = moduleRef.get<CryptoService>(CryptoService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should find user by id', async () => {
    const mockUser = {
      id: 'user-1',
      email: 'test@example.com',
      role: 'USER',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser as any);

    const result = await service.findById('user-1');
    expect(result).toBeDefined();
    expect(result!.id).toBe('user-1');
  });

  it('should return null when user not found', async () => {
    jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

    const result = await service.findById('nonexistent');
    expect(result).toBeNull();
  });

  it('should get decrypted user data (owner only)', async () => {
    const mockUser = {
      id: 'user-1',
      email: 'test@example.com',
      role: 'USER',
      isActive: true,
      encryptedData: 'encrypted',
      dataIv: 'iv',
      dataAuthTag: 'tag',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockSensitiveData: SensitiveUserData = {
      email: 'test@example.com',
      wallets: [],
      portfolio: {},
    };

    jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser as any);
    jest.spyOn(cryptoService, 'decryptObject').mockReturnValue(mockSensitiveData as any);

    const result = await service.getDecryptedUserData('user-1');
    expect(result.user.id).toBe('user-1');
    expect(result.sensitiveData).toEqual(mockSensitiveData);
  });

  it('should throw when user not found for decryption', async () => {
    jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

    await expect(service.getDecryptedUserData('nonexistent')).rejects.toThrow('User not found');
  });

  it('should re-encrypt user data', async () => {
    const mockUser = {
      id: 'user-1',
      email: 'test@example.com',
      encryptedData: 'old-encrypted',
      dataIv: 'old-iv',
      dataAuthTag: 'old-tag',
    };

    jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser as any);
    jest.spyOn(cryptoService, 'decryptObject').mockReturnValue({ email: 'test@example.com' } as any);
    jest.spyOn(cryptoService, 'encryptObject').mockReturnValue({
      ciphertext: 'new-encrypted',
      iv: 'new-iv',
      authTag: 'new-tag',
    } as any);
    jest.spyOn(prismaService.user, 'update').mockResolvedValue({ ...mockUser, encryptedData: 'new-encrypted' } as any);

    const result = await service.reEncryptUserData('user-1');
    expect(result.success).toBe(true);
    expect(result.message).toContain('re-encrypted');
  });
});
