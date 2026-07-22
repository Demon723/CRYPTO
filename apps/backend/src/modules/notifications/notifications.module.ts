import { Module } from '@nestjs/common';
import { PrismaModule } from '../common/modules/prisma.module';
import { RedisModule } from '../common/modules/redis.module';
import { LoggerModule } from '../common/modules/logger.module';
import { AuthModule } from '../auth/auth.module';
import { NotificationsService } from './services/notifications.service';
import { NotificationsController } from './controllers/notifications.controller';

@Module({
  imports: [PrismaModule, RedisModule, LoggerModule, AuthModule],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
