import { AlertType, AlertStatus } from '../../entities/alert.entity';
export declare class CreateAlertDto {
    type: AlertType;
    condition: Record<string, unknown>;
    walletId?: string;
}
export declare class UpdateAlertDto {
    status?: AlertStatus;
    condition?: Record<string, unknown>;
}
