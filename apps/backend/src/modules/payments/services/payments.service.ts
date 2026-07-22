// @ts-nocheck
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../common/modules/prisma.service';
import { SubscriptionsService } from '../../subscriptions/services/subscriptions.service';
import { PaymentProvider, PaymentStatus, InvoiceStatus, PaymentEntity } from '../entities/payment.entity';
import { LoggerService } from '../../common/modules/logger.service';

interface CreatePaymentDto {
  userId: string;
  invoiceId?: string;
  provider: PaymentProvider;
  providerPaymentId: string;
  amount: number;
  currency?: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class PaymentsService {
  private readonly logger = new LoggerService();

  constructor(
    private readonly prisma: PrismaService,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  async createPayment(dto: CreatePaymentDto): Promise<PaymentEntity> {
    const payment = await this.prisma.payment.create({
      data: {
        userId: dto.userId,
        invoiceId: dto.invoiceId,
        provider: dto.provider,
        providerPaymentId: dto.providerPaymentId,
        amount: dto.amount.toFixed(2),
        currency: dto.currency || 'USD',
// @ts-ignore
        status: PaymentStatus.PENDING,
        metadata: dto.metadata,
      },
    });

    this.logger.log(`Payment created: ${payment.id} for user ${dto.userId}`, 'PaymentsService');

    // @ts-ignore
    return payment;
  }

  async getPaymentById(userId: string, paymentId: string): Promise<PaymentEntity> {
    const payment = await this.prisma.payment.findFirst({
      where: { id: paymentId, userId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // @ts-ignore
    return payment;
  }

  async getUserPayments(userId: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: offset,
// @ts-ignore
        take: limit,
      }),
      this.prisma.payment.count({ where: { userId } }),
    ]);

    return {
      data: payments,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updatePaymentStatus(
    providerPaymentId: string,
    status: PaymentStatus,
    metadata?: Record<string, unknown>,
  ): Promise<PaymentEntity | null> {
    const payment = await this.prisma.payment.findFirst({
      where: { providerPaymentId },
      include: { invoice: true },
    });

    if (!payment) {
      return null;
    }

    const updated = await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status,
        paidAt: status === PaymentStatus.SUCCEEDED ? new Date() : undefined,
        metadata: metadata || payment.metadata,
      },
    });

    if (status === PaymentStatus.SUCCEEDED && payment.invoiceId) {
      await this.prisma.invoice.update({
        where: { id: payment.invoiceId },
        data: {
          status: InvoiceStatus.PAID,
          paidAt: new Date(),
        },
      });

      if (payment.invoice) {
        await this.subscriptionsService.createSubscription(
          payment.userId,
          payment.invoice.subscription.plan,
          payment.invoice.billingPeriodStart,
          payment.invoice.billingPeriodEnd,
        );
      }
    }

    return updated;
  }

  async processRefund(userId: string, paymentId: string): Promise<PaymentEntity> {
    const payment = await this.getPaymentById(userId, paymentId);

    if (payment.status !== PaymentStatus.SUCCEEDED) {
      throw new BadRequestException('Only succeeded payments can be refunded');
    }

    const refunded = await this.prisma.payment.update({
      where: { id: paymentId },
      data: { status: PaymentStatus.REFUNDED },
    });

    if (payment.invoiceId) {
      await this.prisma.invoice.update({
        where: { id: payment.invoiceId },
        data: { status: InvoiceStatus.VOID },
      });
    }

    this.logger.log(`Payment refunded: ${paymentId}`, 'PaymentsService');

    return refunded;
  }

  async getPaymentStats(userId: string) {
    const payments = await this.prisma.payment.findMany({
      where: { userId },
      select: { amount: true, status: true, createdAt: true, currency: true },
    });

    const totalSpent = payments
      .filter((p) => p.status === PaymentStatus.SUCCEEDED)
      .reduce((sum, p) => sum + parseFloat(p.amount), 0);

    const byProvider: Record<PaymentProvider, number> = {
      [PaymentProvider.RAZORPAY]: 0,
      [PaymentProvider.STRIPE]: 0,
      [PaymentProvider.CRYPTO]: 0,
    };

    const byStatus: Record<PaymentStatus, number> = {
      [PaymentStatus.PENDING]: 0,
      [PaymentStatus.SUCCEEDED]: 0,
      [PaymentStatus.FAILED]: 0,
      [PaymentStatus.CANCELED]: 0,
      [PaymentStatus.REFUNDED]: 0,
    };

    for (const payment of payments) {
      byProvider[payment.provider] += parseFloat(payment.amount);
      byStatus[payment.status] += 1;
    }

    return {
      totalSpent: totalSpent.toFixed(2),
      totalPayments: payments.length,
      successfulPayments: byStatus[PaymentStatus.SUCCEEDED],
      failedPayments: byStatus[PaymentStatus.FAILED],
      byProvider: Object.fromEntries(
        Object.entries(byProvider).map(([key, value]) => [key, value.toFixed(2)]),
      ),
      byStatus,
    };
  }
}
