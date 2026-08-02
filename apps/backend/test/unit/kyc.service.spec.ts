import { Test, TestingModule } from '@nestjs/testing';
import { KycService } from '../../src/modules/kyc/services/kyc.service';
import { PrismaService } from '../../src/modules/common/modules/prisma.service';
import { ForbiddenException, BadRequestException, NotFoundException } from '@nestjs/common';
import { UserRole } from '../../src/common/enums';
import { GovernmentIdType, PaymentMethodType } from '../../src/modules/kyc/entities/kyc.entity';

describe('KycService', () => {
  let service: KycService;
  let prisma: PrismaService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KycService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<KycService>(KycService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('submitKyc', () => {
    it('should submit KYC successfully for eligible user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValueOnce({
        id: 'user-id',
        email: 'test@example.com',
        role: UserRole.USER,
        kycStatus: 'NOT_SUBMITTED',
      });
      mockPrismaService.user.update.mockResolvedValue({});

      const result = await service.submitKyc('user-id', {
        legalName: 'John Doe',
        dateOfBirth: '1990-01-15',
        homeAddress: '123 Main St',
        governmentIdType: GovernmentIdType.PASSPORT,
        governmentIdNumber: 'A12345678',
        governmentIdFrontUrl: 'https://example.com/id-front.jpg',
        selfieUrl: 'https://example.com/selfie.jpg',
        paymentMethodType: PaymentMethodType.UPI,
        paymentMethodLast4: '1234',
      });

      expect(result.success).toBe(true);
      expect(result.status).toBe('PENDING');
      expect(mockPrismaService.user.update).toHaveBeenCalled();
    });

    it('should reject KYC for user under 18', async () => {
      const recentDate = new Date();
      recentDate.setFullYear(recentDate.getFullYear() - 10); // 10 years old

      mockPrismaService.user.findUnique.mockResolvedValueOnce({
        id: 'user-id',
        email: 'test@example.com',
        role: UserRole.USER,
        kycStatus: 'NOT_SUBMITTED',
      });

      await expect(
        service.submitKyc('user-id', {
          legalName: 'John Doe',
          dateOfBirth: recentDate.toISOString().split('T')[0],
          homeAddress: '123 Main St',
          governmentIdType: GovernmentIdType.PASSPORT,
          governmentIdNumber: 'A12345678',
          governmentIdFrontUrl: 'https://example.com/id-front.jpg',
          selfieUrl: 'https://example.com/selfie.jpg',
          paymentMethodType: PaymentMethodType.UPI,
          paymentMethodLast4: '1234',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject KYC for admin users', async () => {
      mockPrismaService.user.findUnique.mockResolvedValueOnce({
        id: 'admin-id',
        email: 'admin@example.com',
        role: UserRole.ADMIN,
        kycStatus: 'NOT_SUBMITTED',
      });

      await expect(
        service.submitKyc('admin-id', {
          legalName: 'Admin User',
          dateOfBirth: '1990-01-15',
          homeAddress: '123 Main St',
          governmentIdType: GovernmentIdType.PASSPORT,
          governmentIdNumber: 'A12345678',
          governmentIdFrontUrl: 'https://example.com/id-front.jpg',
          selfieUrl: 'https://example.com/selfie.jpg',
          paymentMethodType: PaymentMethodType.UPI,
          paymentMethodLast4: '1234',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should reject invalid passport format', async () => {
      mockPrismaService.user.findUnique.mockResolvedValueOnce({
        id: 'user-id',
        email: 'test@example.com',
        role: UserRole.USER,
        kycStatus: 'NOT_SUBMITTED',
      });

      await expect(
        service.submitKyc('user-id', {
          legalName: 'John Doe',
          dateOfBirth: '1990-01-15',
          homeAddress: '123 Main St',
          governmentIdType: GovernmentIdType.PASSPORT,
          governmentIdNumber: 'INVALID@123', // Contains invalid character @
          governmentIdFrontUrl: 'https://example.com/id-front.jpg',
          selfieUrl: 'https://example.com/selfie.jpg',
          paymentMethodType: PaymentMethodType.UPI,
          paymentMethodLast4: '1234',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getKycStatus', () => {
    it('should return KYC status for user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        kycStatus: 'VERIFIED',
        kycLegalName: 'John Doe',
        kycGovernmentIdType: 'PASSPORT',
        kycVerifiedAt: new Date(),
        kycRejectionReason: null,
        kycSubmissionCount: 1,
      });

      const result = await service.getKycStatus('user-id');

      expect(result.status).toBe('VERIFIED');
      expect(result.legalName).toBe('John Doe');
      expect(result.submissionCount).toBe(1);
    });

    it('should throw for non-existent user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.getKycStatus('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('approveKyc', () => {
    it('should approve KYC for admin', async () => {
      mockPrismaService.user.findUnique
        .mockResolvedValueOnce({ role: UserRole.ADMIN })
        .mockResolvedValueOnce({
          id: 'user-id',
          email: 'test@example.com',
          kycStatus: 'PENDING',
        });
      mockPrismaService.user.update.mockResolvedValue({});

      const result = await service.approveKyc('admin-id', 'user-id');

      expect(result.success).toBe(true);
      expect(result.message).toBe('KYC verification approved successfully');
    });

    it('should reject approval for non-admin', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        role: UserRole.USER,
      });

      await expect(service.approveKyc('user-id', 'user-id')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('rejectKyc', () => {
    it('should reject KYC with reason for admin', async () => {
      mockPrismaService.user.findUnique
        .mockResolvedValueOnce({ role: UserRole.SUPER_ADMIN })
        .mockResolvedValueOnce({
          id: 'user-id',
          email: 'test@example.com',
          kycStatus: 'PENDING',
        });
      mockPrismaService.user.update.mockResolvedValue({});

      const result = await service.rejectKyc('admin-id', 'user-id', 'Blurry document');

      expect(result.success).toBe(true);
      expect(result.message).toBe('KYC verification rejected');
    });

    it('should reject KYC for already verified user', async () => {
      mockPrismaService.user.findUnique
        .mockResolvedValueOnce({ role: UserRole.SUPER_ADMIN })
        .mockResolvedValueOnce({
          id: 'user-id',
          email: 'test@example.com',
          kycStatus: 'VERIFIED',
        });

      await expect(service.rejectKyc('admin-id', 'user-id', 'Invalid document')).rejects.toThrow(BadRequestException);
    });
  });

  describe('getPendingKyc', () => {
    it('should return pending KYC list for admin', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ role: UserRole.ADMIN });
      mockPrismaService.user.findMany.mockResolvedValue([
        {
          id: 'user-1',
          email: 'user1@example.com',
          kycStatus: 'PENDING',
          kycLegalName: 'User One',
          kycSubmissionCount: 1,
          createdAt: new Date(),
        },
      ]);

      const result = await service.getPendingKyc('admin-id');

      expect(result).toHaveLength(1);
      expect(result[0].kycStatus).toBe('PENDING');
    });

    it('should reject access for non-admin', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ role: UserRole.USER });

      await expect(service.getPendingKyc('user-id')).rejects.toThrow(ForbiddenException);
    });
  });
});
