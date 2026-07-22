export declare enum NotificationType {
    ALERT = "ALERT",
    SYSTEM = "SYSTEM",
    SOCIAL = "SOCIAL",
    MARKETING = "MARKETING"
}
export interface NotificationEntity {
    id: string;
    userId: string;
    alertId?: string;
    type: NotificationType;
    title: string;
    message: string;
    data?: Record<string, unknown>;
    isRead: boolean;
    readAt?: Date;
    createdAt: Date;
}
export interface CreateNotificationDto {
    userId: string;
    alertId?: string;
    type: NotificationType;
    title: string;
    message: string;
    data?: Record<string, unknown>;
}
