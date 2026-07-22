// @ts-nocheck
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../common/modules/prisma.service';
import { RedisService } from '../../common/modules/redis.service';
import { NotificationEntity, NotificationType, CreateNotificationDto } from '../entities/notification.entity';
import { LoggerService } from '../../common/modules/logger.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new LoggerService();

  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  async getUserNotifications(userId: string, page = 1, limit = 20) {
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

  async getNotificationById(userId: string, notificationId: string): Promise<NotificationEntity> {
    const notification = await this.prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return notification as any;
  }

  async createNotification(dto: CreateNotificationDto): Promise<NotificationEntity> {
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

    return notification as any;
  }

  async markAsRead(userId: string, notificationId: string): Promise<NotificationEntity> {
    await this.getNotificationById(userId, notificationId);

    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });

    this.logger.log(`All notifications marked as read for user ${userId}`, 'NotificationsService');
  }

  async deleteNotification(userId: string, notificationId: string): Promise<void> {
    await this.getNotificationById(userId, notificationId);
    await this.prisma.notification.delete({ where: { id: notificationId } });
    this.logger.log(`Notification deleted: ${notificationId}`, 'NotificationsService');
  }

  async deleteAllNotifications(userId: string): Promise<void> {
    await this.prisma.notification.deleteMany({ where: { userId } });
    this.logger.log(`All notifications deleted for user ${userId}`, 'NotificationsService');
  }

  async getUnreadCount(userId: string): Promise<{ count: number }> {
    const count = await this.prisma.notification.count({
      where: { userId, isRead: false },
    });
    return { count };
  }

  private async sendPushNotification(userId: string, title: string, message: string): Promise<void> {
    const key = `push:user:${userId}`;
    const notification = JSON.stringify({ userId, title, message, timestamp: new Date().toISOString() });
    await this.redisService.getClient().lpush(key, notification);
    await this.redisService.getClient().ltrim(key, 0, 99);
  }

  private async sendEmailNotification(userId: string, title: string, message: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    });

    if (!user?.email) {
      return;
    }

    try {
      await this.redisService.getClient().lpush(
        'email:queue',
        JSON.stringify({
          to: user.email,
          subject: title,
          body: message,
          userId,
        }),
      );
    } catch (error) {
      this.logger.warn(`Failed to queue email notification: ${error.message}`, 'NotificationsService');
    }
  }
}
