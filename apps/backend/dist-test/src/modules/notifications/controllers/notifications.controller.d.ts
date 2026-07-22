import { NotificationsService } from '../services/notifications.service';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    getUserNotifications(userId: string, pagination: {
        page: number;
        limit: number;
    }): Promise<{
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
    getUnreadCount(userId: string): Promise<{
        count: number;
    }>;
    markAsRead(userId: string, notificationId: string): Promise<import("../entities/notification.entity").NotificationEntity>;
    markAllAsRead(userId: string): Promise<void>;
    deleteNotification(userId: string, notificationId: string): Promise<void>;
    deleteAllNotifications(userId: string): Promise<void>;
}
