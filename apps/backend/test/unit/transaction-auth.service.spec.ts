import { Test, TestingModule } from '@nestjs/testing';
import { TransactionAuthService } from '../../src/modules/common/services/transaction-auth.service';
import { PrismaService } from '../../src/modules/common/modules/prisma.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed-pin'),
  compare: jest.fn().mockResolvedValue(true),
}));

describe('TransactionAuthService', () => {
  let service: TransactionAuthService;
  let prisma: PrismaService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionAuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TransactionAuthService>(TransactionAuthService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('setPin', () => {
    it('should set PIN successfully for valid 6-digit PIN', async () => {
      mockPrismaService.user.update.mockResolvedValue({});
      
      const result = await service.setPin('user-id', '123456');
      
      expect(result.success).toBe(true);
      expect(result.message).toBe('PIN set successfully');
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-id' },
        data: { pinHash: 'hashed-pin' },
      });
    });

    it('should reject non-6-digit PIN', async () => {
      await expect(service.setPin('user-id', '12345')).rejects.toThrow(ForbiddenException);
      await expect(service.setPin('user-id', '1234567')).rejects.toThrow(ForbiddenException);
      await expect(service.setPin('user-id', 'abc123')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('verifyPin', () => {
    it('should return true for valid PIN', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ pinHash: 'hashed-pin' });
      
      const result = await service.verifyPin('user-id', '123456');
      expect(result).toBe(true);
    });

    it('should return false for user without PIN', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ pinHash: null });
      
      const result = await service.verifyPin('user-id', '123456');
      expect(result).toBe(false);
    });

    it('should return false for non-existent user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      
      const result = await service.verifyPin('user-id', '123456');
      expect(result).toBe(false);
    });
  });

  describe('removePin', () => {
    it('should remove PIN successfully', async () => {
      mockPrismaService.user.update.mockResolvedValue({});
      
      const result = await service.removePin('user-id');
      
      expect(result.success).toBe(true);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-id' },
        data: { pinHash: null },
      });
    });
  });

  describe('enableBiometric', () => {
    it('should enable biometric for valid public key', async () => {
      mockPrismaService.user.update.mockResolvedValue({});
      
      const result = await service.enableBiometric('user-id', 'MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEZggdUMrUJFWrcci6VyW6SMpyQjKL82VA1qKIQJuTBqltNqKaOCNM8scWMq6rqGeinSmaZotELaED6DfdFwrW+w==');
      
      expect(result.success).toBe(true);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-id' },
        data: {
          biometricEnabled: true,
          biometricPublicKey: 'MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEZggdUMrUJFWrcci6VyW6SMpyQjKL82VA1qKIQJuTBqltNqKaOCNM8scWMq6rqGeinSmaZotELaED6DfdFwrW+w==',
        },
      });
    });

    it('should reject short public key', async () => {
      await expect(service.enableBiometric('user-id', 'short')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('disableBiometric', () => {
    it('should disable biometric successfully', async () => {
      mockPrismaService.user.update.mockResolvedValue({});
      
      const result = await service.disableBiometric('user-id');
      
      expect(result.success).toBe(true);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-id' },
        data: {
          biometricEnabled: false,
          biometricPublicKey: null,
        },
      });
    });
  });

  describe('updateSettings', () => {
    it('should update settings when user has PIN or biometric', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ pinHash: 'hash', biometricEnabled: true });
      mockPrismaService.user.update.mockResolvedValue({});
      
      const result = await service.updateSettings('user-id', true);
      
      expect(result.success).toBe(true);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-id' },
        data: { isPinBiometricRequired: true },
      });
    });

    it('should reject requiring PIN/biometric without setup', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ pinHash: null, biometricEnabled: false });
      
      await expect(service.updateSettings('user-id', true)).rejects.toThrow(ForbiddenException);
    });

    it('should reject non-existent user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      
      await expect(service.updateSettings('user-id', true)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getSettings', () => {
    it('should return correct settings', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        pinHash: 'hash',
        biometricEnabled: true,
        isPinBiometricRequired: true,
      });
      
      const result = await service.getSettings('user-id');
      
      expect(result).toEqual({
        hasPin: true,
        hasBiometric: true,
        isPinBiometricRequired: true,
      });
    });

    it('should throw for non-existent user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      
      await expect(service.getSettings('user-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('requireTransactionAuth', () => {
    it('should pass when not required', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        pinHash: 'hash',
        biometricEnabled: true,
        isPinBiometricRequired: false,
      });
      
      await expect(service.requireTransactionAuth('user-id')).resolves.toBeUndefined();
    });

    it('should pass with valid PIN', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        pinHash: 'hashed-pin',
        biometricEnabled: false,
        isPinBiometricRequired: true,
      });
      (require('bcrypt').compare as jest.Mock).mockResolvedValue(true);
      
      await expect(service.requireTransactionAuth('user-id', '123456')).resolves.toBeUndefined();
    });

    it('should pass with biometric signature', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        pinHash: null,
        biometricEnabled: true,
        isPinBiometricRequired: true,
      });
      
      await expect(service.requireTransactionAuth('user-id', undefined, '0xsig')).resolves.toBeUndefined();
    });

    it('should throw when required but no auth provided', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        pinHash: 'hashed-pin',
        biometricEnabled: true,
        isPinBiometricRequired: true,
      });
      
      await expect(service.requireTransactionAuth('user-id')).rejects.toThrow(ForbiddenException);
    });
  });
});
