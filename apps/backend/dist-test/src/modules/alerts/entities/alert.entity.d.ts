export declare enum AlertType {
    PRICE = "PRICE",
    WHALE_ACTIVITY = "WHALE_ACTIVITY",
    LARGE_TRANSFER = "LARGE_TRANSFER",
    RISK = "RISK",
    SECURITY = "SECURITY",
    BRIDGE = "BRIDGE",
    GOVERNANCE = "GOVERNANCE",
    STAKING = "STAKING"
}
export declare enum AlertStatus {
    ACTIVE = "ACTIVE",
    PAUSED = "PAUSED",
    TRIGGERED = "TRIGGERED",
    DISABLED = "DISABLED"
}
export declare enum NotificationType {
    ALERT = "ALERT",
    SYSTEM = "SYSTEM",
    SOCIAL = "SOCIAL",
    MARKETING = "MARKETING"
}
export interface AlertEntity {
    id: string;
    userId: string;
    walletId?: string;
    type: AlertType;
    condition: Record<string, unknown>;
    status: AlertStatus;
    lastTriggeredAt?: Date;
    triggerCount: number;
    createdAt: Date;
    updatedAt: Date;
}
export interface CreateAlertDto {
    type: AlertType;
    condition: Record<string, unknown>;
    walletId?: string;
}
export interface AlertCondition {
    field: string;
    operator: '>' | '<' | '>=' | '<=' | '==' | '!=';
    value: number | string;
}
