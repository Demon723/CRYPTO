import { Module } from '@nestjs/common';
import { PrismaModule } from '../common/modules/prisma.module';
import { KycService } from './services/kyc.service';
import { KycController } from './controllers/kyc.controller';

@Module({
  imports: [PrismaModule],
  controllers: [KycController],
  providers: [KycService],
  exports: [KycService],
})
export class KycModule {}
