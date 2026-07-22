"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PaymentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/modules/prisma.service");
const subscriptions_service_1 = require("../../subscriptions/services/subscriptions.service");
const payment_entity_1 = require("../entities/payment.entity");
const logger_service_1 = require("../../common/modules/logger.service");
let PaymentsService = PaymentsService_1 = class PaymentsService {
    constructor(prisma, subscriptionsService) {
        this.prisma = prisma;
        this.subscriptionsService = subscriptionsService;
        this.logger = new logger_service_1.LoggerService(PaymentsService_1.name);
    }
    async createPayment(dto) {
        const payment = await this.prisma.payment.create({
            data: {
                userId: dto.userId,
                invoiceId: dto.invoiceId,
                provider: dto.provider,
                providerPaymentId: dto.providerPaymentId,
                amount: dto.amount.toFixed(2),
                currency: dto.currency || 'USD',
                status: payment_entity_1.PaymentStatus.PENDING,
                metadata: dto.metadata,
            },
        });
        this.logger.log(`Payment created: ${payment.id} for user ${dto.userId}`, 'PaymentsService');
        return payment;
    }
    async getPaymentById(userId, paymentId) {
        const payment = await this.prisma.payment.findFirst({
            where: { id: paymentId, userId },
        });
        if (!payment) {
            throw new common_1.NotFoundException('Payment not found');
        }
        return payment;
    }
    async getUserPayments(userId, page = 1, limit = 20) {
        const offset = (page - 1) * limit;
        const [payments, total] = await Promise.all([
            this.prisma.payment.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                skip: offset,
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
    async updatePaymentStatus(providerPaymentId, status, metadata) {
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
                paidAt: status === payment_entity_1.PaymentStatus.SUCCEEDED ? new Date() : undefined,
                metadata: metadata || payment.metadata,
            },
        });
        if (status === payment_entity_1.PaymentStatus.SUCCEEDED && payment.invoiceId) {
            await this.prisma.invoice.update({
                where: { id: payment.invoiceId },
                data: {
                    status: payment_entity_1.InvoiceStatus.PAID,
                    paidAt: new Date(),
                },
            });
            if (payment.invoice) {
                await this.subscriptionsService.createSubscription(payment.userId, payment.invoice.subscription.plan, payment.invoice.billingPeriodStart, payment.invoice.billingPeriodEnd);
            }
        }
        return updated;
    }
    async processRefund(userId, paymentId) {
        const payment = await this.getPaymentById(userId, paymentId);
        if (payment.status !== payment_entity_1.PaymentStatus.SUCCEEDED) {
            throw new common_1.BadRequestException('Only succeeded payments can be refunded');
        }
        const refunded = await this.prisma.payment.update({
            where: { id: paymentId },
            data: { status: payment_entity_1.PaymentStatus.REFUNDED },
        });
        if (payment.invoiceId) {
            await this.prisma.invoice.update({
                where: { id: payment.invoiceId },
                data: { status: payment_entity_1.InvoiceStatus.VOID },
            });
        }
        this.logger.log(`Payment refunded: ${paymentId}`, 'PaymentsService');
        return refunded;
    }
    async getPaymentStats(userId) {
        const payments = await this.prisma.payment.findMany({
            where: { userId },
            select: { amount: true, status: true, createdAt: true, currency: true },
        });
        const totalSpent = payments
            .filter((p) => p.status === payment_entity_1.PaymentStatus.SUCCEEDED)
            .reduce((sum, p) => sum + parseFloat(p.amount), 0);
        const byProvider = {
            [payment_entity_1.PaymentProvider.RAZORPAY]: 0,
            [payment_entity_1.PaymentProvider.STRIPE]: 0,
            [payment_entity_1.PaymentProvider.CRYPTO]: 0,
        };
        const byStatus = {
            [payment_entity_1.PaymentStatus.PENDING]: 0,
            [payment_entity_1.PaymentStatus.SUCCEEDED]: 0,
            [payment_entity_1.PaymentStatus.FAILED]: 0,
            [payment_entity_1.PaymentStatus.CANCELED]: 0,
            [payment_entity_1.PaymentStatus.REFUNDED]: 0,
        };
        for (const payment of payments) {
            byProvider[payment.provider] += parseFloat(payment.amount);
            byStatus[payment.status] += 1;
        }
        return {
            totalSpent: totalSpent.toFixed(2),
            totalPayments: payments.length,
            successfulPayments: byStatus[payment_entity_1.PaymentStatus.SUCCEEDED],
            failedPayments: byStatus[payment_entity_1.PaymentStatus.FAILED],
            byProvider: Object.fromEntries(Object.entries(byProvider).map(([key, value]) => [key, value.toFixed(2)])),
            byStatus,
        };
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = PaymentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        subscriptions_service_1.SubscriptionsService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map