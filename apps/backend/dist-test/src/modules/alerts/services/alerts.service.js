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
var AlertsService_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/modules/prisma.service");
const redis_service_1 = require("../../common/modules/redis.service");
const notifications_service_1 = require("../../notifications/services/notifications.service");
const alert_entity_1 = require("../entities/alert.entity");
const logger_service_1 = require("../../common/modules/logger.service");
let AlertsService = AlertsService_1 = class AlertsService {
    constructor(prisma, redisService, notificationsService) {
        this.prisma = prisma;
        this.redisService = redisService;
        this.notificationsService = notificationsService;
        this.logger = new logger_service_1.LoggerService(AlertsService_1.name);
    }
    async getUserAlerts(userId) {
        return this.prisma.alert.findMany({
            where: { userId },
            include: { wallet: { select: { address: true, chain: true, label: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getAlertById(userId, alertId) {
        const alert = await this.prisma.alert.findFirst({
            where: { id: alertId, userId },
        });
        if (!alert) {
            throw new common_1.NotFoundException('Alert not found');
        }
        return alert;
    }
    async createAlert(userId, dto) {
        const alert = await this.prisma.alert.create({
            data: {
                userId,
                walletId: dto.walletId,
                type: dto.type,
                condition: dto.condition,
                status: alert_entity_1.AlertStatus.ACTIVE,
            },
        });
        this.logger.log(`Alert created: ${alert.id} for user ${userId}`, 'AlertsService');
        return alert;
    }
    async updateAlert(userId, alertId, updates) {
        const alert = await this.getAlertById(userId, alertId);
        const updated = await this.prisma.alert.update({
            where: { id: alertId },
            data: {
                status: updates.status || alert.status,
                condition: updates.condition || alert.condition,
            },
        });
        return updated;
    }
    async pauseAlert(userId, alertId) {
        return this.updateAlert(userId, alertId, { status: alert_entity_1.AlertStatus.PAUSED });
    }
    async resumeAlert(userId, alertId) {
        return this.updateAlert(userId, alertId, { status: alert_entity_1.AlertStatus.ACTIVE });
    }
    async deleteAlert(userId, alertId) {
        await this.getAlertById(userId, alertId);
        await this.prisma.alert.delete({ where: { id: alertId } });
        this.logger.log(`Alert deleted: ${alertId}`, 'AlertsService');
    }
    async evaluateAlerts(alertId, data) {
        const alert = await this.prisma.alert.findUnique({
            where: { id: alertId },
        });
        if (!alert || alert.status !== alert_entity_1.AlertStatus.ACTIVE) {
            return false;
        }
        const condition = alert.condition;
        const currentValue = data[condition.field];
        if (currentValue === undefined || currentValue === null) {
            return false;
        }
        const triggered = this.evaluateCondition(currentValue, condition.operator, condition.value);
        if (triggered) {
            await this.triggerAlert(alert);
        }
        return triggered;
    }
    async evaluateAllUserAlerts(userId, data) {
        const alerts = await this.prisma.alert.findMany({
            where: { userId, status: alert_entity_1.AlertStatus.ACTIVE },
        });
        for (const alert of alerts) {
            await this.evaluateAlerts(alert.id, data);
        }
    }
    async triggerAlert(alert) {
        await this.prisma.alert.update({
            where: { id: alert.id },
            data: {
                status: alert_entity_1.AlertStatus.TRIGGERED,
                lastTriggeredAt: new Date(),
                triggerCount: { increment: 1 },
            },
        });
        await this.notificationsService.createNotification({
            userId: alert.userId,
            alertId: alert.id,
            type: 'ALERT',
            title: this.getAlertTitle(alert.type),
            message: this.getAlertMessage(alert.type),
        });
        this.logger.log(`Alert triggered: ${alert.id}`, 'AlertsService');
    }
    evaluateCondition(current, operator, target) {
        if (typeof current !== 'number' || typeof target !== 'number') {
            return String(current) === String(target);
        }
        switch (operator) {
            case '>':
                return current > target;
            case '<':
                return current < target;
            case '>=':
                return current >= target;
            case '<=':
                return current <= target;
            case '==':
                return current === target;
            case '!=':
                return current !== target;
            default:
                return false;
        }
    }
    getAlertTitle(type) {
        const titles = {
            [alert_entity_1.AlertType.PRICE]: 'Price Alert',
            [alert_entity_1.AlertType.WHALE_ACTIVITY]: 'Whale Activity Detected',
            [alert_entity_1.AlertType.LARGE_TRANSFER]: 'Large Transfer Detected',
            [alert_entity_1.AlertType.RISK]: 'Risk Alert',
            [alert_entity_1.AlertType.SECURITY]: 'Security Alert',
            [alert_entity_1.AlertType.BRIDGE]: 'Bridge Alert',
            [alert_entity_1.AlertType.GOVERNANCE]: 'Governance Alert',
            [alert_entity_1.AlertType.STAKING]: 'Staking Alert',
        };
        return titles[type];
    }
    getAlertMessage(type) {
        const messages = {
            [alert_entity_1.AlertType.PRICE]: 'A price alert you set has been triggered.',
            [alert_entity_1.AlertType.WHALE_ACTIVITY]: 'Whale activity detected in your watchlist.',
            [alert_entity_1.AlertType.LARGE_TRANSFER]: 'A large transfer has been detected.',
            [alert_entity_1.AlertType.RISK]: 'A risk condition has been detected in your portfolio.',
            [alert_entity_1.AlertType.SECURITY]: 'A security-related alert has been triggered.',
            [alert_entity_1.AlertType.BRIDGE]: 'A bridge transaction has been detected.',
            [alert_entity_1.AlertType.GOVERNANCE]: 'A governance-related alert has been triggered.',
            [alert_entity_1.AlertType.STAKING]: 'A staking-related alert has been triggered.',
        };
        return messages[type];
    }
};
exports.AlertsService = AlertsService;
exports.AlertsService = AlertsService = AlertsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object, redis_service_1.RedisService,
        notifications_service_1.NotificationsService])
], AlertsService);
//# sourceMappingURL=alerts.service.js.map