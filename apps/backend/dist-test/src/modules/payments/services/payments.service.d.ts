import { PrismaService } from '../../common/modules/prisma.service';
import { SubscriptionsService } from '../../subscriptions/services/subscriptions.service';
import { PaymentProvider, PaymentStatus, PaymentEntity } from '../entities/payment.entity';
interface CreatePaymentDto {
    userId: string;
    invoiceId?: string;
    provider: PaymentProvider;
    providerPaymentId: string;
    amount: number;
    currency?: string;
    metadata?: Record<string, unknown>;
}
export declare class PaymentsService {
    private readonly prisma;
    private readonly subscriptionsService;
    private readonly logger;
    constructor(prisma: PrismaService, subscriptionsService: SubscriptionsService);
    createPayment(dto: CreatePaymentDto): Promise<PaymentEntity>;
    getPaymentById(userId: string, paymentId: string): Promise<PaymentEntity>;
    getUserPayments(userId: string, page?: number, limit?: number): Promise<{
        data: {
            status: import(".prisma/client").$Enums.PaymentStatus;
            id: string;
            createdAt: Date;
            currency: string;
            userId: string;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            paidAt: Date | null;
            provider: import(".prisma/client").$Enums.PaymentProvider;
            providerPaymentId: string;
            invoiceId: string | null;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    updatePaymentStatus(providerPaymentId: string, status: PaymentStatus, metadata?: Record<string, unknown>): Promise<PaymentEntity | null>;
    processRefund(userId: string, paymentId: string): Promise<PaymentEntity>;
    getPaymentStats(userId: string): Promise<{
        totalSpent: string;
        totalPayments: number;
        successfulPayments: number;
        failedPayments: number;
        byProvider: {
            [k: string]: string;
        };
        byStatus: Record<PaymentStatus, number>;
    }>;
}
export {};
