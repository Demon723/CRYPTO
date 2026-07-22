import { PrismaService } from '../../common/modules/prisma.service';
import { RedisService } from '../../common/modules/redis.service';
import { NotificationEntity, CreateNotificationDto } from '../entities/notification.entity';
export declare class NotificationsService {
    private readonly prisma;
    private readonly redisService;
    private readonly logger;
    constructor(prisma: PrismaService, redisService: RedisService);
    getUserNotifications(userId: string, page?: number, limit?: number): Promise<{
        data: {
            message: string;
            type: import(".prisma/client").$Enums.NotificationType;
            data: import("@prisma/client/runtime/library").JsonValue | null;
            id: string;
            createdAt: Date;
            userId: string;
            alertId: string | null;
            title: string;
            isRead: boolean;
            readAt: Date | null;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
            unreadCount: number;
        };
    }>;
    getNotificationById(userId: string, notificationId: string): Promise<NotificationEntity>;
    createNotification(dto: CreateNotificationDto): Promise<NotificationEntity>;
    markAsRead(userId: string, notificationId: string): Promise<NotificationEntity>;
    markAllAsRead(userId: string): Promise<void>;
    deleteNotification(userId: string, notificationId: string): Promise<void>;
    deleteAllNotifications(userId: string): Promise<void>;
    getUnreadCount(userId: string): Promise<{
        count: number;
    }>;
    private sendPushNotification;
    private sendEmailNotification;
}
