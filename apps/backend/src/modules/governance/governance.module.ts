import { Module } from '@nestjs/common';
import { GovernanceController } from './controllers/governance.controller';
import { GovernanceService } from './services/governance.service';
import { PrismaModule } from '../common/modules/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [GovernanceController],
  providers: [GovernanceService],
  exports: [GovernanceService],
})
export class GovernanceModule {}
