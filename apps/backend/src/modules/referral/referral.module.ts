import { Module } from '@nestjs/common';
import { PrismaModule } from '../common/modules/prisma.module';
import { LoggerModule } from '../common/modules/logger.module';
import { AuthModule } from '../auth/auth.module';
import { ReferralService } from './services/referral.service';
import { ReferralController } from './controllers/referral.controller';

@Module({
  imports: [PrismaModule, LoggerModule, AuthModule],
  controllers: [ReferralController],
  providers: [ReferralService],
  exports: [ReferralService],
})
export class ReferralModule {}
