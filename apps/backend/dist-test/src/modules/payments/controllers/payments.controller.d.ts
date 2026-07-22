import { PaymentsService } from '../services/payments.service';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    getUserPayments(userId: string, pagination: {
        page: number;
        limit: number;
    }): Promise<{
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
    getPayment(userId: string, paymentId: string): Promise<import("../entities/payment.entity").PaymentEntity>;
    getPaymentStats(userId: string): Promise<{
        totalSpent: string;
        totalPayments: number;
        successfulPayments: number;
        failedPayments: number;
        byProvider: {
            [k: string]: string;
        };
        byStatus: Record<import("../entities/payment.entity").PaymentStatus, number>;
    }>;
}
