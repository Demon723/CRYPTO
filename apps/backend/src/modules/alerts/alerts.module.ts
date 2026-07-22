import { Module } from '@nestjs/common';
import { PrismaModule } from '../common/modules/prisma.module';
import { RedisModule } from '../common/modules/redis.module';
import { LoggerModule } from '../common/modules/logger.module';
import { AuthModule } from '../auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AlertsService } from './services/alerts.service';
import { AlertsController } from './controllers/alerts.controller';

@Module({
  imports: [PrismaModule, RedisModule, LoggerModule, AuthModule, NotificationsModule],
  controllers: [AlertsController],
  providers: [AlertsService],
  exports: [AlertsService],
})
export class AlertsModule {}
