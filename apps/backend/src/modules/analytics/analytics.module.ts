import { Module } from '@nestjs/common';
import { AnalyticsController } from './controllers/analytics.controller';
import { AnalyticsService } from './services/analytics.service';
import { RiskService } from './services/risk.service';
import { PrismaModule } from '../common/modules/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsService, RiskService],
  exports: [AnalyticsService, RiskService],
})
export class AnalyticsModule {}
