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
var NotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/modules/prisma.service");
const redis_service_1 = require("../../common/modules/redis.service");
const logger_service_1 = require("../../common/modules/logger.service");
let NotificationsService = NotificationsService_1 = class NotificationsService {
    constructor(prisma, redisService) {
        this.prisma = prisma;
        this.redisService = redisService;
        this.logger = new logger_service_1.LoggerService(NotificationsService_1.name);
    }
    async getUserNotifications(userId, page = 1, limit = 20) {
        const offset = (page - 1) * limit;
        const [notifications, total, unreadCount] = await Promise.all([
            this.prisma.notification.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                skip: offset,
                take: limit,
            }),
            this.prisma.notification.count({ where: { userId } }),
            this.prisma.notification.count({ where: { userId, isRead: false } }),
        ]);
        return {
            data: notifications,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                unreadCount,
            },
        };
    }
    async getNotificationById(userId, notificationId) {
        const notification = await this.prisma.notification.findFirst({
            where: { id: notificationId, userId },
        });
        if (!notification) {
            throw new common_1.NotFoundException('Notification not found');
        }
        return notification;
    }
    async createNotification(dto) {
        const notification = await this.prisma.notification.create({
            data: {
                userId: dto.userId,
                alertId: dto.alertId,
                type: dto.type,
                title: dto.title,
                message: dto.message,
                data: dto.data,
            },
        });
        await this.sendPushNotification(dto.userId, dto.title, dto.message);
        await this.sendEmailNotification(dto.userId, dto.title, dto.message);
        this.logger.log(`Notification created: ${notification.id}`, 'NotificationsService');
        return notification;
    }
    async markAsRead(userId, notificationId) {
        await this.getNotificationById(userId, notificationId);
        return this.prisma.notification.update({
            where: { id: notificationId },
            data: { isRead: true, readAt: new Date() },
        });
    }
    async markAllAsRead(userId) {
        await this.prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true, readAt: new Date() },
        });
        this.logger.log(`All notifications marked as read for user ${userId}`, 'NotificationsService');
    }
    async deleteNotification(userId, notificationId) {
        await this.getNotificationById(userId, notificationId);
        await this.prisma.notification.delete({ where: { id: notificationId } });
        this.logger.log(`Notification deleted: ${notificationId}`, 'NotificationsService');
    }
    async deleteAllNotifications(userId) {
        await this.prisma.notification.deleteMany({ where: { userId } });
        this.logger.log(`All notifications deleted for user ${userId}`, 'NotificationsService');
    }
    async getUnreadCount(userId) {
        const count = await this.prisma.notification.count({
            where: { userId, isRead: false },
        });
        return { count };
    }
    async sendPushNotification(userId, title, message) {
        const key = `push:user:${userId}`;
        const notification = JSON.stringify({ userId, title, message, timestamp: new Date().toISOString() });
        await this.redisService.getClient().lpush(key, notification);
        await this.redisService.getClient().ltrim(key, 0, 99);
    }
    async sendEmailNotification(userId, title, message) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { email: true, name: true },
        });
        if (!user?.email) {
            return;
        }
        try {
            await this.redisService.getClient().lpush('email:queue', JSON.stringify({
                to: user.email,
                subject: title,
                body: message,
                userId,
            }));
        }
        catch (error) {
            this.logger.warn(`Failed to queue email notification: ${error.message}`, 'NotificationsService');
        }
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = NotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map