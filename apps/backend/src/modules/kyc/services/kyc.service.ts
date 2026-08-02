import { Injectable, NotFoundException, BadRequestException, Logger, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/modules/prisma.service';
import { UserRole } from '../../../common/enums';
import { KycStatus, GovernmentIdType, PaymentMethodType, KycSubmission } from '../entities/kyc.entity';

@Injectable()
export class KycService {
  private readonly logger = new Logger(KycService.name);
  private readonly minimumAge = 18;

  constructor(private readonly prisma: PrismaService) {}

  async submitKyc(userId: string, dto: KycSubmission): Promise<{ success: boolean; message: string; status: KycStatus }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true, kycStatus: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Only regular users can submit KYC
    if (user.role !== UserRole.USER) {
      throw new ForbiddenException('Only regular users can submit KYC verification');
    }

    // Validate age (must be 18+)
    const birthDate = new Date(dto.dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age < this.minimumAge) {
      throw new BadRequestException(`You must be at least ${this.minimumAge} years old to complete KYC verification`);
    }

    // Validate government ID number format based on type
    this.validateGovernmentId(dto.governmentIdType, dto.governmentIdNumber);

    // Update user with KYC data
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        kycStatus: KycStatus.PENDING,
        kycLegalName: dto.legalName,
        kycDateOfBirth: birthDate,
        kycHomeAddress: dto.homeAddress,
        kycGovernmentIdType: dto.governmentIdType,
        kycGovernmentIdNumber: dto.governmentIdNumber,
        kycGovernmentIdFrontUrl: dto.governmentIdFrontUrl,
        kycGovernmentIdBackUrl: dto.governmentIdBackUrl || null,
        kycSelfieUrl: dto.selfieUrl,
        kycProofOfAddressUrl: dto.proofOfAddressUrl || null,
        kycPaymentMethodType: dto.paymentMethodType,
        kycPaymentMethodLast4: dto.paymentMethodLast4,
        kycSubmissionCount: { increment: 1 },
      },
    });

    this.logger.log(`KYC submitted for user ${userId} (${user.email})`, 'KycService');

    // In production, trigger automated verification workflow here
    // e.g., send to identity verification provider, AI fraud detection, etc.

    return {
      success: true,
      message: 'KYC verification submitted successfully. Verification typically takes 1-3 business days.',
      status: KycStatus.PENDING,
    };
  }

  async getKycStatus(userId: string): Promise<{
    status: KycStatus;
    legalName?: string;
    governmentIdType?: GovernmentIdType;
    verifiedAt?: Date;
    rejectionReason?: string;
    submissionCount: number;
  }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        kycStatus: true,
        kycLegalName: true,
        kycGovernmentIdType: true,
        kycVerifiedAt: true,
        kycRejectionReason: true,
        kycSubmissionCount: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      status: user.kycStatus as KycStatus,
      legalName: user.kycLegalName || undefined,
      governmentIdType: user.kycGovernmentIdType as GovernmentIdType | undefined,
      verifiedAt: user.kycVerifiedAt || undefined,
      rejectionReason: user.kycRejectionReason || undefined,
      submissionCount: user.kycSubmissionCount,
    };
  }

  async approveKyc(adminId: string, userId: string): Promise<{ success: boolean; message: string }> {
    // Verify admin permissions
    const admin = await this.prisma.user.findUnique({
      where: { id: adminId },
      select: { role: true },
    });

    if (!admin || (admin.role !== UserRole.ADMIN && admin.role !== UserRole.SUPER_ADMIN)) {
      throw new ForbiddenException('Only admins can approve KYC verification');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, kycStatus: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.kycStatus === KycStatus.VERIFIED) {
      return { success: true, message: 'User is already verified' };
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        kycStatus: KycStatus.VERIFIED,
        kycVerifiedAt: new Date(),
        kycRejectionReason: null,
      },
    });

    this.logger.log(`KYC approved for user ${userId} by admin ${adminId}`, 'KycService');

    return { success: true, message: 'KYC verification approved successfully' };
  }

  async rejectKyc(adminId: string, userId: string, reason: string): Promise<{ success: boolean; message: string }> {
    // Verify admin permissions
    const admin = await this.prisma.user.findUnique({
      where: { id: adminId },
      select: { role: true },
    });

    if (!admin || (admin.role !== UserRole.ADMIN && admin.role !== UserRole.SUPER_ADMIN)) {
      throw new ForbiddenException('Only admins can reject KYC verification');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, kycStatus: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.kycStatus === KycStatus.VERIFIED) {
      throw new BadRequestException('Cannot reject KYC for already verified user');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        kycStatus: KycStatus.REJECTED,
        kycRejectionReason: reason,
      },
    });

    this.logger.log(`KYC rejected for user ${userId} by admin ${adminId}: ${reason}`, 'KycService');

    return { success: true, message: 'KYC verification rejected' };
  }

  async getPendingKyc(adminId: string): Promise<any[]> {
    // Verify admin permissions
    const admin = await this.prisma.user.findUnique({
      where: { id: adminId },
      select: { role: true },
    });

    if (!admin || (admin.role !== UserRole.ADMIN && admin.role !== UserRole.SUPER_ADMIN)) {
      throw new ForbiddenException('Only admins can view pending KYC submissions');
    }

    const pendingUsers = await this.prisma.user.findMany({
      where: { kycStatus: KycStatus.PENDING },
      select: {
        id: true,
        email: true,
        kycLegalName: true,
        kycDateOfBirth: true,
        kycHomeAddress: true,
        kycGovernmentIdType: true,
        kycGovernmentIdNumber: true,
        kycGovernmentIdFrontUrl: true,
        kycGovernmentIdBackUrl: true,
        kycSelfieUrl: true,
        kycProofOfAddressUrl: true,
        kycPaymentMethodType: true,
        kycPaymentMethodLast4: true,
        kycSubmissionCount: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    return pendingUsers;
  }

  private validateGovernmentId(type: GovernmentIdType, number: string): void {
    // Basic validation rules based on ID type
    const cleaned = number.replace(/\s/g, '').toUpperCase();

    switch (type) {
      case GovernmentIdType.PASSPORT:
        if (!/^[A-Z0-9]{6,15}$/.test(cleaned)) {
          throw new BadRequestException('Invalid passport number format');
        }
        break;
      case GovernmentIdType.DRIVING_LICENSE:
        if (!/^[A-Z0-9]{5,20}$/.test(cleaned)) {
          throw new BadRequestException('Invalid driving license number format');
        }
        break;
      case GovernmentIdType.NATIONAL_ID:
        if (!/^[A-Z0-9]{5,20}$/.test(cleaned)) {
          throw new BadRequestException('Invalid national ID number format');
        }
        break;
    }
  }
}
