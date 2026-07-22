import { AlertsService } from '../services/alerts.service';
import { CreateAlertDto } from '../entities/alert.entity';
export declare class AlertsController {
    private readonly alertsService;
    constructor(alertsService: AlertsService);
    getUserAlerts(userId: string): Promise<import("../entities/alert.entity").AlertEntity[]>;
    getAlert(userId: string, alertId: string): Promise<import("../entities/alert.entity").AlertEntity>;
    createAlert(userId: string, dto: CreateAlertDto): Promise<import("../entities/alert.entity").AlertEntity>;
    pauseAlert(userId: string, alertId: string): Promise<import("../entities/alert.entity").AlertEntity>;
    resumeAlert(userId: string, alertId: string): Promise<import("../entities/alert.entity").AlertEntity>;
    deleteAlert(userId: string, alertId: string): Promise<void>;
}
