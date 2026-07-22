import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../common/modules/prisma.service';
import { RedisService } from '../../common/modules/redis.service';
import { NotificationsService } from '../../notifications/services/notifications.service';
import { AlertEntity, AlertStatus, AlertType, CreateAlertDto } from '../entities/alert.entity';
import { NotificationType } from '../../notifications/entities/notification.entity';
import { LoggerService } from '../../common/modules/logger.service';

@Injectable()
export class AlertsService {
  private readonly logger = new LoggerService();

  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async getUserAlerts(userId: string): Promise<AlertEntity[]> {
    const alerts = await this.prisma.alert.findMany({
      where: { userId },
      include: { wallet: { select: { address: true, chain: true, label: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return alerts.map(alert => this.mapToEntity(alert));
  }

  async getAlertById(userId: string, alertId: string): Promise<AlertEntity> {
    const alert = await this.prisma.alert.findFirst({
      where: { id: alertId, userId },
    });

    if (!alert) {
      throw new NotFoundException('Alert not found');
    }

    return this.mapToEntity(alert);
  }

  async createAlert(userId: string, dto: CreateAlertDto) {
    const alert = await this.prisma.alert.create({
      data: {
        userId,
        walletId: dto.walletId,
        type: dto.type,
        condition: JSON.stringify(dto.condition),
        status: AlertStatus.ACTIVE,
      },
    });

    this.logger.log(`Alert created: ${alert.id} for user ${userId}`, 'AlertsService');

    return this.mapToEntity(alert);
  }

  async updateAlert(userId: string, alertId: string, updates: { status?: AlertStatus; condition?: Record<string, unknown> }) {
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

  async pauseAlert(userId: string, alertId: string): Promise<any> {
    return this.updateAlert(userId, alertId, { status: AlertStatus.PAUSED });
  }

  async resumeAlert(userId: string, alertId: string): Promise<any> {
    return this.updateAlert(userId, alertId, { status: AlertStatus.ACTIVE });
  }

  async deleteAlert(userId: string, alertId: string): Promise<void> {
    await this.getAlertById(userId, alertId);
    await this.prisma.alert.delete({ where: { id: alertId } });
    this.logger.log(`Alert deleted: ${alertId}`, 'AlertsService');
  }

  async evaluateAlerts(alertId: string, data: Record<string, unknown>): Promise<boolean> {
    const alert = await this.prisma.alert.findUnique({
      where: { id: alertId },
    });

    if (!alert || alert.status !== AlertStatus.ACTIVE) {
      return false;
    }

    const condition = typeof alert.condition === 'string' ? JSON.parse(alert.condition) : alert.condition;
    const currentValue = data[condition.field];

    if (currentValue === undefined || currentValue === null) {
      return false;
    }

    const triggered = this.evaluateCondition(currentValue, condition.operator, condition.value);

    if (triggered) {
      await this.triggerAlert(this.mapToEntity(alert));
    }

    return triggered;
  }

  async evaluateAllUserAlerts(userId: string, data: Record<string, unknown>): Promise<void> {
    const alerts = await this.prisma.alert.findMany({
      where: { userId, status: AlertStatus.ACTIVE },
    });

    for (const alert of alerts) {
      await this.evaluateAlerts(alert.id, data);
    }
  }

  private async triggerAlert(alert: AlertEntity): Promise<void> {
    await this.prisma.alert.update({
      where: { id: alert.id },
      data: {
        status: AlertStatus.TRIGGERED,
        lastTriggeredAt: new Date(),
        triggerCount: { increment: 1 },
      },
    });

    await this.notificationsService.createNotification({
      userId: alert.userId,
      alertId: alert.id,
      type: NotificationType.ALERT,
      title: this.getAlertTitle(alert.type),
      message: this.getAlertMessage(alert.type),
    });

    this.logger.log(`Alert triggered: ${alert.id}`, 'AlertsService');
  }

  private evaluateCondition(current: unknown, operator: string, target: unknown): boolean {
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

  private getAlertTitle(type: AlertType): string {
    const titles: Record<AlertType, string> = {
      [AlertType.PRICE]: 'Price Alert',
      [AlertType.WHALE_ACTIVITY]: 'Whale Activity Detected',
      [AlertType.LARGE_TRANSFER]: 'Large Transfer Detected',
      [AlertType.RISK]: 'Risk Alert',
      [AlertType.SECURITY]: 'Security Alert',
      [AlertType.BRIDGE]: 'Bridge Alert',
      [AlertType.GOVERNANCE]: 'Governance Alert',
      [AlertType.STAKING]: 'Staking Alert',
    };
    return titles[type];
  }

  private getAlertMessage(type: AlertType): string {
    const messages: Record<AlertType, string> = {
      [AlertType.PRICE]: 'A price alert you set has been triggered.',
      [AlertType.WHALE_ACTIVITY]: 'Whale activity detected in your watchlist.',
      [AlertType.LARGE_TRANSFER]: 'A large transfer has been detected.',
      [AlertType.RISK]: 'A risk condition has been detected in your portfolio.',
      [AlertType.SECURITY]: 'A security-related alert has been triggered.',
      [AlertType.BRIDGE]: 'A bridge transaction has been detected.',
      [AlertType.GOVERNANCE]: 'A governance-related alert has been triggered.',
      [AlertType.STAKING]: 'A staking-related alert has been triggered.',
    };
    return messages[type];
  }

  private mapToEntity(alert: {
    id: string;
    userId: string;
    walletId?: string;
    type: string;
    condition: string;
    status: string;
    lastTriggeredAt?: Date;
    triggerCount: number;
    createdAt: Date;
    updatedAt: Date;
  }): AlertEntity {
    return {
      id: alert.id,
      userId: alert.userId,
      walletId: alert.walletId,
      type: alert.type as AlertType,
      condition: typeof alert.condition === 'string' ? JSON.parse(alert.condition) : alert.condition,
      status: alert.status as AlertStatus,
      lastTriggeredAt: alert.lastTriggeredAt,
      triggerCount: alert.triggerCount,
      createdAt: alert.createdAt,
      updatedAt: alert.updatedAt,
    };
  }
}
