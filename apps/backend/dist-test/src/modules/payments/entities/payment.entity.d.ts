export declare enum PaymentProvider {
    RAZORPAY = "RAZORPAY",
    STRIPE = "STRIPE",
    CRYPTO = "CRYPTO"
}
export declare enum PaymentStatus {
    PENDING = "PENDING",
    SUCCEEDED = "SUCCEEDED",
    FAILED = "FAILED",
    CANCELED = "CANCELED",
    REFUNDED = "REFUNDED"
}
export declare enum InvoiceStatus {
    DRAFT = "DRAFT",
    OPEN = "OPEN",
    PAID = "PAID",
    VOID = "VOID",
    UNCOLLECTIBLE = "UNCOLLECTIBLE"
}
export interface PaymentEntity {
    id: string;
    userId: string;
    invoiceId?: string;
    provider: PaymentProvider;
    providerPaymentId: string;
    amount: string;
    currency: string;
    status: PaymentStatus;
    metadata?: Record<string, unknown>;
    paidAt?: Date;
    createdAt: Date;
}
export interface InvoiceEntity {
    id: string;
    subscriptionId: string;
    userId: string;
    amount: string;
    currency: string;
    status: InvoiceStatus;
    paymentMethod?: string;
    transactionId?: string;
    billingPeriodStart: Date;
    billingPeriodEnd: Date;
    paidAt?: Date;
    createdAt: Date;
}
