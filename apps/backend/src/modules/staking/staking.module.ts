import { Module } from '@nestjs/common';
import { PrismaModule } from '../common/modules/prisma.module';
import { LoggerModule } from '../common/modules/logger.module';
import { AuthModule } from '../auth/auth.module';
import { StakingService } from './services/staking.service';
import { StakingController } from './controllers/staking.controller';

@Module({
  imports: [PrismaModule, LoggerModule, AuthModule],
  controllers: [StakingController],
  providers: [StakingService],
  exports: [StakingService],
})
export class StakingModule {}
