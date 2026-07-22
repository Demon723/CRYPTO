import { PrismaService } from '../../../common/modules/prisma.service';
import { RedisService } from '../../common/modules/redis.service';
import { NotificationsService } from '../../notifications/services/notifications.service';
import { AlertEntity, AlertStatus, CreateAlertDto } from '../entities/alert.entity';
export declare class AlertsService {
    private readonly prisma;
    private readonly redisService;
    private readonly notificationsService;
    private readonly logger;
    constructor(prisma: PrismaService, redisService: RedisService, notificationsService: NotificationsService);
    getUserAlerts(userId: string): Promise<AlertEntity[]>;
    getAlertById(userId: string, alertId: string): Promise<AlertEntity>;
    createAlert(userId: string, dto: CreateAlertDto): Promise<AlertEntity>;
    updateAlert(userId: string, alertId: string, updates: {
        status?: AlertStatus;
        condition?: Record<string, unknown>;
    }): Promise<AlertEntity>;
    pauseAlert(userId: string, alertId: string): Promise<AlertEntity>;
    resumeAlert(userId: string, alertId: string): Promise<AlertEntity>;
    deleteAlert(userId: string, alertId: string): Promise<void>;
    evaluateAlerts(alertId: string, data: Record<string, unknown>): Promise<boolean>;
    evaluateAllUserAlerts(userId: string, data: Record<string, unknown>): Promise<void>;
    private triggerAlert;
    private evaluateCondition;
    private getAlertTitle;
    private getAlertMessage;
}
